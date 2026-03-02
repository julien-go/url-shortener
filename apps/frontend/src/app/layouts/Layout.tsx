import * as React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../providers/useAuth";
import { useMe } from "../../features/auth/hooks/useMe";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";

type LayoutProps = {
  children: React.ReactNode;
  maxWidth?: "md" | "lg" | "xl";
};

function getMaxWidthClass(maxWidth: LayoutProps["maxWidth"]) {
  if (maxWidth === "md") return "max-w-md";
  if (maxWidth === "lg") return "max-w-4xl";
  return "max-w-5xl";
}

export function Layout({ children, maxWidth = "xl" }: LayoutProps) {
  const { logout } = useAuth();
  const meQuery = useMe();

  const isSignedIn = Boolean(meQuery.data);

  return (
    <div className="min-h-screen w-full px-4 pb-14 pt-4 md:px-7 md:pt-5">
      <div
        className={`mx-auto w-full ${getMaxWidthClass(maxWidth)} space-y-10`}
      >
        <header
          className="sticky top-0 z-30 py-4.5 md:py-6 border-b border-border/50 bg-background/35 supports-backdrop-filter:bg-background/25 backdrop-blur-sm supports-backdrop-filter:backdrop-blur-md
"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
              <Link
                to="/"
                className="font-display focus-premium rounded-md px-1.5 py-1 text-[1.14rem] font-bold text-foreground transition hover:text-primary"
              >
                URL Shortener
              </Link>

              <Separator
                orientation="vertical"
                className="hidden h-6 md:block"
              />

              <nav className="flex items-center gap-1 rounded-lg border border-border/70 bg-background/55 p-1 text-[0.95rem]">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    isActive
                      ? "focus-premium rounded-md bg-primary/14 px-3.5 py-2 font-semibold text-primary shadow-[inset_0_0_0_1px_rgba(108,86,255,0.28)]"
                      : "focus-premium rounded-md px-3.5 py-2 font-medium text-muted-foreground transition hover:bg-accent/70 hover:text-foreground"
                  }
                >
                  Home
                </NavLink>

                <NavLink
                  to="/links"
                  className={({ isActive }) =>
                    isActive
                      ? "focus-premium rounded-md bg-primary/14 px-3.5 py-2 font-semibold text-primary shadow-[inset_0_0_0_1px_rgba(108,86,255,0.28)]"
                      : "focus-premium rounded-md px-3.5 py-2 font-medium text-muted-foreground transition hover:bg-accent/70 hover:text-foreground"
                  }
                >
                  My links
                </NavLink>
              </nav>
            </div>

            {!isSignedIn ? (
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Create account</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="secondary">
                  {meQuery.isLoading
                    ? "Loading…"
                    : meQuery.data
                      ? meQuery.data.email
                      : "Signed in"}
                </Badge>
                <Button variant="outline" onClick={() => void logout()}>
                  Sign out
                </Button>
              </div>
            )}
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
