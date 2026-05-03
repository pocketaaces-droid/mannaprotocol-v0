/**
 * In-memory rate limiter — 10 requests per IP per hour.
 * Resets on server restart. Adequate for v0; upgrade to Vercel KV / Upstash for v1.
 */

type RateRecord = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 30;
const store = new Map<string, RateRecord>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const existing = store.get(ip);

  if (!existing || now >= existing.resetAt) {
    const fresh: RateRecord = { count: 1, resetAt: now + WINDOW_MS };
    store.set(ip, fresh);
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: fresh.resetAt };
  }

  if (existing.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  store.set(ip, existing);
  return { allowed: true, remaining: MAX_REQUESTS - existing.count, resetAt: existing.resetAt };
}

/**
 * Periodic cleanup of expired records to prevent unbounded memory growth.
 * Called opportunistically from checkRateLimit's caller, no setInterval needed.
 */
export function pruneExpired(): void {
  const now = Date.now();
  for (const [ip, rec] of store.entries()) {
    if (now >= rec.resetAt) store.delete(ip);
  }
}
