import { Button } from "../../../../components/ui/button";
import { ErrorBanner } from "../../../../components/ui/error-banner";
import { ClicksBarChart } from "./ClicksBarChart";
import type { LinkSeriesItem } from "./types";

function formatSeriesDayLabel(dayUtc: string) {
  const [year, month, day] = dayUtc.split("-");
  if (!year || !month || !day) return dayUtc;
  return `${day}/${month}`;
}

export function ClicksSection({
  queryError,
  isFetching,
  totalClicks,
  series,
  onRefresh,
}: {
  queryError: unknown;
  isFetching: boolean;
  totalClicks: string | undefined;
  series: LinkSeriesItem[];
  onRefresh: () => void;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-6 sm:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold">Clicks per day</h2>
        <Button
          variant="outline"
          size="sm"
          className="bg-card hover:bg-accent"
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
          <ClicksBarChart series={series} height={220} />

          <div className="sr-only" aria-live="polite">
            <p>
              Daily clicks over the selected period ({series.length} days, total{" "}
              {totalClicks ?? 0} clicks).
            </p>
            <table className="w-full caption-bottom text-sm">
              <caption>Accessible data table for clicks per day.</caption>
              <thead>
                <tr>
                  <th scope="col">Day (UTC)</th>
                  <th scope="col">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {series.map((seriesItem) => (
                  <tr key={seriesItem.dayUtc}>
                    <td>
                      <span>{formatSeriesDayLabel(seriesItem.dayUtc)}</span>
                      <span> ({seriesItem.dayUtc})</span>
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
