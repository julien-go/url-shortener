import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { CreateShortUrlForm } from "../../../src/features/links/components/CreateShortUrlForm";
import * as hookModule from "../../../src/features/links/hooks/useCreateShortUrl";

type MinimalMutation = Pick<
  ReturnType<typeof hookModule.useCreateShortUrl>,
  "mutate" | "isPending" | "error" | "data"
>;

describe("CreateShortUrlForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("submit: trims slug", () => {
    const mutate = vi.fn();

    const mockReturn: MinimalMutation = {
      mutate,
      isPending: false,
      error: null,
      data: undefined,
    };

    vi.spyOn(hookModule, "useCreateShortUrl").mockReturnValue(
      mockReturn as ReturnType<typeof hookModule.useCreateShortUrl>,
    );

    render(<CreateShortUrlForm />);

    fireEvent.change(screen.getByLabelText("Original URL"), {
      target: { value: "https://example.com" },
    });

    fireEvent.change(screen.getByLabelText("Custom slug (optional)"), {
      target: { value: "  promo-2026  " },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create link" }));

    expect(mutate).toHaveBeenCalledWith({
      originalUrl: "https://example.com",
      code: "promo-2026",
    });
  });

  it("submit: whitespace slug => undefined", () => {
    const mutate = vi.fn();

    const mockReturn: MinimalMutation = {
      mutate,
      isPending: false,
      error: null,
      data: undefined,
    };

    vi.spyOn(hookModule, "useCreateShortUrl").mockReturnValue(
      mockReturn as ReturnType<typeof hookModule.useCreateShortUrl>,
    );

    render(<CreateShortUrlForm />);

    fireEvent.change(screen.getByLabelText("Original URL"), {
      target: { value: "https://example.com" },
    });

    fireEvent.change(screen.getByLabelText("Custom slug (optional)"), {
      target: { value: "   " },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create link" }));

    expect(mutate).toHaveBeenCalledWith({
      originalUrl: "https://example.com",
      code: undefined,
    });
  });

  it('pending: button disabled and shows "Creating…"', () => {
    const mockReturn: MinimalMutation = {
      mutate: vi.fn(),
      isPending: true,
      error: null,
      data: undefined,
    };

    vi.spyOn(hookModule, "useCreateShortUrl").mockReturnValue(
      mockReturn as ReturnType<typeof hookModule.useCreateShortUrl>,
    );

    render(<CreateShortUrlForm />);

    const btn = screen.getByRole("button", { name: "Creating…" });
    expect(btn).toBeDisabled();
  });

  it("copy: calls clipboard and shows success message", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    const mockReturn: MinimalMutation = {
      mutate: vi.fn(),
      isPending: false,
      error: null,
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
    };

    vi.spyOn(hookModule, "useCreateShortUrl").mockReturnValue(
      mockReturn as ReturnType<typeof hookModule.useCreateShortUrl>,
    );

    render(<CreateShortUrlForm />);

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("https://short.test/abc"),
    );

    expect(screen.getByText("Copied to clipboard.")).toBeInTheDocument();
  });
});
