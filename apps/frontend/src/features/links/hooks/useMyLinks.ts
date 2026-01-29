import { useQuery } from "@tanstack/react-query";
import { fetchMyLinks } from "../api/myLinks.query";

export function useMyLinks(limit: number, cursor?: string | null) {
  return useQuery({
    queryKey: ["myLinks", limit, cursor],
    queryFn: () => fetchMyLinks({ limit, cursor }),
    staleTime: 10_000,
  });
}
