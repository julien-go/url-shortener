import { describe, expect, it, vi } from "vitest";

vi.mock("../src/config/env", () => ({
  env: { PUBLIC_BASE_URL: "https://short.test/" },
}));

import { shortUrlResolver } from "../src/graphql/resolvers/shortUrl.resolver";

describe("shortUrlResolver.shortLink", () => {
  it("joins the base url and the code without a double slash", () => {
    expect(shortUrlResolver.shortLink({ code: "abc123" })).toBe(
      "https://short.test/abc123",
    );
  });
});
