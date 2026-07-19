import "@testing-library/jest-dom/vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RegisterForm } from "../../../src/features/auth/components/RegisterForm";
import type { AuthContextValue } from "../../../src/app/providers/authContext";
import { renderAuthForm } from "./renderAuthForm";

function renderRegisterForm(authOverrides: Partial<AuthContextValue> = {}) {
  return renderAuthForm("/register", <RegisterForm />, authOverrides);
}

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("submits credentials, refreshes session and navigates", async () => {
    const refreshSession = vi.fn().mockResolvedValue(undefined);

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            register: {
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

    renderRegisterForm({ refreshSession });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Correct-horse1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "Correct-horse1" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const request = fetchSpy.mock.calls[0]?.[1] as RequestInit;
      const body = JSON.parse(String(request.body)) as {
        variables: { input: { email: string; password: string } };
      };

      expect(body.variables.input).toEqual({
        email: "test@example.com",
        password: "Correct-horse1",
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
          errors: [{ message: "Email already used" }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    renderRegisterForm();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Correct-horse1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "Correct-horse1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Email already used")).toBeInTheDocument();
  });

  it("blocks submission when password confirmation does not match", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    renderRegisterForm();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Correct-horse1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "Different-horse2" },
    });

    expect(
      await screen.findByText("Passwords do not match"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeDisabled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("blocks submission when password is too short", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    renderRegisterForm();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "short" },
    });

    expect(
      await screen.findByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeDisabled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("blocks submission when password lacks required complexity", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    renderRegisterForm();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "alllowercase" },
    });

    expect(
      await screen.findByText(
        "Password must include an uppercase letter, a lowercase letter, a digit, and a special character",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeDisabled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
