import React, { useMemo, useState } from "react";
import { AuthContext, type AuthContextValue } from "./authContext";
import {
  getToken,
  setToken,
  clearToken,
} from "../../features/auth/tokenStorage";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokenState, setTokenState] = useState<string | null>(() => getToken());

  function setSession(token: string) {
    setToken(token);
    setTokenState(token);
  }

  function logout() {
    clearToken();
    setTokenState(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({ token: tokenState, setSession, logout }),
    [tokenState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
