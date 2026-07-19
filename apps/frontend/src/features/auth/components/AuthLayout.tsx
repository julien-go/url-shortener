import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex w-full justify-center px-3 py-8 sm:px-4 sm:py-16 md:py-24">
      <div className="w-full max-w-110">
        <Card className="rounded-xl border-border bg-card shadow-(--shadow-surface)">
          <CardHeader className="space-y-1 px-6 pb-1 pt-7 sm:px-9 sm:pt-9">
            <CardTitle className="font-display text-[1.625rem] font-extrabold">
              {title}
            </CardTitle>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-7 sm:px-9 sm:pb-8">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
