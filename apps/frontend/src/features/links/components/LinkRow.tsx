import { Copy, Trash2 } from "lucide-react";
import { TableCell, TableRow } from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { DeleteConfirm } from "./DeleteConfirm";
import { formatDateLabel, type LinkItemProps } from "./linkList";

export function LinkRow({
  link,
  index,
  isConfirmingDelete,
  isDeleting,
  onStats,
  onCopy,
  onStartDelete,
  onCancelDelete,
  onConfirmDelete,
}: LinkItemProps & { index: number }) {
  return (
    <TableRow
      className={
        index % 2 === 0
          ? "bg-background/10 hover:bg-muted/75"
          : "bg-primary/4 hover:bg-primary/10"
      }
    >
      <TableCell className="px-4 py-3.5 align-top">
        <a
          href={link.shortLink}
          target="_blank"
          rel="noreferrer"
          aria-label={`${link.shortLink}`}
          className="focus-premium block max-w-60 truncate rounded-md text-sm font-medium underline decoration-primary/60 underline-offset-4 transition "
          title={link.shortLink}
        >
          {link.shortLink}
        </a>
      </TableCell>
      <TableCell className="px-4 py-3.5 align-top">
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

      <TableCell className="px-4 py-3.5 text-right tabular-nums align-top">
        {link.clickCount}
      </TableCell>

      <TableCell className="px-4 py-3.5 text-sm text-muted-foreground align-top">
        {formatDateLabel(link.createdAt)}
      </TableCell>

      <TableCell className="px-4 py-3.5 align-top">
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onStats(link.id)}
            aria-label={`View statistics for ${link.code}`}
          >
            Statistics
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onCopy(link.shortLink)}
            aria-label={`Copy short link ${link.code}`}
          >
            <Copy className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2.5 text-destructive/85 hover:text-destructive"
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
