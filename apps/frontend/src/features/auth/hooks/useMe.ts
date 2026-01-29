import { useQuery } from "@tanstack/react-query";
import { me } from "../api/me.query";
import { useAuth } from "../../../app/providers/useAuth";

export function useMe() {
  const { token, logout } = useAuth();

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return await me();
      } catch (err) {
        if (token) logout();
        throw err;
      }
    },
    enabled: !!token,
    retry: false,
    select: (data) => data.me,
  });
}
