import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

// GET /api/settings/api-keys - list user's API keys (masked)
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const apiKeys = await prisma.userApiKey.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        provider: true,
        label: true,
        createdAt: true,
        apiKey: true,
      },
    });

    // Mask API keys for display — show only last 4 characters
    const maskedKeys = apiKeys.map((key) => ({
      ...key,
      apiKey: key.apiKey.length > 4
        ? '•'.repeat(key.apiKey.length - 4) + key.apiKey.slice(-4)
        : '••••',
    }));

    return NextResponse.json({ apiKeys: maskedKeys });
  } catch (error) {
    console.error('GET /api/settings/api-keys error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/settings/api-keys - create or update an API key
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`api-keys:${clientIp}`, RATE_LIMITS.api);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.retryAfterMs / 1000)) } }
      );
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { provider, apiKey, label } = body;

    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'Provider and apiKey are required' }, { status: 400 });
    }

    const validProviders = ['gemini', 'transloadit', 'trigger'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json({ error: `Invalid provider. Must be one of: ${validProviders.join(', ')}` }, { status: 400 });
    }

    // Upsert: create or update
    const savedKey = await prisma.userApiKey.upsert({
      where: {
        userId_provider: { userId: user.id, provider },
      },
      update: {
        apiKey,
        label: label || provider,
      },
      create: {
        userId: user.id,
        provider,
        apiKey,
        label: label || provider,
      },
    });

    return NextResponse.json({
      success: true,
      apiKey: {
        id: savedKey.id,
        provider: savedKey.provider,
        label: savedKey.label,
        createdAt: savedKey.createdAt,
      },
    });
  } catch (error) {
    console.error('POST /api/settings/api-keys error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/settings/api-keys?id=xxx - delete an API key
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
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json({ error: 'API key ID required' }, { status: 400 });
    }

    const existing = await prisma.userApiKey.findFirst({
      where: { id: keyId, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    await prisma.userApiKey.delete({ where: { id: keyId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/settings/api-keys error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}