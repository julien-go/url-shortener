import type { StatsGranularity, StatsRange } from "../../api/types";

export const RANGE_OPTIONS: { value: StatsRange; label: string }[] = [
  { value: "DAYS_7", label: "7 days" },
  { value: "DAYS_30", label: "30 days" },
  { value: "DAYS_90", label: "90 days" },
  { value: "MONTHS_12", label: "12 months" },
];

const BUCKET_NOUN: Record<StatsGranularity, string> = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
};

export function bucketNoun(granularity: StatsGranularity, count: number) {
  const noun = BUCKET_NOUN[granularity];
  return count === 1 ? noun : `${noun}s`;
}

export function formatBucketLabel(
  bucketStart: string,
  granularity: StatsGranularity,
) {
  const [year, month, day] = bucketStart.split("-");
  if (!year || !month || !day) return bucketStart;
  if (granularity === "MONTH") return `${month}/${year.slice(2)}`;
  return `${day}/${month}`;
}

export type Trend =
  | { kind: "unavailable" }
  | { kind: "flat" }
  | { kind: "up"; percent: number }
  | { kind: "down"; percent: number };

export function computeTrend(current: number, previous: number): Trend {
  if (previous === 0) return { kind: "unavailable" };
  if (current === previous) return { kind: "flat" };

  const percent = Math.abs(Math.round(((current - previous) / previous) * 100));

  return current > previous
    ? { kind: "up", percent }
    : { kind: "down", percent };
}

export function formatTrend(trend: Trend) {
  if (trend.kind === "unavailable") return "—";
  if (trend.kind === "flat") return "0%";
  return `${trend.kind === "up" ? "+" : "−"}${trend.percent}%`;
}
