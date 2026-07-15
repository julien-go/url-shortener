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
    <section className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 rounded-xl border border-border bg-card p-6 sm:p-7">
        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Total clicks
        </div>
        <div className="font-display text-4xl font-extrabold leading-tight text-primary">
          {totalClicks ?? (isLoading ? "…" : "—")}
        </div>
      </div>
      <div className="space-y-2 rounded-xl border border-border bg-card p-6 sm:p-7">
        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Last click
        </div>
        <div className="font-display text-[1.375rem] font-extrabold leading-tight">
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
