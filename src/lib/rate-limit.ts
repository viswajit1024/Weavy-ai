// Token-bucket rate limiter for API routes.
// Per-IP, configurable window and max requests.

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (now - entry.lastRefill > 300_000) {
      buckets.delete(key);
    }
  }
}, 300_000);

interface RateLimitConfig {
  /** Max requests allowed in the window */
  maxTokens: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxTokens: 20,
  windowMs: 10_000, // 10 seconds
};

/**
 * Check rate limit for a given identifier (typically IP or userId).
 * Returns { allowed, remaining, retryAfterMs }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  let entry = buckets.get(identifier);

  if (!entry) {
    entry = { tokens: config.maxTokens, lastRefill: now };
    buckets.set(identifier, entry);
  }

  // Refill tokens based on elapsed time
  const elapsed = now - entry.lastRefill;
  const refillRate = config.maxTokens / config.windowMs; // tokens per ms
  const refill = Math.floor(elapsed * refillRate);

  if (refill > 0) {
    entry.tokens = Math.min(config.maxTokens, entry.tokens + refill);
    entry.lastRefill = now;
  }

  if (entry.tokens > 0) {
    entry.tokens -= 1;
    return { allowed: true, remaining: entry.tokens, retryAfterMs: 0 };
  }

  // Calculate when next token will be available
  const retryAfterMs = Math.ceil(1 / refillRate);
  return { allowed: false, remaining: 0, retryAfterMs };
}

/**
 * Extract client IP from Next.js request headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return '127.0.0.1';
}

// Pre-defined limiters for different endpoints
export const RATE_LIMITS = {
  /** LLM / trigger endpoints: 10 req / 10s */
  llm: { maxTokens: 10, windowMs: 10_000 },
  /** General API: 30 req / 10s */
  api: { maxTokens: 30, windowMs: 10_000 },
  /** Upload: 5 req / 10s */
  upload: { maxTokens: 5, windowMs: 10_000 },
} as const;
