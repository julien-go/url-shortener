import { createContext } from "react";

export type AuthContextValue = {
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
