import * as React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import { useAuth } from "../../../app/providers/useAuth";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

export function LoginForm() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const loginMutation = useLogin();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      await loginMutation.mutateAsync({ email, password });
      await refreshSession();
      navigate("/");
    } catch {
      // React Query will surface the error state.
    }
  }

  const errorMessage = loginMutation.isError
    ? loginMutation.error instanceof Error
      ? loginMutation.error.message
      : "Login failed"
    : null;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-col space-y-2.5 gap-y-1 mb-8">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="flex flex-col space-y-2.5 gap-y-1 mb-8">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      <Button
        className="w-full"
        type="submit"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? "Signing in..." : "Sign in"}
      </Button>

      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <p className="text-sm text-muted-foreground">
        No account?{" "}
        <Link to="/register" className="underline hover:text-foreground">
          Create one
        </Link>
      </p>
    </form>
  );
}
