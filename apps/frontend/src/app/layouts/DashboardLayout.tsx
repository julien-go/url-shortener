import * as React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../providers/useAuth";
import { useMe } from "../../features/auth/hooks/useMe";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";

type DashboardLayoutProps = {
  children: React.ReactNode;
  maxWidth?: "md" | "lg" | "xl";
};

function getMaxWidthClass(maxWidth: DashboardLayoutProps["maxWidth"]) {
  if (maxWidth === "md") return "max-w-md";
  if (maxWidth === "lg") return "max-w-4xl";
  return "max-w-5xl";
}

export function DashboardLayout({
  children,
  maxWidth = "xl",
}: DashboardLayoutProps) {
  const { token, logout } = useAuth();
  const meQuery = useMe();

  const isSignedIn = Boolean(token) && Boolean(meQuery.data);

  return (
    <div className="min-h-screen w-full bg-muted/40 px-4 py-10">
      <div className={`mx-auto w-full ${getMaxWidthClass(maxWidth)} space-y-6`}>
        <Card className="rounded-2xl">
          <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-lg font-semibold hover:opacity-80">
                URL Shortener
              </Link>

              <Separator
                orientation="vertical"
                className="hidden h-6 md:block"
              />

              <nav className="flex items-center gap-2 text-sm">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    isActive
                      ? "rounded-md bg-muted px-3 py-1 text-foreground"
                      : "rounded-md px-3 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                >
                  Home
                </NavLink>

                <NavLink
                  to="/links"
                  className={({ isActive }) =>
                    isActive
                      ? "rounded-md bg-muted px-3 py-1 text-foreground"
                      : "rounded-md px-3 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                >
                  My links
                </NavLink>
              </nav>
            </div>

            {!isSignedIn ? (
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Create account</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  {meQuery.isLoading
                    ? "Loading…"
                    : meQuery.data
                      ? meQuery.data.email
                      : "Signed in"}
                </Badge>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="cursor-pointer"
                >
                  Sign out
                </Button>
              </div>
            )}
          </div>
        </Card>

        <main>{children}</main>
      </div>
    </div>
  );
}
