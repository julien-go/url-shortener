import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import { useAuth } from "../../../app/providers/useAuth";

export function LoginForm() {
  const nav = useNavigate();
  const { setSession } = useAuth();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = await loginMutation.mutateAsync({
      email,
      password,
    });

    setSession(data.login.token);
    nav("/");
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span>Email</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Password</span>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          required
        />
      </label>

      <button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? "Signing in..." : "Sign in"}
      </button>

      {loginMutation.isError ? (
        <p style={{ color: "crimson", margin: 0 }}>
          {loginMutation.error instanceof Error
            ? loginMutation.error.message
            : "Login failed"}
        </p>
      ) : null}

      <p style={{ margin: 0, opacity: 0.9 }}>
        No account? <Link to="/register">Create one</Link>
      </p>
    </form>
  );
}
