import { describe, expect, it, vi, beforeEach } from "vitest";
import { graphqlFetch } from "../../../src/lib/graphql/graphqlFetch";

describe("graphqlFetch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("always sends credentials include", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: { ok: true } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await graphqlFetch<{ ok: boolean }>("query { ok }");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({
        credentials: "include",
      }),
    );
  });

  describe("error handling", () => {
    it("throws when HTTP status is not ok", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ message: "error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }),
      );

      await expect(graphqlFetch("query { ok }")).rejects.toMatchObject({
        message: "HTTP error",
        status: 500,
      });
    });

    it("throws a GraphQLRequestError that preserves the error code in extensions", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(
          JSON.stringify({
            errors: [
              {
                message: "Unauthenticated",
                extensions: { code: "UNAUTHENTICATED" },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

      await expect(graphqlFetch("query { me { id } }")).rejects.toMatchObject(
        {
          message: "Unauthenticated",
          errors: [{ extensions: { code: "UNAUTHENTICATED" } }],
        },
      );
    });

    it("throws on invalid JSON response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("not-json", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      await expect(graphqlFetch("query { ok }")).rejects.toMatchObject({
        message: "Invalid JSON response",
        status: 200,
      });
    });

    it("throws when response has no data and no errors", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      await expect(graphqlFetch("query { ok }")).rejects.toMatchObject({
        message: "Missing GraphQL data",
        status: 200,
      });
    });
  });
});
