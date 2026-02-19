import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { MyLinksPage } from "../pages/MyLinksPage";
import { LinkStatsPage } from "../pages/LinkStatsPage";
import { useMe } from "../features/auth/hooks/useMe";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const meQuery = useMe();

  if (meQuery.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!meQuery.data) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
