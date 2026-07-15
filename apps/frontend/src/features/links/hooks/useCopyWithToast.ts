import { useCallback } from "react";
import { useToast } from "../../../app/providers/useToast";
import { copyText } from "../../../lib/clipboard";

export function useCopyWithToast() {
  const { toast } = useToast();

  return useCallback(
    async (text: string) => {
      const ok = await copyText(text);
      toast({
        message: ok
          ? "Copied to clipboard."
          : "Copy failed. Please copy manually.",
        variant: ok ? "success" : "error",
      });
    },
    [toast],
  );
}
