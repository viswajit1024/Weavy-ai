import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

// GET /api/workflows - list all workflows for the user
// GET /api/workflows?id=xxx - get single workflow
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const workflowId = searchParams.get('id');

    if (workflowId) {
      const workflow = await prisma.workflow.findFirst({
        where: { id: workflowId, userId: user.id },
        include: { runs: { orderBy: { startedAt: 'desc' }, take: 50 } },
      });

      if (!workflow) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
      }

      return NextResponse.json({ workflow });
    }

    const workflows = await prisma.workflow.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { runs: true } } },
    });

    return NextResponse.json({ workflows });
  } catch (error) {
    console.error('GET /api/workflows error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/workflows - create a new workflow
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit check
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`workflows:${clientIp}`, RATE_LIMITS.api);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.retryAfterMs / 1000)) } }
      );
    }

    const clerkUser = await currentUser();
    let user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId,
          email: clerkUser?.emailAddresses[0]?.emailAddress || '',
          name: clerkUser?.firstName || 'User',
        },
      });
    }

    const body = await req.json();
    const { name, nodes, edges } = body;

    const workflow = await prisma.workflow.create({
      data: {
        name: name || 'Untitled Workflow',
        nodes: nodes || [],
        edges: edges || [],
        userId: user.id,
      },
    });

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error) {
    console.error('POST /api/workflows error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/workflows - update an existing workflow
export async function PUT(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { id, name, nodes, edges } = body;

    if (!id) {
      return NextResponse.json({ error: 'Workflow ID required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.workflow.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const workflow = await prisma.workflow.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(nodes !== undefined && { nodes }),
        ...(edges !== undefined && { edges }),
      },
    });

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('PUT /api/workflows error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/workflows?id=xxx - delete a workflow
export async function DELETE(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const workflowId = searchParams.get('id');

    if (!workflowId) {
      return NextResponse.json({ error: 'Workflow ID required' }, { status: 400 });
    }

    const existing = await prisma.workflow.findFirst({
      where: { id: workflowId, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Delete runs first, then workflow
    await prisma.workflowRun.deleteMany({ where: { workflowId } });
    await prisma.workflow.delete({ where: { id: workflowId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/workflows error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}