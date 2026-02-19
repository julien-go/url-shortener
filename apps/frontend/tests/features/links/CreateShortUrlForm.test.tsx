import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CreateShortUrlForm } from "../../../src/features/links/components/CreateShortUrlForm";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderForm() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <CreateShortUrlForm />
    </QueryClientProvider>,
  );
}

describe("CreateShortUrlForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  it("submit: trims slug", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            createShortUrl: {
              shortLink: "https://short.test/promo-2026",
              shortUrl: {
                id: "1",
                code: "promo-2026",
                originalUrl: "https://example.com",
                createdAt: new Date().toISOString(),
              },
            },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    renderForm();

    fireEvent.change(screen.getByLabelText("Original URL"), {
      target: { value: "https://example.com" },
    });

    fireEvent.change(screen.getByLabelText("Custom slug (optional)"), {
      target: { value: "  promo-2026  " },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create link" }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const request = fetchSpy.mock.calls[0]?.[1] as RequestInit;
      const body = JSON.parse(String(request.body)) as {
        variables: { input: { originalUrl: string; code?: string } };
      };

      expect(body.variables.input).toEqual({
        originalUrl: "https://example.com",
        code: "promo-2026",
      });
    });
  });

  it("submit: whitespace slug => undefined", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            createShortUrl: {
              shortLink: "https://short.test/abc",
              shortUrl: {
                id: "1",
                code: "abc",
                originalUrl: "https://example.com",
                createdAt: new Date().toISOString(),
              },
            },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    renderForm();

    fireEvent.change(screen.getByLabelText("Original URL"), {
      target: { value: "https://example.com" },
    });

    fireEvent.change(screen.getByLabelText("Custom slug (optional)"), {
      target: { value: "   " },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create link" }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const request = fetchSpy.mock.calls[0]?.[1] as RequestInit;
      const body = JSON.parse(String(request.body)) as {
        variables: { input: { originalUrl: string; code?: string } };
      };

      expect(body.variables.input).toEqual({
        originalUrl: "https://example.com",
      });
      expect(body.variables.input.code).toBeUndefined();
    });
  });

  it('pending: button disabled and shows "Creating…"', async () => {
    let resolveFetch: ((value: Response) => void) | undefined;
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );

    renderForm();
    fireEvent.change(screen.getByLabelText("Original URL"), {
      target: { value: "https://example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create link" }));

    const btn = await screen.findByRole("button", { name: "Creating…" });
    expect(btn).toBeDisabled();

    if (!resolveFetch) {
      throw new Error("fetch resolver was not initialized");
    }

    resolveFetch(
      new Response(
        JSON.stringify({
          data: {
            createShortUrl: {
              shortLink: "https://short.test/abc",
              shortUrl: {
                id: "1",
                code: "abc",
                originalUrl: "https://example.com",
                createdAt: new Date().toISOString(),
              },
            },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Create link" })).toBeEnabled();
    });
  });

  it("copy: calls clipboard and shows success message", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            createShortUrl: {
              shortLink: "https://short.test/abc",
              shortUrl: {
                id: "1",
                code: "abc",
                originalUrl: "https://example.com",
                createdAt: new Date().toISOString(),
              },
            },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    renderForm();

    fireEvent.change(screen.getByLabelText("Original URL"), {
      target: { value: "https://example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create link" }));

    expect(
      await screen.findByText("https://short.test/abc"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("https://short.test/abc"),
    );

    expect(screen.getByText("Copied to clipboard.")).toBeInTheDocument();
  });
});
