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
    <article className="space-y-3 rounded-lg border border-border/80 bg-background p-4">
      <div className="space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Short link
        </p>
        <a
          href={link.shortLink}
          target="_blank"
          rel="noreferrer"
          aria-label={`${link.shortLink}`}
          className="focus-premium block break-all rounded-md text-sm font-medium underline decoration-primary/60 underline-offset-4 transition hover:text-primary"
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

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="min-h-11"
          onClick={() => onStats(link.id)}
        >
          Statistics
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="min-h-11"
          onClick={() => onCopy(link.shortLink)}
        >
          Copy
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="col-span-2 min-h-11 text-destructive/85 hover:text-destructive"
          onClick={() => onStartDelete(link.id)}
          disabled={isDeleting}
        >
          Delete
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
