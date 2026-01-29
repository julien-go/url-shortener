import * as React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegister } from "../hooks/useRegister";
import { useAuth } from "../../../app/providers/useAuth";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

export function RegisterForm() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const registerMutation = useRegister();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    const data = await registerMutation.mutateAsync({ email, password });

    setSession(data.register.token);
    navigate("/");
  }

  const errorMessage = registerMutation.isError
    ? registerMutation.error instanceof Error
      ? registerMutation.error.message
      : "Registration failed"
    : null;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
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

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
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
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="underline hover:text-foreground">
          Sign in
        </Link>
      </p>
    </form>
  );
}
