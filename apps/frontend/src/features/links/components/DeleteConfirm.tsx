import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";

export function DeleteConfirm({
  isDeleting,
  onCancel,
  onConfirm,
  className,
}: {
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Confirm deletion"
      onKeyDown={(event) => {
        if (event.key === "Escape") onCancel();
      }}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-md border border-destructive/25 bg-destructive/8 px-2.5 py-2 text-xs",
        className,
      )}
    >
      <span className="text-destructive/90">Delete this link?</span>
      <Button autoFocus variant="outline" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={onConfirm}
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting…" : "Confirm"}
      </Button>
    </div>
  );
}
