import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi, beforeEach } from "vitest";
import App from "../src/app/App";
import { AuthContext } from "../src/app/providers/authContext";
import { ToastProvider } from "../src/app/providers/ToastProvider";

const useMeMock = vi.hoisted(() => vi.fn());
vi.mock("../src/features/auth/hooks/useMe", () => ({ useMe: useMeMock }));

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

function renderApp(initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthContext.Provider
            value={{ refreshSession: vi.fn(), logout: vi.fn() }}
          >
            <App />
          </AuthContext.Provider>
        </ToastProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe("App protected routes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useMeMock.mockReturnValue({
      data: {
        id: "u1",
        email: "test@example.com",
        createdAt: new Date().toISOString(),
      },
      isLoading: false,
    });
  });

  it("renders /links page when authenticated", async () => {
    renderApp("/links");

    expect(await screen.findByText("No links yet.")).toBeInTheDocument();
  });

  it("shows a loading state while the auth check is pending", () => {
    useMeMock.mockReturnValue({ data: undefined, isLoading: true });

    renderApp("/links");

    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
  });
});
