import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchMyLinks } from "../api/myLinks.query";

export function useMyLinks(
  limit: number,
  cursor?: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: ["myLinks", limit, cursor],
    queryFn: () => fetchMyLinks({ limit, cursor }),
    enabled,
    staleTime: 10_000,
    placeholderData: keepPreviousData,
  });
}
