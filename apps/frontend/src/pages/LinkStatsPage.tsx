import * as React from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";

import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { useLinkStats } from "../features/links/hooks/useLinkStats";

import { ClicksBarChart } from "../features/links/components/ClicksBarChart";
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
      <div className="rounded-md border border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
        Loading statistics…
      </div>
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
    <section className="space-y-5">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-[2.15rem]">
              Link statistics
            </h1>
            <p className="text-sm text-muted-foreground">
              <Link
                to="/links"
                className="underline decoration-primary/60 underline-offset-4 hover:text-foreground"
              >
                Back to my links
              </Link>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
        </div>
        <Separator className="bg-border/80" />
      </div>

      <section className="space-y-4 border-b border-border/70 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Link</h2>

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
        </div>

        {linkStatsQuery.error ? (
          <div className="text-sm text-muted-foreground">
            {getGraphQLRequestErrorMessage(
              linkStatsQuery.error,
              "Unable to load link details.",
            )}
          </div>
        ) : linkDetails ? (
          <div className="grid gap-4 text-sm md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-muted-foreground">Short link</div>
                <div className="font-mono break-all">
                  {linkDetails.shortLink}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground">Slug</div>
                <div className="font-mono">{linkDetails.code}</div>
              </div>
            </div>

            <div className="space-y-4"></div>

            <div className="space-y-1">
              <div className="text-muted-foreground">Target URL</div>
              <div className="break-all">{linkDetails.originalUrl}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Link not found.</div>
        )}
      </section>

      <section className="grid gap-4 border-b border-border/70 pb-5 md:grid-cols-2">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Total clicks</div>
          <div className="text-3xl font-bold leading-tight">
            {linkStats?.totalClicks ?? (linkStatsQuery.isLoading ? "…" : "—")}
          </div>
        </div>
        <div className="space-y-1 md:border-l md:border-border/70 md:pl-5">
          <div className="text-sm text-muted-foreground">Last click</div>
          <div className="text-2xl font-semibold leading-tight md:text-[1.65rem]">
            {linkStats
              ? formatLastClickedAt(linkStats.lastClickedAt)
              : linkStatsQuery.isLoading
                ? "…"
                : "—"}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Clicks per day</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => linkStatsQuery.refetch()}
            disabled={linkStatsQuery.isFetching}
          >
            Refresh
          </Button>
        </div>

        {linkStatsQuery.error ? (
          <div className="space-y-2">
            <div className="text-sm text-destructive">
              Failed to load statistics.
            </div>
            <Button variant="outline" onClick={() => linkStatsQuery.refetch()}>
              Retry
            </Button>
          </div>
        ) : series.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No clicks yet. Share your link to get started.
          </div>
        ) : (
          <ClicksBarChart series={series} height={220} />
        )}
      </section>
    </section>
  );
}
