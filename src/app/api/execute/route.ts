import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getExecutionOrder, getExecutionLevels, isValidDAG } from '@/lib/utils';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import type { Prisma } from '@prisma/client';
import { executeWorkflowSchema, parseBody } from '@/lib/validations';

// POST /api/execute - start a full workflow execution
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit check
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`execute:${clientIp}`, RATE_LIMITS.api);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.retryAfterMs / 1000)) } }
      );
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = parseBody(executeWorkflowSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { workflowId, nodes: rawNodes, edges: rawEdges } = parsed.data;
    // Cast to the shapes our helpers expect
    const nodes = rawNodes as unknown as { id: string; type: string; data: Record<string, unknown> }[];
    const edges = rawEdges as unknown as { source: string; target: string; sourceHandle?: string; targetHandle?: string }[];

    // Validate DAG
    if (!isValidDAG(nodes, edges)) {
      return NextResponse.json({ error: 'Workflow contains cycles — not a valid DAG' }, { status: 400 });
    }

    // Get execution order (flat, kept for reference) and parallel levels
    const executionOrder = getExecutionOrder(nodes, edges);
    void executionOrder; // kept for logging / future use

    // Group nodes by topological level for parallel execution
    const levels = getExecutionLevels(nodes, edges);

    // Create a workflow run record
    const run = await prisma.workflowRun.create({
      data: {
        workflowId: workflowId || 'inline',
        userId: user.id,
        status: 'running',
        scope: 'full',
        nodeResults: {},
        startedAt: new Date(),
      },
    });

    // Execute nodes level-by-level; nodes within the same level run in parallel
    const nodeResults: Record<string, {
      nodeId: string;
      nodeType: string;
      status: string;
      output?: unknown;
      error?: string;
      startedAt: string;
      completedAt?: string;
    }> = {};

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    let failed = false;

    for (const level of levels) {
      if (failed) break;

      // Execute all nodes in this level concurrently
      const results = await Promise.all(
        level.map(async (nodeId) => {
          if (failed) return;

          const node = nodeMap.get(nodeId);
          if (!node) return;

          const startTime = new Date().toISOString();
          nodeResults[nodeId] = {
            nodeId,
            nodeType: node.type,
            status: 'running',
            startedAt: startTime,
          };

          try {
            // Gather inputs from connected source nodes
            const incomingEdges = edges.filter((e) => e.target === nodeId);
            const inputData: Record<string, unknown> = {};

            for (const edge of incomingEdges) {
              const sourceResult = nodeResults[edge.source];
              if (sourceResult?.output) {
                inputData[edge.targetHandle || 'input'] = sourceResult.output;
              }
            }

            let output: unknown = null;

            switch (node.type) {
              case 'text':
                output = { text: node.data.text || '' };
                break;

              case 'uploadImage':
                output = { images: node.data.images || [] };
                break;

              case 'uploadVideo':
                output = { videoUrl: node.data.videoUrl || '' };
                break;

              case 'llm': {
                const llmPayload = {
                  model: node.data.model || 'gemini-1.5-flash',
                  systemPrompt: (inputData.system_prompt as { text?: string })?.text || '',
                  userMessage: (inputData.user_message as { text?: string })?.text || '',
                  images: (inputData.images as { images?: { imageUrl: string }[] })?.images?.map((i: { imageUrl: string }) => i.imageUrl) || [],
                };

                const llmRes = await fetch(`${getBaseUrl(req)}/api/trigger`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ taskType: 'llm', payload: llmPayload }),
                });

                const llmResult = await llmRes.json();
                if (!llmResult.success) throw new Error(llmResult.error);

                output = await pollTriggerTask(req, llmResult.runId);
                break;
              }

              case 'cropImage': {
                const imageInput = inputData.image_url as { images?: { imageUrl: string }[]; outputImageUrl?: string } | undefined;
                const imageUrl = imageInput?.outputImageUrl || imageInput?.images?.[0]?.imageUrl;

                const cropPayload = {
                  imageUrl: imageUrl || '',
                  x: (inputData.x_percent as { text?: string })?.text ?? node.data.x ?? 0,
                  y: (inputData.y_percent as { text?: string })?.text ?? node.data.y ?? 0,
                  width: (inputData.width_percent as { text?: string })?.text ?? node.data.width ?? 100,
                  height: (inputData.height_percent as { text?: string })?.text ?? node.data.height ?? 100,
                };

                const cropRes = await fetch(`${getBaseUrl(req)}/api/trigger`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ taskType: 'crop-image', payload: cropPayload }),
                });

                const cropResult = await cropRes.json();
                if (!cropResult.success) throw new Error(cropResult.error);

                output = await pollTriggerTask(req, cropResult.runId);
                break;
              }

              case 'extractFrame': {
                const videoInput = inputData.video_url as { videoUrl?: string } | undefined;
                const extractPayload = {
                  videoUrl: videoInput?.videoUrl || '',
                  timestamp: (inputData.timestamp as { text?: string })?.text ?? node.data.timestamp ?? 0,
                };

                const extractRes = await fetch(`${getBaseUrl(req)}/api/trigger`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ taskType: 'extract-frame', payload: extractPayload }),
                });

                const extractResult = await extractRes.json();
                if (!extractResult.success) throw new Error(extractResult.error);

                output = await pollTriggerTask(req, extractResult.runId);
                break;
              }

              default:
                output = { text: `Unknown node type: ${node.type}` };
            }

            nodeResults[nodeId] = {
              ...nodeResults[nodeId],
              status: 'completed',
              output,
              completedAt: new Date().toISOString(),
            };
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            nodeResults[nodeId] = {
              ...nodeResults[nodeId],
              status: 'failed',
              error: errorMsg,
              completedAt: new Date().toISOString(),
            };
            failed = true;
          }
        })
      );

      void results; // consumed via nodeResults side-effect
    }

    // Update run record
    const completedAt = new Date();
    await prisma.workflowRun.update({
      where: { id: run.id },
      data: {
        status: failed ? 'failed' : 'completed',
        nodeResults: nodeResults as unknown as Prisma.InputJsonValue,
        completedAt,
        duration: Math.floor((completedAt.getTime() - run.startedAt.getTime()) / 1000),
      },
    });

    return NextResponse.json({
      runId: run.id,
      status: failed ? 'failed' : 'completed',
      nodeResults,
    });
  } catch (error) {
    console.error('POST /api/execute error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/execute?runId=xxx - get run status
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const runId = searchParams.get('runId');

    if (!runId) {
      return NextResponse.json({ error: 'Run ID required' }, { status: 400 });
    }

    const run = await prisma.workflowRun.findUnique({ where: { id: runId } });
    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    return NextResponse.json({
      runId: run.id,
      status: run.status,
      nodeResults: run.nodeResults,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      duration: run.duration,
    });
  } catch (error) {
    console.error('GET /api/execute error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper: Get base URL from request
function getBaseUrl(req: NextRequest): string {
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('host') || 'localhost:3000';
  return `${proto}://${host}`;
}

// Helper: Poll a Trigger.dev task until completion
async function pollTriggerTask(req: NextRequest, runId: string): Promise<unknown> {
  const baseUrl = getBaseUrl(req);

  for (let i = 0; i < 180; i++) {
    const res = await fetch(`${baseUrl}/api/trigger?runId=${runId}`);
    const data = await res.json();

    if (data.isCompleted) return data.output;
    if (data.isFailed) throw new Error(data.error || 'Task failed');

    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('Task timed out');
}