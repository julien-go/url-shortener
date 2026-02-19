import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RegisterForm } from "../../../src/features/auth/components/RegisterForm";
import { AuthContext } from "../../../src/app/providers/authContext";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
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

    render(
      <MemoryRouter initialEntries={["/register"]}>
        <QueryClientProvider client={createQueryClient()}>
          <AuthContext.Provider value={{ refreshSession, logout: vi.fn() }}>
            <Routes>
              <Route path="/register" element={<RegisterForm />} />
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

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

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
          errors: [{ message: "Email already used" }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(
      <MemoryRouter initialEntries={["/register"]}>
        <QueryClientProvider client={createQueryClient()}>
          <AuthContext.Provider
            value={{ refreshSession: vi.fn(), logout: vi.fn() }}
          >
            <Routes>
              <Route path="/register" element={<RegisterForm />} />
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
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Email already used")).toBeInTheDocument();
  });
});
