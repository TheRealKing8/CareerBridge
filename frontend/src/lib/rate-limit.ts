/**
 * Simple in-memory token bucket rate limiter.
 *
 * Keyed by an arbitrary string — typically the client's IP address, or
 * a user ID for per-user quotas. Stored on `globalThis` so hot reload
 * doesn't reset the buckets mid-dev.
 *
 * For production you'd swap this for `@upstash/ratelimit` or a
 * Redis-backed equivalent. The interface here is deliberately small
 * so swapping is one-file.
 */

type Bucket = {
  // Tokens currently in the bucket (integer count).
  tokens: number;
  // Timestamp (ms since epoch) when tokens were last refilled.
  updatedAt: number;
};

type Options = {
  /** Bucket capacity — burst limit. */
  capacity: number;
  /** Tokens refilled per `windowMs`. */
  refillPerWindow: number;
  /** Window in milliseconds. */
  windowMs: number;
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetMs: number;
};

const globalForBuckets = globalThis as unknown as {
  __rateLimitBuckets?: Map<string, Bucket>;
};

const buckets: Map<string, Bucket> =
  globalForBuckets.__rateLimitBuckets ?? new Map();
if (!globalForBuckets.__rateLimitBuckets) {
  globalForBuckets.__rateLimitBuckets = buckets;
}

export function consume(key: string, opts: Options): RateLimitResult {
  const now = Date.now();
  const b = buckets.get(key) ?? {
    tokens: opts.capacity,
    updatedAt: now,
  };

  // Refill: convert elapsed time into tokens at the refill rate.
  const elapsed = now - b.updatedAt;
  if (elapsed > 0) {
    const refill = (elapsed / opts.windowMs) * opts.refillPerWindow;
    b.tokens = Math.min(opts.capacity, b.tokens + refill);
    b.updatedAt = now;
  }

  if (b.tokens >= 1) {
    b.tokens -= 1;
    buckets.set(key, b);
    return {
      ok: true,
      remaining: Math.floor(b.tokens),
      resetMs: Math.ceil((1 - b.tokens) * (opts.windowMs / opts.refillPerWindow)),
    };
  }

  buckets.set(key, b);
  // Time until a single token is available.
  const deficit = 1 - b.tokens;
  const resetMs = Math.ceil(deficit * (opts.windowMs / opts.refillPerWindow));
  return { ok: false, remaining: 0, resetMs };
}

/**
 * Pull the best client identifier off a Next.js Request. Prefers the
 * first IP in `x-forwarded-for` (common in reverse-proxied deploys);
 * falls back to `x-real-ip`, then "unknown".
 */
export function clientKey(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri;
  return "unknown";
}