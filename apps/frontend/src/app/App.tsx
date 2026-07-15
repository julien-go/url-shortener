import { Component, lazy, Suspense } from "react";
import type { ComponentType, ReactNode } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useMe } from "../features/auth/hooks/useMe";
import { Layout } from "./layouts/Layout";
import { Button } from "../components/ui/button";
import { HomePage } from "../pages/HomePage";

function lazyPage<K extends string>(
  loader: () => Promise<Record<K, ComponentType>>,
  name: K,
) {
  return lazy(() => loader().then((module) => ({ default: module[name] })));
}

const LoginPage = lazyPage(() => import("../pages/LoginPage"), "LoginPage");
const RegisterPage = lazyPage(
  () => import("../pages/RegisterPage"),
  "RegisterPage",
);
const MyLinksPage = lazyPage(
  () => import("../pages/MyLinksPage"),
  "MyLinksPage",
);
const LinkStatsPage = lazyPage(
  () => import("../pages/LinkStatsPage"),
  "LinkStatsPage",
);
const NotFoundPage = lazyPage(
  () => import("../pages/NotFoundPage"),
  "NotFoundPage",
);

function CenteredLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="p-6 text-sm text-muted-foreground"
    >
      Loading…
    </div>
  );
}

class RouteErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="space-y-3 p-6 text-sm text-muted-foreground">
          <p>Something went wrong loading this page.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Reload
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const meQuery = useMe();

  if (meQuery.isLoading) {
    return <CenteredLoading />;
  }

  if (!meQuery.data) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const location = useLocation();
  const meQuery = useMe();

  if (meQuery.data) {
    const from = (location.state as { from?: string } | null)?.from ?? "/";
    return <Navigate to={from} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Layout maxWidth="lg">
      <RouteErrorBoundary>
        <Suspense fallback={<CenteredLoading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={
                <GuestOnly>
                  <LoginPage />
                </GuestOnly>
              }
            />
            <Route
              path="/register"
              element={
                <GuestOnly>
                  <RegisterPage />
                </GuestOnly>
              }
            />
            <Route
              path="/links"
              element={
                <RequireAuth>
                  <MyLinksPage />
                </RequireAuth>
              }
            />
            <Route
              path="/links/:id/stats"
              element={
                <RequireAuth>
                  <LinkStatsPage />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </Layout>
  );
}
