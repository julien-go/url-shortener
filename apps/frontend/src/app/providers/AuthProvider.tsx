import { useCallback, useMemo, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext, type AuthContextValue } from "./authContext";
import { logout as logoutMutation } from "../../features/auth/api/logout.mutation";
import { resetSessionQueries } from "../../features/auth/session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const refreshSession = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["me"] });
  }, [queryClient]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation();
    } finally {
      resetSessionQueries(queryClient);
    }
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({ refreshSession, logout }),
    [logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
