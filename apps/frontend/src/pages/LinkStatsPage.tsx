import * as React from "react";
import { useParams, Navigate } from "react-router-dom";
import { useLinkStats } from "../features/links/hooks/useLinkStats";
import type { LinkStatsResponse, StatsRange } from "../features/links/api/types";
import { useCopyWithToast } from "../features/links/hooks/useCopyWithToast";
import { Skeleton } from "../components/ui/skeleton";

import {
  getGraphQLErrorCode,
  isGraphQLRequestError,
} from "../features/links/hooks/errors";

import { LinkStatsHeader } from "../features/links/components/stats/LinkStatsHeader";
import { LinkDetailsSection } from "../features/links/components/stats/LinkDetailsSection";
import { MetricsSummarySection } from "../features/links/components/stats/MetricsSummarySection";
import { ClicksSection } from "../features/links/components/stats/ClicksSection";

type LinkStatsEntity = LinkStatsResponse["linkStats"];

function shouldRedirectToLinks(error: unknown): boolean {
  if (!isGraphQLRequestError(error)) return false;

  return error.errors.some((errorItem) => {
    const code = getGraphQLErrorCode(errorItem);
    return code === "BAD_USER_INPUT" || code === "NOT_FOUND";
  });
}

function toStatsView(linkStats: LinkStatsEntity | undefined) {
  return {
    linkDetails: linkStats?.link ?? null,
    series: linkStats?.series ?? [],
    granularity: linkStats?.granularity ?? "DAY",
    totalClicks: linkStats?.totalClicks,
    lastClickedAt: linkStats?.lastClickedAt,
    rangeClicks: linkStats?.rangeClicks,
    previousRangeClicks: linkStats?.previousRangeClicks,
  } as const;
}

function StatsSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading statistics"
      className="space-y-5"
    >
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  );
}

export function LinkStatsPage() {
  const params = useParams<{ id: string }>();
  const linkId = params.id ?? "";

  const [range, setRange] = React.useState<StatsRange>("DAYS_7");
  const copyWithToast = useCopyWithToast();

  const linkStatsQuery = useLinkStats(linkId, range);

  if (linkStatsQuery.isLoading) return <StatsSkeleton />;

  if (shouldRedirectToLinks(linkStatsQuery.error)) {
    return <Navigate to="/links" replace />;
  }

  const view = toStatsView(linkStatsQuery.data?.linkStats);

  async function handleCopyShortLink() {
    const shortLink = view.linkDetails?.shortLink;
    if (!shortLink) return;
    await copyWithToast(shortLink);
  }

  return (
    <section className="space-y-5">
      <LinkStatsHeader range={range} onRangeChange={setRange} />
      <LinkDetailsSection
        linkDetails={view.linkDetails}
        queryError={linkStatsQuery.error}
        onCopy={handleCopyShortLink}
      />
      <MetricsSummarySection
        totalClicks={view.totalClicks}
        lastClickedAt={view.lastClickedAt}
        rangeClicks={view.rangeClicks}
        previousRangeClicks={view.previousRangeClicks}
        range={range}
        isLoading={linkStatsQuery.isLoading}
      />
      <ClicksSection
        queryError={linkStatsQuery.error}
        isFetching={linkStatsQuery.isFetching}
        rangeClicks={view.rangeClicks}
        series={view.series}
        granularity={view.granularity}
        onRefresh={() => linkStatsQuery.refetch()}
      />
    </section>
  );
}
