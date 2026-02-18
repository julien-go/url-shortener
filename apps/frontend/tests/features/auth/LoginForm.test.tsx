import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { LoginForm } from "../../../src/features/auth/components/LoginForm";
import * as authModule from "../../../src/app/providers/useAuth";
import * as loginHookModule from "../../../src/features/auth/hooks/useLogin";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

type MinimalLoginMutation = Pick<
  ReturnType<typeof loginHookModule.useLogin>,
  "mutateAsync" | "isPending" | "isError" | "error"
>;

describe("LoginForm", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    vi.restoreAllMocks();
  });

  it("submits credentials, stores token and navigates", async () => {
    const setSession = vi.fn();
    const mutateAsync = vi
      .fn()
      .mockResolvedValue({ login: { token: "jwt-token" } });

    vi.spyOn(authModule, "useAuth").mockReturnValue({
      token: null,
      setSession,
      logout: vi.fn(),
    });

    const loginMock: MinimalLoginMutation = {
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
    };

    vi.spyOn(loginHookModule, "useLogin").mockReturnValue(
      loginMock as ReturnType<typeof loginHookModule.useLogin>,
    );

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secretPassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "secretPassword",
      });
    });

    expect(setSession).toHaveBeenCalledWith("jwt-token");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("shows a mutation error message", () => {
    vi.spyOn(authModule, "useAuth").mockReturnValue({
      token: null,
      setSession: vi.fn(),
      logout: vi.fn(),
    });

    const loginMock: MinimalLoginMutation = {
      mutateAsync: vi.fn(),
      isPending: false,
      isError: true,
      error: new Error("Invalid credentials"),
    };

    vi.spyOn(loginHookModule, "useLogin").mockReturnValue(
      loginMock as ReturnType<typeof loginHookModule.useLogin>,
    );

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });
});
