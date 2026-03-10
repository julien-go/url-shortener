import { Button } from "../../../components/ui/button";

type MyLinksPaginationProps = {
  canGoPrevious: boolean;
  canGoNext: boolean;
  isFetching: boolean;
  rangeLabel: string;
  onPrevious: () => void;
  onNext: () => void;
};

export function MyLinksPagination({
  canGoPrevious,
  canGoNext,
  isFetching,
  rangeLabel,
  onPrevious,
  onNext,
}: MyLinksPaginationProps) {
  if (!canGoPrevious && !canGoNext) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        {isFetching ? "Loading…" : rangeLabel}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious || isFetching}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={onNext}
          disabled={!canGoNext || isFetching}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
