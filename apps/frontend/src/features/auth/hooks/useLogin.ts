import { useMutation } from "@tanstack/react-query";
import { login } from "../api/login.mutation";

export function useLogin() {
  return useMutation({
    mutationFn: (input: { email: string; password: string }) => login(input),
  });
}
