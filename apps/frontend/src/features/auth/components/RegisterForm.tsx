import * as React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useRegister } from "../hooks/useRegister";
import { useAuth } from "../../../app/providers/useAuth";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

export function RegisterForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshSession } = useAuth();
  const registerMutation = useRegister();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      await registerMutation.mutateAsync({ email, password });
      await refreshSession();
      navigate(from, { replace: true });
    } catch {
      // React Query will surface the error state.
    }
  }

  const errorMessage = registerMutation.isError
    ? registerMutation.error instanceof Error
      ? registerMutation.error.message
      : "Registration failed"
    : null;

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4.5 sm:space-y-5"
      aria-busy={registerMutation.isPending}
    >
      <div className="mb-5 flex flex-col gap-y-1.5 space-y-2 sm:mb-6">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? "register-form-error" : undefined}
          required
        />
      </div>

      <div className="mb-5 flex flex-col gap-y-1.5 space-y-2 sm:mb-6">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          minLength={8}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? "register-form-error" : undefined}
          required
        />
      </div>

      <Button
        className="w-full"
        type="submit"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? "Creating..." : "Create account"}
      </Button>

      {errorMessage ? (
        <p
          id="register-form-error"
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      ) : null}

      <p className="pt-1 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="underline hover:text-foreground">
          Sign in
        </Link>
      </p>
    </form>
  );
}
