import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RegisterForm } from "../../../src/features/auth/components/RegisterForm";
import * as authModule from "../../../src/app/providers/useAuth";
import * as registerHookModule from "../../../src/features/auth/hooks/useRegister";

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

type MinimalRegisterMutation = Pick<
  ReturnType<typeof registerHookModule.useRegister>,
  "mutateAsync" | "isPending" | "isError" | "error"
>;

describe("RegisterForm", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    vi.restoreAllMocks();
  });

  it("submits credentials, stores token and navigates", async () => {
    const setSession = vi.fn();
    const mutateAsync = vi
      .fn()
      .mockResolvedValue({ register: { token: "jwt-register-token" } });

    vi.spyOn(authModule, "useAuth").mockReturnValue({
      token: null,
      setSession,
      logout: vi.fn(),
    });

    const registerMock: MinimalRegisterMutation = {
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
    };

    vi.spyOn(registerHookModule, "useRegister").mockReturnValue(
      registerMock as ReturnType<typeof registerHookModule.useRegister>,
    );

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secretPassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "secretPassword",
      });
    });

    expect(setSession).toHaveBeenCalledWith("jwt-register-token");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("shows a mutation error message", () => {
    vi.spyOn(authModule, "useAuth").mockReturnValue({
      token: null,
      setSession: vi.fn(),
      logout: vi.fn(),
    });

    const registerMock: MinimalRegisterMutation = {
      mutateAsync: vi.fn(),
      isPending: false,
      isError: true,
      error: new Error("Email already used"),
    };

    vi.spyOn(registerHookModule, "useRegister").mockReturnValue(
      registerMock as ReturnType<typeof registerHookModule.useRegister>,
    );

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>,
    );

    expect(screen.getByText("Email already used")).toBeInTheDocument();
  });
});
