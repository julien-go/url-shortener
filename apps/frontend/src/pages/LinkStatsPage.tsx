import * as React from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { useLinkStats } from "../features/links/hooks/useLinkStats";

import { ClicksBarChart } from "../features/links/components/ClicksBarChart";
import { DashboardLayout } from "../app/layouts/DashboardLayout";
import {
  getGraphQLErrorCode,
  getGraphQLRequestErrorMessage,
  isGraphQLRequestError,
} from "../features/links/hooks/errors";

type StatsRange = "DAYS_7" | "DAYS_30";

function formatLastClickedAt(value: string | null) {
  if (!value) return "—";
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) return value;
  return dateValue.toLocaleString();
}

function shouldRedirectToLinks(error: unknown): boolean {
  if (!isGraphQLRequestError(error)) return false;

  return error.errors.some((errorItem) => {
    const code = getGraphQLErrorCode(errorItem);
    return code === "BAD_USER_INPUT" || code === "NOT_FOUND";
  });
}

export function LinkStatsPage() {
  const params = useParams<{ id: string }>();
  const linkId = params.id ?? "";

  const [range, setRange] = React.useState<StatsRange>("DAYS_7");
  const [copyStatus, setCopyStatus] = React.useState<
    "idle" | "copied" | "error"
  >("idle");

  const linkStatsQuery = useLinkStats(linkId, range);
  if (linkStatsQuery.isLoading || linkStatsQuery.isFetching) {
    return (
      <DashboardLayout maxWidth="xl">
        <div className="mx-auto w-full max-w-4xl p-4">
          <div className="rounded-lg border p-6 text-sm text-muted-foreground">
            Loading statistics…
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (shouldRedirectToLinks(linkStatsQuery.error)) {
    return <Navigate to="/links" replace />;
  }

  const linkStats = linkStatsQuery.data?.linkStats;
  const linkDetails = linkStats?.link ?? null;
  const series = linkStats?.series ?? [];

  async function handleCopyShortLink() {
    const shortLink = linkDetails?.shortLink;
    if (!shortLink) return;

    try {
      await navigator.clipboard.writeText(shortLink);
      setCopyStatus("copied");

      window.setTimeout(() => {
        setCopyStatus("idle");
      }, 1200);
    } catch {
      setCopyStatus("error");

      window.setTimeout(() => {
        setCopyStatus("idle");
      }, 1200);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-4xl space-y-6 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Link statistics</h1>

            <p className="text-sm text-muted-foreground">
              <Link
                to="/links"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Back to my links
              </Link>
            </p>
          </div>

          <ToggleGroup
            type="single"
            value={range}
            onValueChange={(rangeValue: string) => {
              if (!rangeValue) return;
              setRange(rangeValue as StatsRange);
            }}
          >
            <ToggleGroupItem value="DAYS_7">7 days</ToggleGroupItem>
            <ToggleGroupItem value="DAYS_30">30 days</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Link</CardTitle>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyShortLink}
                disabled={!linkDetails?.shortLink}
              >
                {copyStatus === "copied"
                  ? "Copied"
                  : copyStatus === "error"
                    ? "Copy failed"
                    : "Copy"}
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                disabled={!linkDetails?.shortLink}
              >
                <a
                  href={linkDetails?.shortLink ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open
                </a>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            {linkStatsQuery.isLoading ? (
              <div className="text-muted-foreground">Loading link details…</div>
            ) : linkStatsQuery.error ? (
              <div className="text-muted-foreground">
                {getGraphQLRequestErrorMessage(
                  linkStatsQuery.error,
                  "Unable to load link details.",
                )}
              </div>
            ) : linkDetails ? (
              <>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Short link</div>
                  <div className="font-mono break-all">
                    {linkDetails.shortLink}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground">Target URL</div>
                  <div className="break-all">{linkDetails.originalUrl}</div>
                </div>

                <div className="flex flex-wrap gap-6 pt-1">
                  <div>
                    <div className="text-muted-foreground">Code</div>
                    <div className="font-mono">{linkDetails.code}</div>
                  </div>

                  <div>
                    <div className="text-muted-foreground">Clicks</div>
                    <div>{linkDetails.clickCount}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">Link not found.</div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Total clicks</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {linkStats?.totalClicks ?? (linkStatsQuery.isLoading ? "…" : "—")}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Last click</CardTitle>
            </CardHeader>
            <CardContent className="text-lg">
              {linkStats
                ? formatLastClickedAt(linkStats.lastClickedAt)
                : linkStatsQuery.isLoading
                  ? "…"
                  : "—"}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Clicks per day</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => linkStatsQuery.refetch()}
                disabled={linkStatsQuery.isFetching}
              >
                Refresh
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {linkStatsQuery.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : linkStatsQuery.error ? (
              <div className="space-y-2">
                <div className="text-sm text-destructive">
                  Failed to load statistics.
                </div>
                <Button
                  variant="outline"
                  onClick={() => linkStatsQuery.refetch()}
                >
                  Retry
                </Button>
              </div>
            ) : series.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No clicks yet. Share your link to get started.
              </div>
            ) : (
              <ClicksBarChart series={series} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
