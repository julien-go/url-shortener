import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

export function ErrorBanner({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      role="alert"
      className={cn(
        "rounded-lg border border-destructive/35 bg-destructive/12 px-3.5 py-3 text-sm font-medium text-destructive",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <div className="space-y-2">{children}</div>
      </div>
    </div>
  );
}
