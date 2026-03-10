import { beforeEach, describe, expect, it, vi } from "vitest";
import { authRateLimit } from "../src/security/rateLimit.middleware";

type MockReq = {
  ip: string;
  socket: { remoteAddress: string };
  originalUrl: string;
  method: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
};

type MockRes = {
  setHeader: ReturnType<typeof vi.fn>;
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

function makeReq(overrides: Partial<MockReq> = {}): MockReq {
  return {
    ip: "127.0.0.1",
    socket: { remoteAddress: "127.0.0.1" },
    originalUrl: "/graphql",
    method: "POST",
    headers: { "user-agent": "vitest" },
    body: {
      operationName: "Login",
      query:
        "mutation Login($input: LoginInput!) { login(input: $input) { user { id } } }",
      variables: {
        input: {
          email: "rate@test.dev",
        },
      },
    },
    ...overrides,
  };
}

function makeRes(): MockRes {
  const res: MockRes = {
    setHeader: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
}

describe("authRateLimit middleware", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("allows requests below threshold then blocks with auth-specific payload", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const req = makeReq();
    const res = makeRes();
    const next = vi.fn();

    for (let i = 0; i < 5; i++) {
      authRateLimit(req as never, res as never, next);
    }

    authRateLimit(req as never, res as never, next);

    expect(next).toHaveBeenCalledTimes(5);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.setHeader).toHaveBeenCalledWith(
      "X-RateLimit-Limit",
      expect.any(String),
    );
    expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Remaining", "0");

    expect(res.setHeader).toHaveBeenCalledWith(
      "Retry-After",
      expect.any(String),
    );
    expect(res.json).toHaveBeenCalledWith({
      error: "Too many authentication attempts",
      retryAfterSeconds: expect.any(Number),
    });
  });

  it("skips non-auth graphql operations", () => {
    const req = makeReq({
      body: {
        operationName: "MyLinks",
        query: "query MyLinks { myLinks(limit: 10) { totalCount } }",
      },
    });
    const res = makeRes();
    const next = vi.fn();

    for (let i = 0; i < 8; i++) {
      authRateLimit(req as never, res as never, next);
    }

    expect(next).toHaveBeenCalledTimes(8);
    expect(res.status).not.toHaveBeenCalled();
  });
});
