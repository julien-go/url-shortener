import * as React from "react";

export function useCursorPagination() {
  const [stack, setStack] = React.useState<(string | null)[]>([null]);

  const currentCursor = stack[stack.length - 1];
  const page = stack.length;
  const canGoPrevious = stack.length > 1;

  const goToNext = React.useCallback(
    (nextCursor: string | null | undefined) => {
      if (!nextCursor) return;
      setStack((prev) => [...prev, nextCursor]);
    },
    [],
  );

  const goToPrevious = React.useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const reset = React.useCallback(() => setStack([null]), []);

  return { currentCursor, page, canGoPrevious, goToNext, goToPrevious, reset };
}
