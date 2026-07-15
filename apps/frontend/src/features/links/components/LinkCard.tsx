import { Copy, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { DeleteConfirm } from "./DeleteConfirm";
import { formatDateLabel, type LinkItemProps } from "./linkList";

export function LinkCard({
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
    <article className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Short link
        </p>
        <a
          href={link.shortLink}
          target="_blank"
          rel="noreferrer"
          aria-label={`${link.shortLink}`}
          className="focus-premium block break-all rounded-md text-sm font-semibold text-primary transition-opacity hover:opacity-60"
        >
          {link.shortLink}
        </a>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Target URL
        </p>
        <a
          href={link.originalUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`${link.originalUrl}`}
          className="block break-all text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          {link.originalUrl}
        </a>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Clicks</p>
          <p className="font-semibold tabular-nums">{link.clickCount}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Created</p>
          <p className="font-medium text-foreground/90">
            {formatDateLabel(link.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border pt-3.5">
        <Button
          variant="surface"
          size="sm"
          className="min-h-9 flex-1"
          onClick={() => onStats(link.id)}
        >
          Statistics
        </Button>
        <Button
          variant="surface"
          size="icon"
          className="h-9 w-9 shrink-0 text-foreground"
          onClick={() => onCopy(link.shortLink)}
          aria-label={`Copy short link ${link.code}`}
        >
          <Copy className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 border-destructive/40 bg-destructive/12 text-destructive hover:bg-destructive/22"
          onClick={() => onStartDelete(link.id)}
          disabled={isDeleting}
          aria-label={`Delete short link ${link.code}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {isConfirmingDelete ? (
        <DeleteConfirm
          isDeleting={isDeleting}
          onCancel={onCancelDelete}
          onConfirm={() => onConfirmDelete(link.id)}
        />
      ) : null}
    </article>
  );
}
