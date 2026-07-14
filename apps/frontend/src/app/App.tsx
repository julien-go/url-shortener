import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { MyLinksPage } from "../pages/MyLinksPage";
import { LinkStatsPage } from "../pages/LinkStatsPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { useMe } from "../features/auth/hooks/useMe";
import { Layout } from "./layouts/Layout";

function AuthLoading() {
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

function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const meQuery = useMe();

  if (meQuery.isLoading) {
    return <AuthLoading />;
  }

  if (!meQuery.data) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

function GuestOnly({ children }: { children: React.ReactNode }) {
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
    </Layout>
  );
}
