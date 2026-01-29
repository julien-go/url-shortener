import { useMutation } from "@tanstack/react-query";
import { register } from "../api/register.mutation";

export function useRegister() {
  return useMutation({
    mutationFn: (input: { email: string; password: string }) => register(input),
  });
}
