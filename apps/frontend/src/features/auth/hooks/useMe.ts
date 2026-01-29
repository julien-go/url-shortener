import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../app/providers/useAuth";
import { me } from "../api/me.query";

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
