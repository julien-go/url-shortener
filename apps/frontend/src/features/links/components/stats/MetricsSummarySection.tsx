function formatLastClickedAt(value: string | null) {
  if (!value) return "—";
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) return value;
  return dateValue.toLocaleString();
}

export function MetricsSummarySection({
  totalClicks,
  lastClickedAt,
  isLoading,
}: {
  totalClicks: string | undefined;
  lastClickedAt: string | null | undefined;
  isLoading: boolean;
}) {
  return (
    <section className="grid gap-4 border-b border-border/70 pb-5 md:grid-cols-2">
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">Total clicks</div>
        <div className="text-3xl font-bold leading-tight">
          {totalClicks ?? (isLoading ? "…" : "—")}
        </div>
      </div>
      <div className="space-y-1 md:border-l md:border-border/70 md:pl-5">
        <div className="text-sm text-muted-foreground">Last click</div>
        <div className="text-2xl font-semibold leading-tight md:text-[1.65rem]">
          {lastClickedAt !== undefined
            ? formatLastClickedAt(lastClickedAt)
            : isLoading
              ? "…"
              : "—"}
        </div>
      </div>
    </section>
  );
}
