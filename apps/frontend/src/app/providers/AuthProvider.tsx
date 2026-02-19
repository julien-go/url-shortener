import React, { useEffect, useMemo } from "react";
import { AuthContext, type AuthContextValue } from "./authContext";
import { logout as logoutMutation } from "../../features/auth/api/logout.mutation";
import { useQueryClient } from "@tanstack/react-query";
import { setGraphqlOnUnauthenticated } from "../../lib/graphql/graphqlFetch";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    setGraphqlOnUnauthenticated(() => {
      void queryClient.setQueryData(["me"], { me: null });
    });
  }, [queryClient]);

  async function refreshSession() {
    await queryClient.invalidateQueries({ queryKey: ["me"] });
  }

  async function logout() {
    try {
      await logoutMutation();
    } finally {
      await queryClient.setQueryData(["me"], { me: null });
      await queryClient.invalidateQueries({ queryKey: ["myLinks"] });
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({ refreshSession, logout }),
    [queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
