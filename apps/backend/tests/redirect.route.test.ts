import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
  resolveShortUrl: vi.fn(),
}));
vi.mock("../src/modules/shortUrls/shortUrls.service", () => serviceMocks);
vi.mock("../src/config/env", () => ({
  env: {
    NODE_ENV: "test",
    LOG_LEVEL: "silent",
    LOG_PRETTY: false,
    APP_NAME: "Fliro",
    APP_DASHBOARD_URL: "https://app.fliro.test",
    COOKIE_NAME: "auth_token",
    JWT_SECRET: "test-secret",
    RL_REDIRECT_WINDOW_MS: 60_000,
    RL_REDIRECT_MAX: 10_000,
  },
}));

const { default: express } = await import("express");
const { redirectRouter } = await import("../src/http/routes/redirect.route");
const { SLUG_MAX_LENGTH } = await import(
  "../src/modules/shortUrls/shortUrls.constants"
);

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const app = express();
  app.use("/", redirectRouter);

  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", () => resolve());
  });

  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

beforeEach(() => {
  vi.clearAllMocks();
});

function get(path: string, headers: Record<string, string> = {}) {
  return fetch(`${baseUrl}${path}`, { redirect: "manual", headers });
}

describe("GET /:code", () => {
  it("redirects with a 302 to the target url", async () => {
    serviceMocks.resolveShortUrl.mockResolvedValue({
      ok: true,
      targetUrl: "https://example.com/landing",
    });

    const res = await get("/abc123");

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://example.com/landing");
  });

  it("tracks the click on a regular navigation", async () => {
    serviceMocks.resolveShortUrl.mockResolvedValue({
      ok: true,
      targetUrl: "https://example.com",
    });

    await get("/abc123");

    expect(serviceMocks.resolveShortUrl).toHaveBeenCalledWith("abc123", {
      track: true,
    });
  });

  it.each([
    ["sec-purpose", "prefetch;anonymous-client-ip"],
    ["sec-purpose", "prerender"],
    ["purpose", "prefetch"],
  ])("does not track speculative requests (%s: %s)", async (header, value) => {
    serviceMocks.resolveShortUrl.mockResolvedValue({
      ok: true,
      targetUrl: "https://example.com",
    });

    await get("/abc123", { [header]: value });

    expect(serviceMocks.resolveShortUrl).toHaveBeenCalledWith("abc123", {
      track: false,
    });
  });

  it("answers 404 with an html page when the code is unknown", async () => {
    serviceMocks.resolveShortUrl.mockResolvedValue({
      ok: false,
      reason: "NOT_FOUND",
    });

    const res = await get("/nope42");

    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain("text/html");
    await expect(res.text()).resolves.toContain(
      "This short link does not exist.",
    );
  });

  it("answers 410 when the link was deleted", async () => {
    serviceMocks.resolveShortUrl.mockResolvedValue({
      ok: false,
      reason: "DELETED",
    });

    const res = await get("/gone12");

    expect(res.status).toBe(410);
    await expect(res.text()).resolves.toContain(
      "This link is no longer available.",
    );
  });

  it("answers 404 for an inactive link, without leaking that it existed", async () => {
    serviceMocks.resolveShortUrl.mockResolvedValue({
      ok: false,
      reason: "INACTIVE",
    });

    const res = await get("/off123");

    expect(res.status).toBe(404);
    await expect(res.text()).resolves.toContain(
      "This short link does not exist.",
    );
  });

  it("rejects an oversized code without hitting the service", async () => {
    const res = await get(`/${"a".repeat(SLUG_MAX_LENGTH + 1)}`);

    expect(res.status).toBe(404);
    expect(serviceMocks.resolveShortUrl).not.toHaveBeenCalled();
  });

  it("renders the brand name on the status page", async () => {
    serviceMocks.resolveShortUrl.mockResolvedValue({
      ok: false,
      reason: "NOT_FOUND",
    });

    const body = await (await get("/nope42")).text();

    expect(body).toContain("Fliro");
    expect(body).not.toContain("undefined");
  });
});
