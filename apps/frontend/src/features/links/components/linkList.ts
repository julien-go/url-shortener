import type { MyLink } from "../api/types";

export type LinkItemProps = {
  link: MyLink;
  isConfirmingDelete: boolean;
  isDeleting: boolean;
  onStats: (id: string) => void;
  onCopy: (shortLink: string) => void;
  onStartDelete: (id: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
};

export function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString();
}
