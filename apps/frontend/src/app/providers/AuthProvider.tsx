import React, { useMemo, useSyncExternalStore } from "react";
import { AuthContext, type AuthContextValue } from "./authContext";
import {
  getToken,
  setToken,
  clearToken,
  subscribeToken,
} from "../../features/auth/tokenStorage";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const tokenState = useSyncExternalStore(subscribeToken, getToken, getToken);

  function setSession(token: string) {
    setToken(token);
  }

  function logout() {
    clearToken();
  }

  const value = useMemo<AuthContextValue>(
    () => ({ token: tokenState, setSession, logout }),
    [tokenState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
