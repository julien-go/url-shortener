import { Button } from "../../../../components/ui/button";
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
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Clicks per day</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isFetching}
        >
          Refresh
        </Button>
      </div>

      {queryError ? (
        <div className="space-y-2">
          <div role="alert" className="text-sm text-destructive">
            Failed to load statistics.
          </div>
          <Button variant="outline" onClick={onRefresh}>
            Retry
          </Button>
        </div>
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
