import * as React from "react";
import {
  ToastContext,
  type ToastContextValue,
  type ToastItem,
} from "./toastContext";
import { cn } from "../../lib/utils";

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
        {toasts.map((item) => (
          <div
            key={item.id}
            role={item.variant === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto w-full max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg",
              item.variant === "success" &&
                "border-primary/30 bg-primary/10 text-foreground",
              item.variant === "error" &&
                "border-destructive/30 bg-destructive/10 text-destructive",
              item.variant === "info" &&
                "border-border/70 bg-background text-foreground",
            )}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
