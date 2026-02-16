export type Bucket = {
  count: number;
  resetAt: number;
};

export type CreateFixedWindowRateLimitOptions = {
  name: string;
  windowMs: number;
  max: number;
  keyGenerator: (req: Request) => string;
  skip?: (req: Request) => boolean;
};

export type RateLimitCounter = {
  blockedTotal: number;
  blockedByLimiter: Record<string, number>;
};
