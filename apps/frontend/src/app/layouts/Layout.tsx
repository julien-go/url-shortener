import * as React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../providers/useAuth";
import { useMe } from "../../features/auth/hooks/useMe";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { appConfig } from "../../config/app";

type LayoutProps = {
  children: React.ReactNode;
  maxWidth?: "md" | "lg" | "xl";
};

function getMaxWidthClass(maxWidth: LayoutProps["maxWidth"]) {
  if (maxWidth === "md") return "max-w-md";
  if (maxWidth === "lg") return "max-w-4xl";
  return "max-w-5xl";
}

function navLinkClass(compact: boolean) {
  const padding = compact ? "px-3 py-1.5" : "px-4 py-2";
  return ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `focus-premium rounded-md bg-primary/12 ${padding} font-semibold text-primary transition hover:bg-primary/20`
      : `focus-premium rounded-md ${padding} font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground`;
}

export function Layout({ children, maxWidth = "xl" }: LayoutProps) {
  const { logout } = useAuth();
  const meQuery = useMe();

  const isSignedIn = Boolean(meQuery.data);

  return (
    <div className="min-h-screen w-full px-3 pb-12 pt-3 sm:px-4 md:px-7 md:pt-5">
      <a
        href="#main-content"
        className="focus-premium sr-only absolute left-3 top-3 z-50 rounded-md bg-background px-3 py-2 text-sm font-medium text-foreground focus:not-sr-only"
      >
        Skip to main content
      </a>
      <div
        className={`mx-auto w-full ${getMaxWidthClass(maxWidth)} space-y-10`}
      >
        <header className="sticky top-0 z-30 border-b border-border bg-background py-3 md:py-5">
          {/* Mobile: two fixed rows (logo+primary action, then tabs+secondary item) — no reflow. */}
          <div className="flex flex-col gap-2.5 md:hidden">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="font-display focus-premium rounded-md px-1.5 py-1 text-[1.375rem] font-bold text-foreground transition hover:text-primary"
              >
                {appConfig.appName}
              </Link>

              {!isSignedIn ? (
                <Button asChild size="sm">
                  <Link to="/register">Create account</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => void logout()}>
                  Sign out
                </Button>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-sm">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `shrink-0 whitespace-nowrap ${navLinkClass(true)({ isActive })}`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/links"
                className={({ isActive }) =>
                  `shrink-0 whitespace-nowrap ${navLinkClass(true)({ isActive })}`
                }
              >
                My links
              </NavLink>

              {!isSignedIn ? (
                <Link
                  to="/login"
                  className="focus-premium ml-auto shrink-0 whitespace-nowrap rounded-md px-2 py-1 font-medium text-muted-foreground transition-opacity hover:opacity-60"
                >
                  Sign in
                </Link>
              ) : (
                <Badge
                  variant="secondary"
                  className="ml-auto max-w-32 truncate rounded-full px-2.5 py-1 text-xs"
                >
                  {meQuery.isLoading
                    ? "Loading…"
                    : meQuery.data
                      ? meQuery.data.email
                      : "Signed in"}
                </Badge>
              )}
            </div>
          </div>

          {/* Desktop: single row, logo+tabs left, auth actions right. */}
          <div className="hidden md:flex md:items-center md:justify-between">
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="font-display focus-premium rounded-md px-1.5 py-1 text-[1.375rem] font-bold text-foreground transition hover:text-primary"
              >
                {appConfig.appName}
              </Link>

              <nav className="flex items-center gap-1.5 text-sm">
                <NavLink to="/" end className={navLinkClass(false)}>
                  Home
                </NavLink>
                <NavLink to="/links" className={navLinkClass(false)}>
                  My links
                </NavLink>
              </nav>
            </div>

            {!isSignedIn ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="focus-premium rounded-md text-sm font-semibold text-foreground transition-opacity hover:opacity-60"
                >
                  Sign in
                </Link>
                <Button asChild>
                  <Link to="/register">Create account</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
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

        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
