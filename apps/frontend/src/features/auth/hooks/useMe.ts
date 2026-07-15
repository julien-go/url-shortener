import { useQuery } from "@tanstack/react-query";
import { me } from "../api/me.query";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => me(),
    retry: false,
    staleTime: 30_000,
    select: (data) => data.me,
  });
}
