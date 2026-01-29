import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegister } from "../hooks/useRegister";
import { useAuth } from "../../../app/providers/useAuth";

export function RegisterForm() {
  const nav = useNavigate();
  const { setSession } = useAuth();
  const registerMutation = useRegister();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = await registerMutation.mutateAsync({
      email,
      password,
    });

    setSession(data.register.token);
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
          autoComplete="new-password"
          required
        />
      </label>

      <button type="submit" disabled={registerMutation.isPending}>
        {registerMutation.isPending ? "Creating..." : "Create account"}
      </button>

      {registerMutation.isError ? (
        <p style={{ color: "crimson", margin: 0 }}>
          {registerMutation.error instanceof Error
            ? registerMutation.error.message
            : "Registration failed"}
        </p>
      ) : null}

      <p style={{ margin: 0, opacity: 0.9 }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </form>
  );
}
