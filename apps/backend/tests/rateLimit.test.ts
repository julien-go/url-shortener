import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createFixedWindowRateLimit,
  getRateLimitMetricsSnapshot,
} from "../src/security/rateLimit";

type MockReq = {
  ip: string;
  originalUrl: string;
  method: string;
  headers: Record<string, string>;
};

type MockRes = {
  setHeader: ReturnType<typeof vi.fn>;
  getHeader: ReturnType<typeof vi.fn>;
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

function makeReq(overrides: Partial<MockReq> = {}): MockReq {
  return {
    ip: "127.0.0.1",
    originalUrl: "/graphql",
    method: "POST",
    headers: { "user-agent": "vitest" },
    ...overrides,
  };
}

function makeRes(): MockRes {
  const headers: Record<string, string | number | string[]> = {};
  const res: MockRes = {
    setHeader: vi.fn((name: string, value: string | number | string[]) => {
      headers[name] = value;
    }),
    getHeader: vi.fn((name: string) => headers[name]),
    status: vi.fn(),
    json: vi.fn(),
  };

  res.status.mockReturnValue(res);
  return res;
}

describe("rateLimit", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("blocking", () => {
    it("allows requests up to max then blocks with 429", () => {
      vi.spyOn(console, "warn").mockImplementation(() => undefined);

      const limiter = createFixedWindowRateLimit({
        name: "test-limiter",
        max: 2,
        windowMs: 60_000,
        keyGenerator: (req) => req.ip ?? "unknown-ip",
      });

      const req = makeReq();
      const res = makeRes();
      const next = vi.fn();

      limiter(req as never, res as never, next);
      limiter(req as never, res as never, next);
      limiter(req as never, res as never, next);

      expect(next).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", "2");
      expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Remaining", "0");
      expect(res.setHeader).toHaveBeenCalledWith(
        "RateLimit-Policy",
        expect.stringMatching(/^2;w=\d+$/),
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        "Retry-After",
        expect.any(String),
      );
      expect(res.json).toHaveBeenCalledWith({
        error: "Too many requests",
        retryAfterSeconds: expect.any(Number),
      });
    });

    it("resets window after expiration", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));

      const limiter = createFixedWindowRateLimit({
        name: "test-reset",
        max: 1,
        windowMs: 1000,
        keyGenerator: (req) => req.ip ?? "unknown-ip",
      });

      const req = makeReq();
      const res = makeRes();
      const next = vi.fn();

      limiter(req as never, res as never, next);
      limiter(req as never, res as never, next);

      vi.advanceTimersByTime(1001);

      limiter(req as never, res as never, next);

      expect(next).toHaveBeenCalledTimes(2);
      vi.useRealTimers();
    });
  });

  describe("options", () => {
    it("supports skip option", () => {
      const limiter = createFixedWindowRateLimit({
        name: "test-skip",
        max: 1,
        windowMs: 60_000,
        keyGenerator: (req) => req.ip ?? "unknown-ip",
        skip: () => true,
      });

      const req = makeReq();
      const res = makeRes();
      const next = vi.fn();

      limiter(req as never, res as never, next);
      limiter(req as never, res as never, next);

      expect(next).toHaveBeenCalledTimes(2);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.setHeader).not.toHaveBeenCalled();
    });

    it("supports custom onLimit handler", () => {
      const onLimit = vi.fn();
      const limiter = createFixedWindowRateLimit({
        name: "test-onLimit",
        max: 1,
        windowMs: 60_000,
        keyGenerator: (req) => req.ip ?? "unknown-ip",
        onLimit,
      });

      const req = makeReq();
      const res = makeRes();
      const next = vi.fn();

      limiter(req as never, res as never, next);
      limiter(req as never, res as never, next);

      expect(onLimit).toHaveBeenCalledWith(req, res, expect.any(Number));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("headers and metrics", () => {
    it("adds rate-limit headers for allowed requests", () => {
      const limiter = createFixedWindowRateLimit({
        name: "test-headers",
        max: 2,
        windowMs: 60_000,
        keyGenerator: (req) => req.ip ?? "unknown-ip",
      });

      const req = makeReq();
      const res = makeRes();
      const next = vi.fn();

      limiter(req as never, res as never, next);
      limiter(req as never, res as never, next);

      expect(next).toHaveBeenCalledTimes(2);
      expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", "2");
      expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Remaining", "0");
    });

    it("increments metrics when requests are blocked", () => {
      const before = getRateLimitMetricsSnapshot();

      const limiter = createFixedWindowRateLimit({
        name: "metrics-limiter",
        max: 1,
        windowMs: 60_000,
        keyGenerator: (req) => req.ip ?? "unknown-ip",
      });

      const req = makeReq();
      const res = makeRes();
      const next = vi.fn();

      limiter(req as never, res as never, next);
      limiter(req as never, res as never, next);

      const after = getRateLimitMetricsSnapshot();
      expect(after.blockedTotal).toBeGreaterThan(before.blockedTotal);
      expect(after.blockedByLimiter["metrics-limiter"]).toBeGreaterThan(0);
    });
  });
});
