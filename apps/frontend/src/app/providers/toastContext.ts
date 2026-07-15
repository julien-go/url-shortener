import { createContext } from "react";

export type ToastVariant = "success" | "error" | "info";

export type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

export type ToastInput = {
  message: string;
  variant?: ToastVariant;
};

export type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);
