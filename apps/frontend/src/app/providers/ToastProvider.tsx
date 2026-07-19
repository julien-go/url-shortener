import * as React from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import {
  ToastContext,
  type ToastContextValue,
  type ToastItem,
} from "./toastContext";
import { cn } from "../../lib/utils";

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const;

const DISMISS_MS = 2500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);

  const remove = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useCallback<ToastContextValue["toast"]>(
    ({ message, variant = "info" }) => {
      const id = (idRef.current += 1);
      setToasts((prev) => [...prev, { id, message, variant }]);
      window.setTimeout(() => remove(id), DISMISS_MS);
    },
    [remove],
  );

  const value = React.useMemo<ToastContextValue>(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((item) => {
          const Icon = TOAST_ICONS[item.variant];
          return (
            <div
              key={item.id}
              role={item.variant === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg",
                item.variant === "success" &&
                  "border-primary bg-primary text-primary-foreground",
                item.variant === "error" &&
                  "border-destructive bg-destructive text-destructive-foreground",
                item.variant === "info" &&
                  "border-border bg-card text-foreground",
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0" />
              <span>{item.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
