import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import {
  AuthContext,
  AuthContextValue,
} from "../../../src/app/providers/authContext";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function renderAuthForm(
  path: string,
  formElement: ReactElement,
  authOverrides: Partial<AuthContextValue> = {},
) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <QueryClientProvider client={createQueryClient()}>
        <AuthContext.Provider
          value={{ refreshSession: vi.fn(), logout: vi.fn(), ...authOverrides }}
        >
          <Routes>
            <Route path={path} element={formElement} />
            <Route path="/" element={<div>Home page</div>} />
          </Routes>
        </AuthContext.Provider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}
