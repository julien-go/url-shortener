import { createHash } from "node:crypto";
import type { Request, RequestHandler, Response } from "express";

type Bucket = {
  count: number;
  resetAt: number;
};

type CreateFixedWindowRateLimitOptions = {
  name: string;
  windowMs: number;
  max: number;
  keyGenerator: (req: Request) => string;
  skip?: (req: Request) => boolean;
  onLimit?: (req: Request, res: Response, retryAfterSeconds: number) => void;
};

type RateLimitCounter = {
  blockedTotal: number;
  blockedByLimiter: Record<string, number>;
};

const rateLimitCounter: RateLimitCounter = {
  blockedTotal: 0,
  blockedByLimiter: {},
};

function hashForLogs(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function write429(res: Response, retryAfterSeconds: number): void {
  res.setHeader("Retry-After", String(retryAfterSeconds));
  res.status(429).json({
    error: "Too many requests",
    retryAfterSeconds,
  });
}

function writeRateLimitHeaders(
  res: Response,
  options: { limit: number; remaining: number; resetAtMs: number },
): void {
  const resetAfterSeconds = Math.max(
    1,
    Math.ceil((options.resetAtMs - Date.now()) / 1000),
  );

  res.setHeader("X-RateLimit-Limit", String(options.limit));
  res.setHeader(
    "X-RateLimit-Remaining",
    String(Math.max(0, options.remaining)),
  );
  res.setHeader("X-RateLimit-Reset", String(resetAfterSeconds));
  res.setHeader("RateLimit-Policy", `${options.limit};w=${resetAfterSeconds}`);
}

function cleanupExpiredBuckets(
  now: number,
  buckets: Map<string, Bucket>,
): void {
  if (buckets.size < 10_000) return;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function trackBlocked(limiterName: string): void {
  rateLimitCounter.blockedTotal += 1;
  rateLimitCounter.blockedByLimiter[limiterName] =
    (rateLimitCounter.blockedByLimiter[limiterName] ?? 0) + 1;
}

export function getRateLimitMetricsSnapshot(): RateLimitCounter {
  return {
    blockedTotal: rateLimitCounter.blockedTotal,
    blockedByLimiter: { ...rateLimitCounter.blockedByLimiter },
  };
}

export function createFixedWindowRateLimit(
  options: CreateFixedWindowRateLimitOptions,
): RequestHandler {
  const { name, max, windowMs, keyGenerator, skip, onLimit } = options;
  const buckets = new Map<string, Bucket>();

  return (req, res, next) => {
    if (skip?.(req)) return next();

    const key = keyGenerator(req);
    const now = Date.now();

    cleanupExpiredBuckets(now, buckets);

    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      const resetAt = now + windowMs;
      buckets.set(key, { count: 1, resetAt });
      writeRateLimitHeaders(res, {
        limit: max,
        remaining: max - 1,
        resetAtMs: resetAt,
      });
      return next();
    }

    if (bucket.count >= max) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((bucket.resetAt - now) / 1000),
      );

      writeRateLimitHeaders(res, {
        limit: max,
        remaining: 0,
        resetAtMs: bucket.resetAt,
      });

      trackBlocked(name);

      console.warn("[rate-limit] blocked", {
        limiter: name,
        route: req.originalUrl,
        method: req.method,
        keyHash: hashForLogs(key),
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        retryAfterSeconds,
        at: new Date().toISOString(),
      });

      if (onLimit) {
        onLimit(req, res, retryAfterSeconds);
      } else {
        write429(res, retryAfterSeconds);
      }
      return;
    }

    bucket.count += 1;
    writeRateLimitHeaders(res, {
      limit: max,
      remaining: max - bucket.count,
      resetAtMs: bucket.resetAt,
    });
    next();
  };
}
