import * as React from "react";
import { useParams, Navigate } from "react-router-dom";
import { useLinkStats } from "../features/links/hooks/useLinkStats";
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

  const [range, setRange] = React.useState<"DAYS_7" | "DAYS_30">("DAYS_7");
  const copyWithToast = useCopyWithToast();

  const linkStatsQuery = useLinkStats(linkId, range);

  if (linkStatsQuery.isLoading) {
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

  if (shouldRedirectToLinks(linkStatsQuery.error)) {
    return <Navigate to="/links" replace />;
  }

  const linkStats = linkStatsQuery.data?.linkStats;
  const linkDetails = linkStats?.link ?? null;
  const series = linkStats?.series ?? [];

  async function handleCopyShortLink() {
    const shortLink = linkDetails?.shortLink;
    if (!shortLink) return;
    await copyWithToast(shortLink);
  }

  return (
    <section className="space-y-5">
      {" "}
      <LinkStatsHeader range={range} onRangeChange={setRange} />
      <LinkDetailsSection
        linkDetails={linkDetails}
        queryError={linkStatsQuery.error}
        onCopy={handleCopyShortLink}
      />
      <MetricsSummarySection
        totalClicks={linkStats?.totalClicks}
        lastClickedAt={linkStats?.lastClickedAt}
        isLoading={linkStatsQuery.isLoading}
      />
      <ClicksSection
        queryError={linkStatsQuery.error}
        isFetching={linkStatsQuery.isFetching}
        totalClicks={linkStats?.totalClicks}
        series={series}
        onRefresh={() => linkStatsQuery.refetch()}
      />
    </section>
  );
}
