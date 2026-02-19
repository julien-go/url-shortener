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
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= max) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((bucket.resetAt - now) / 1000),
      );

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
    next();
  };
}
