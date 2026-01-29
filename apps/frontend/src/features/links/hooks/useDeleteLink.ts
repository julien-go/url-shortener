import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLink } from "../api/deleteLink.mutation";

export function useDeleteLink() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteLink,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myLinks"] });
    },
  });
}
