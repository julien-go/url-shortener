import "@testing-library/jest-dom/vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "../../../src/features/auth/components/LoginForm";
import type { AuthContextValue } from "../../../src/app/providers/authContext";
import { renderAuthForm } from "./renderAuthForm";

function renderLoginForm(authOverrides: Partial<AuthContextValue> = {}) {
  return renderAuthForm("/login", <LoginForm />, authOverrides);
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("submits credentials, refreshes session and navigates", async () => {
    const refreshSession = vi.fn().mockResolvedValue(undefined);

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            login: {
              user: {
                id: "u1",
                email: "test@example.com",
                createdAt: new Date().toISOString(),
              },
            },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    renderLoginForm({ refreshSession });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secretPassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const request = fetchSpy.mock.calls[0]?.[1] as RequestInit;
      const body = JSON.parse(String(request.body)) as {
        variables: { input: { email: string; password: string } };
      };

      expect(body.variables.input).toEqual({
        email: "test@example.com",
        password: "secretPassword",
      });
    });

    await waitFor(() => {
      expect(refreshSession).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Home page")).toBeInTheDocument();
    });
  });

  it("shows a mutation error message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          errors: [
            {
              message: "Invalid credentials",
              extensions: { code: "UNAUTHENTICATED" },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    renderLoginForm();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "bad-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });
});
