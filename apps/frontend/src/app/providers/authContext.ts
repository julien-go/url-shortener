import { createContext } from "react";

export type AuthContextValue = {
  token: string | null;
  setSession: (token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
