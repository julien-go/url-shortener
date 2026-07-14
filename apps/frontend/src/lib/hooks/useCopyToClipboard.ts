import * as React from "react";

export type CopyStatus = "idle" | "copied" | "error";

export function useCopyToClipboard(resetMs = 2000) {
  const [status, setStatus] = React.useState<CopyStatus>("idle");
  const timeoutRef = React.useRef<number | null>(null);

  const copy = React.useCallback(
    async (text: string) => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      try {
        await navigator.clipboard.writeText(text);
        setStatus("copied");
      } catch {
        setStatus("error");
      }

      timeoutRef.current = window.setTimeout(() => {
        setStatus("idle");
        timeoutRef.current = null;
      }, resetMs);
    },
    [resetMs],
  );

  React.useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  return { status, copy };
}
