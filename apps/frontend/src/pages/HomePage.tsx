import { Link } from "react-router-dom";
import { useAuth } from "../app/providers/useAuth";
import { useMe } from "../features/auth/hooks/useMe";
import { CreateShortUrlForm } from "../features/links/components/CreateShortUrlForm";

export function HomePage() {
  const { token, logout } = useAuth();
  const me = useMe();

  const isSignedIn = !!token && !!me.data;

  return (
    <div style={{ maxWidth: 720, margin: "48px auto", padding: 16 }}>
      <h1>URL Shortener</h1>
      {!isSignedIn ? (
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span>
            {me.isLoading
              ? "Loading user..."
              : me.data
                ? `Signed in as ${me.data.email}`
                : "Signed in"}
          </span>
          <button onClick={logout}>Logout</button>
        </div>
      )}
      {isSignedIn && <CreateShortUrlForm />}
    </div>
  );
}
