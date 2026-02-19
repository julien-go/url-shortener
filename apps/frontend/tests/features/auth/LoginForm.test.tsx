import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "../../../src/features/auth/components/LoginForm";

import { AuthContext } from "../../../src/app/providers/authContext";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("submits credentials, stores token and navigates", async () => {
    const setSession = vi.fn();

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            login: {
              token: "jwt-token",
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

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <QueryClientProvider client={createQueryClient()}>
          <AuthContext.Provider
            value={{ token: null, setSession, logout: vi.fn() }}
          >
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/" element={<div>Home page</div>} />
            </Routes>
          </AuthContext.Provider>
        </QueryClientProvider>
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
      expect(setSession).toHaveBeenCalledWith("jwt-token");
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

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <QueryClientProvider client={createQueryClient()}>
          <AuthContext.Provider
            value={{ token: null, setSession: vi.fn(), logout: vi.fn() }}
          >
            <Routes>
              <Route path="/login" element={<LoginForm />} />
            </Routes>
          </AuthContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );

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
