import type { StatsRange } from "../../api/types";
import { computeTrend, formatTrend, RANGE_OPTIONS } from "./trend";

function formatLastClickedAt(value: string | null) {
  if (!value) return "—";
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) return value;
  return dateValue.toLocaleString();
}

function rangeLabel(range: StatsRange) {
  return (
    RANGE_OPTIONS.find((option) => option.value === range)?.label ?? "period"
  );
}

function TrendLine({
  rangeClicks,
  previousRangeClicks,
}: {
  rangeClicks: number;
  previousRangeClicks: number;
}) {
  const trend = computeTrend(rangeClicks, previousRangeClicks);

  const tone =
    trend.kind === "up"
      ? "text-emerald-700"
      : trend.kind === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <p className="text-xs text-muted-foreground">
      <span className={`font-bold ${tone}`}>{formatTrend(trend)}</span>{" "}
      {trend.kind === "unavailable"
        ? "no clicks in the previous period"
        : `vs ${previousRangeClicks} in the previous period`}
    </p>
  );
}

export function MetricsSummarySection({
  totalClicks,
  lastClickedAt,
  rangeClicks,
  previousRangeClicks,
  range,
  isLoading,
}: {
  totalClicks: string | undefined;
  lastClickedAt: string | null | undefined;
  rangeClicks: number | undefined;
  previousRangeClicks: number | undefined;
  range: StatsRange;
  isLoading: boolean;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2 rounded-xl border border-border bg-card p-6 sm:p-7">
        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Last {rangeLabel(range)}
        </div>
        <div className="font-display text-4xl font-extrabold leading-tight tabular-nums text-ocre-strong">
          {rangeClicks ?? (isLoading ? "…" : "—")}
        </div>
        {rangeClicks !== undefined && previousRangeClicks !== undefined ? (
          <TrendLine
            rangeClicks={rangeClicks}
            previousRangeClicks={previousRangeClicks}
          />
        ) : null}
      </div>
      <div className="space-y-2 rounded-xl border border-border bg-card p-6 sm:p-7">
        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Total clicks
        </div>
        <div className="font-display text-4xl font-extrabold leading-tight tabular-nums">
          {totalClicks ?? (isLoading ? "…" : "—")}
        </div>
        <p className="text-xs text-muted-foreground">All time</p>
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
