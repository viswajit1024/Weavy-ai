import { prisma } from '@/lib/prisma';

/**
 * Get the API key for a given provider.
 * Priority: user's own key > server environment variable.
 */
export async function getApiKey(
  clerkId: string,
  provider: 'gemini' | 'transloadit' | 'trigger'
): Promise<string | null> {
  // Try user's own key first
  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (user) {
      const userKey = await prisma.userApiKey.findUnique({
        where: { userId_provider: { userId: user.id, provider } },
      });
      if (userKey?.apiKey) return userKey.apiKey;
    }
  } catch {
    // Fall through to env variable
  }

  // Fall back to server environment variable
  switch (provider) {
    case 'gemini':
      return process.env.GOOGLE_GEMINI_API_KEY || null;
    case 'transloadit':
      return process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY || null;
    case 'trigger':
      return process.env.TRIGGER_SECRET_KEY || null;
    default:
      return null;
  }
}
