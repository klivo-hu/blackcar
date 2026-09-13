/**
 * A fixed-window rate limiter held in process memory.
 *
 * Scope and limits, stated plainly: this counts per instance. With more than
 * one container the effective limit multiplies by the instance count, and every
 * counter resets on deploy. That is acceptable for what it defends — brute
 * force against a single admin password, and contact-form flooding — because
 * even a multiplied limit is orders of magnitude below what an attacker needs.
 * A shared store (Redis) is the upgrade path if the site ever scales out.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Stops the map growing without bound when keys are never seen again. */
let lastSweep = 0;
const SWEEP_INTERVAL_MS = 60_000;

function sweep(now: number): void {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets — suitable for a `Retry-After` header. */
  retryAfterSeconds: number;
};

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  if (existing.count > limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  return { allowed: true, remaining: limit - existing.count, retryAfterSeconds };
}

/** Clears a bucket — called after a successful login so a valid user isn't punished. */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/**
 * Best-effort client identity for rate limiting.
 *
 * `x-forwarded-for` is client-controllable unless a trusted proxy overwrites
 * it, so this is a throttling signal only — never an authentication or
 * authorisation input.
 */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  return `${scope}:${ip}`;
}
