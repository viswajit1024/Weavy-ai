import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { tasks, runs } from '@trigger.dev/sdk/v3';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { validateImageUrl, validateVideoUrl } from '@/lib/ssrf-protection';
import { getApiKey } from '@/lib/api-keys';

// POST /api/trigger - trigger a specific task
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit check
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`trigger:${clientIp}`, RATE_LIMITS.llm);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.retryAfterMs / 1000)) } }
      );
    }

    const body = await req.json();
    const { taskType, payload } = body;

    if (!taskType || !payload) {
      return NextResponse.json({ error: 'taskType and payload required' }, { status: 400 });
    }

    // SSRF protection: validate image/video URLs in payload
    try {
      if (payload.imageUrl) validateImageUrl(payload.imageUrl as string);
      if (payload.videoUrl) validateVideoUrl(payload.videoUrl as string);
      if (Array.isArray(payload.images)) {
        (payload.images as string[]).forEach((url: string) => validateImageUrl(url));
      }
    } catch (ssrfError) {
      return NextResponse.json(
        { error: ssrfError instanceof Error ? ssrfError.message : 'Invalid URL' },
        { status: 400 }
      );
    }

    let taskId: string;
    switch (taskType) {
      case 'llm':
        taskId = 'llm-gemini';
        break;
      case 'crop-image':
        taskId = 'crop-image';
        break;
      case 'extract-frame':
        taskId = 'extract-video-frame';
        break;
      default:
        return NextResponse.json({ error: `Unknown task type: ${taskType}` }, { status: 400 });
    }

    try {
      const handle = await tasks.trigger(taskId, payload);

      return NextResponse.json({
        success: true,
        runId: handle.id,
      });
    } catch (triggerError) {
      console.error('Trigger.dev trigger error:', triggerError);

      // Fallback: execute inline if Trigger.dev is not configured
      const result = await executeInline(taskType, payload, clerkId);
      return NextResponse.json({
        success: true,
        runId: `inline-${Date.now()}`,
        inline: true,
        output: result,
      });
    }
  } catch (error) {
    console.error('POST /api/trigger error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/trigger?runId=xxx - poll task status
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const runId = searchParams.get('runId');

    if (!runId) {
      return NextResponse.json({ error: 'runId required' }, { status: 400 });
    }

    // Handle inline execution results (already complete)
    if (runId.startsWith('inline-')) {
      return NextResponse.json({
        isCompleted: true,
        isFailed: false,
        output: null, // Already returned in POST response
      });
    }

    try {
      const run = await runs.retrieve(runId);

      const isCompleted = run.status === 'COMPLETED';
      const isFailed = run.status === 'FAILED' || run.status === 'CANCELED';

      return NextResponse.json({
        status: run.status,
        isCompleted,
        isFailed,
        output: isCompleted ? run.output : undefined,
        error: isFailed ? (run as unknown as { error?: { message?: string } }).error?.message : undefined,
      });
    } catch (retrieveError) {
      // If Trigger.dev is not configured, return as completed
      console.error('Trigger.dev retrieve error:', retrieveError);
      return NextResponse.json({
        isCompleted: true,
        isFailed: false,
        output: null,
      });
    }
  } catch (error) {
    console.error('GET /api/trigger error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Inline execution fallback when Trigger.dev is not configured
async function executeInline(
  taskType: string,
  payload: Record<string, unknown>,
  clerkId: string
): Promise<unknown> {
  switch (taskType) {
    case 'llm': {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const apiKey = await getApiKey(clerkId, 'gemini');
      if (!apiKey) throw new Error('No Gemini API key configured. Add one in Settings.');

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: (payload.model as string) || 'gemini-1.5-flash',
      });

      const parts: { text: string }[] = [];

      if (payload.systemPrompt) {
        parts.push({ text: `System: ${payload.systemPrompt as string}\n\n` });
      }
      parts.push({ text: (payload.userMessage as string) || '' });

      const result = await model.generateContent(parts.map((p) => p.text).join(''));
      const response = await result.response;

      return { output: response.text() };
    }

    case 'crop-image': {
      // Transloadit crop - return placeholder if not configured
      const transloaditKey = await getApiKey(clerkId, 'transloadit');
      if (!transloaditKey) {
        return {
          outputImageUrl: payload.imageUrl,
          message: 'Transloadit not configured — returning original image',
        };
      }

      // Transloadit assembly for cropping
      const assemblyRes = await fetch('https://api2.transloadit.com/assemblies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth: { key: transloaditKey },
          template_id: process.env.TRANSLOADIT_TEMPLATE_CROP,
          steps: {
            import: {
              robot: '/http/import',
              url: payload.imageUrl,
            },
            crop: {
              robot: '/image/resize',
              use: 'import',
              crop: {
                x1: `${payload.x}%`,
                y1: `${payload.y}%`,
                x2: `${(payload.x as number) + (payload.width as number)}%`,
                y2: `${(payload.y as number) + (payload.height as number)}%`,
              },
            },
          },
        }),
      });

      const assembly = await assemblyRes.json();
      return { outputImageUrl: assembly.results?.crop?.[0]?.ssl_url || payload.imageUrl };
    }

    case 'extract-frame': {
      const transloaditKey = await getApiKey(clerkId, 'transloadit');
      if (!transloaditKey) {
        return {
          outputFrameUrl: '',
          message: 'Transloadit not configured — frame extraction unavailable',
        };
      }

      const assemblyRes = await fetch('https://api2.transloadit.com/assemblies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth: { key: transloaditKey },
          steps: {
            import: {
              robot: '/http/import',
              url: payload.videoUrl,
            },
            extract: {
              robot: '/video/thumbs',
              use: 'import',
              offsets: [payload.timestamp],
              format: 'png',
              count: 1,
            },
          },
        }),
      });

      const assembly = await assemblyRes.json();
      return { outputFrameUrl: assembly.results?.extract?.[0]?.ssl_url || '' };
    }

    default:
      throw new Error(`Unknown inline task: ${taskType}`);
  }
}