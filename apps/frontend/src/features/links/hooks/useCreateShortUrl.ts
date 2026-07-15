import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createShortUrl } from "../api/createShortUrl.mutation";
import type { CreateShortUrlInput } from "../api/types";

export function useCreateShortUrl() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateShortUrlInput) => createShortUrl(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myLinks"] });
    },
  });
}
