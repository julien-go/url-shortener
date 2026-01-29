import { useMutation } from "@tanstack/react-query";
import { createShortUrl } from "../api/createShortUrl.mutation";
import type { CreateShortUrlInput } from "../api/types";

export function useCreateShortUrl() {
  return useMutation({
    mutationFn: (input: CreateShortUrlInput) => createShortUrl(input),
  });
}
