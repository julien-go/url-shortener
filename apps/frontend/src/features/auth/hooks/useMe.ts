import { useQuery } from "@tanstack/react-query";
import { me } from "../api/me.query";
import { useAuth } from "../../../app/providers/useAuth";

export function useMe() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["me"],
    queryFn: () => me(),
    enabled: !!token,
    retry: false,
    select: (data) => data.me,
  });
}
