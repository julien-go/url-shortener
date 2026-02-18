import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi, beforeEach } from "vitest";
import App from "../src/app/App";
import {
  AuthContext,
  type AuthContextValue,
} from "../src/app/providers/authContext";

vi.mock("../src/features/links/hooks/useMyLinks", () => ({
  useMyLinks: () => ({
    data: {
      myLinks: {
        items: [],
        nextCursor: null,
        totalCount: 0,
      },
    },
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}));

function renderApp(initialEntry: string, authValue: AuthContextValue) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue}>
          <App />
        </AuthContext.Provider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe("App protected routes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders /links page when authenticated", async () => {
    renderApp("/links", {
      token: "token",
      setSession: vi.fn(),
      logout: vi.fn(),
    });

    expect(await screen.findByText("No links yet.")).toBeInTheDocument();
  });
});
