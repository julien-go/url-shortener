import { Button } from "../../../../components/ui/button";
import { ErrorBanner } from "../../../../components/ui/error-banner";
import { ClicksBarChart } from "./ClicksBarChart";
import type { ClickPoint, StatsGranularity } from "../../api/types";
import { bucketNoun, formatBucketLabel } from "./trend";

const BUCKET_COLUMN_HEADER: Record<StatsGranularity, string> = {
  DAY: "Day (UTC)",
  WEEK: "Week starting (UTC)",
  MONTH: "Month (UTC)",
};

export function ClicksSection({
  queryError,
  isFetching,
  rangeClicks,
  series,
  granularity,
  onRefresh,
}: {
  queryError: unknown;
  isFetching: boolean;
  rangeClicks: number | undefined;
  series: ClickPoint[];
  granularity: StatsGranularity;
  onRefresh: () => void;
}) {
  const title =
    granularity === "DAY"
      ? "Clicks per day"
      : granularity === "WEEK"
        ? "Clicks per week"
        : "Clicks per month";

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-6 sm:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold">{title}</h2>
        <Button
          variant="surface"
          size="sm"
          onClick={onRefresh}
          disabled={isFetching}
        >
          Refresh
        </Button>
      </div>

      {queryError ? (
        <ErrorBanner>
          <p>Failed to load statistics.</p>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Retry
          </Button>
        </ErrorBanner>
      ) : series.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No clicks yet. Share your link to get started.
        </div>
      ) : (
        <>
          <ClicksBarChart
            series={series}
            granularity={granularity}
            height={220}
          />

          <div className="sr-only" aria-live="polite">
            <p>
              Clicks over the selected period ({series.length}{" "}
              {bucketNoun(granularity, series.length)}, total {rangeClicks ?? 0}{" "}
              clicks).
            </p>
            <table className="w-full caption-bottom text-sm">
              <caption>Accessible data table for clicks per bucket.</caption>
              <thead>
                <tr>
                  <th scope="col">{BUCKET_COLUMN_HEADER[granularity]}</th>
                  <th scope="col">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {series.map((seriesItem) => (
                  <tr key={seriesItem.bucketStart}>
                    <td>
                      <span>
                        {formatBucketLabel(seriesItem.bucketStart, granularity)}
                      </span>
                      <span> ({seriesItem.bucketStart})</span>
                    </td>
                    <td>{seriesItem.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
