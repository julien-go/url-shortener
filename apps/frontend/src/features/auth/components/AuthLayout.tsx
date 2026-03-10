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
    <div className="w-full px-3 py-6 sm:px-4 sm:py-10 md:py-12">
      <div className="mx-auto w-full max-w-lg">
        <Card className="rounded-xl border-border/80 bg-card/96">
          <CardHeader className="space-y-1 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
            <CardTitle className="text-[1.55rem] sm:text-2xl">
              {title}
            </CardTitle>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
