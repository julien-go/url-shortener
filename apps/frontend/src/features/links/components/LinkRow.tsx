import { Copy, Trash2 } from "lucide-react";
import { TableCell, TableRow } from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { DeleteConfirm } from "./DeleteConfirm";
import { formatDateLabel, type LinkItemProps } from "./linkList";

export function LinkRow({
  link,
  isConfirmingDelete,
  isDeleting,
  onStats,
  onCopy,
  onStartDelete,
  onCancelDelete,
  onConfirmDelete,
}: LinkItemProps) {
  return (
    <TableRow>
      <TableCell className="px-4 py-2.5 align-top">
        <a
          href={link.shortLink}
          target="_blank"
          rel="noreferrer"
          aria-label={`${link.shortLink}`}
          className="focus-premium block max-w-56 truncate rounded-md text-sm font-semibold text-primary transition-opacity hover:opacity-60"
          title={link.shortLink}
        >
          {link.shortLink}
        </a>
      </TableCell>
      <TableCell className="px-4 py-2.5 align-top">
        <a
          href={link.originalUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`${link.originalUrl}`}
          className="block max-w-50 truncate text-sm text-muted-foreground hover:text-foreground hover:underline"
          title={link.originalUrl}
        >
          {link.originalUrl}
        </a>
      </TableCell>

      <TableCell className="px-4 py-2.5 text-right font-semibold tabular-nums align-top">
        {link.clickCount}
      </TableCell>

      <TableCell className="px-4 py-2.5 text-sm text-muted-foreground align-top">
        {formatDateLabel(link.createdAt)}
      </TableCell>

      <TableCell className="px-4 py-2.5 align-top">
        <div className="flex justify-end gap-2">
          <Button
            variant="surface"
            size="sm"
            onClick={() => onStats(link.id)}
            aria-label={`View statistics for ${link.code}`}
          >
            Statistics
          </Button>
          <Button
            variant="surface"
            size="icon"
            className="h-8 w-8 text-foreground"
            onClick={() => onCopy(link.shortLink)}
            aria-label={`Copy short link ${link.code}`}
          >
            <Copy className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-destructive/40 bg-destructive/12 text-destructive hover:bg-destructive/22"
            onClick={() => onStartDelete(link.id)}
            disabled={isDeleting}
            aria-label={`Delete short link ${link.code}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        {isConfirmingDelete ? (
          <div className="mt-2 flex justify-end">
            <DeleteConfirm
              className="ml-auto justify-center"
              isDeleting={isDeleting}
              onCancel={onCancelDelete}
              onConfirm={() => onConfirmDelete(link.id)}
            />
          </div>
        ) : null}
      </TableCell>
    </TableRow>
  );
}
