import * as React from "react";
import { useNavigate } from "react-router-dom";
import { getGraphQLRequestErrorMessage } from "../features/links/hooks/errors";
import { useMyLinks } from "../features/links/hooks/useMyLinks";
import { useDeleteLink } from "../features/links/hooks/useDeleteLink";
import { useCursorPagination } from "../features/links/hooks/useCursorPagination";
import { useToast } from "../app/providers/useToast";
import { useCopyWithToast } from "../features/links/hooks/useCopyWithToast";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { MyLinksPagination } from "../features/links/components/MyLinksPagination";
import { MyLinksListSection } from "../features/links/components/MyLinksListSection";

const PAGE_SIZE = 10;

export function MyLinksPage() {
  const navigate = useNavigate();
  const pagination = useCursorPagination();
  const { toast } = useToast();
  const copyWithToast = useCopyWithToast();

  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(
    null,
  );

  const myLinksQuery = useMyLinks(PAGE_SIZE, pagination.currentCursor, true);
  const deleteLinkMutation = useDeleteLink();

  const myLinksPage = myLinksQuery.data?.myLinks;
  const links = myLinksPage?.items ?? [];

  const canGoNext = Boolean(myLinksPage?.nextCursor);
  const totalCount = myLinksPage?.totalCount ?? 0;
  const rangeStart =
    totalCount === 0 ? 0 : (pagination.page - 1) * PAGE_SIZE + 1;
  const rangeEnd =
    totalCount === 0
      ? 0
      : Math.min((pagination.page - 1) * PAGE_SIZE + links.length, totalCount);

  const confirmDeleteLink = (linkId: string) => {
    setDeletingId(linkId);
    deleteLinkMutation.mutate(linkId, {
      onSuccess: () => {
        pagination.reset();
        setPendingDeleteId(null);
        toast({ message: "Link deleted.", variant: "success" });
      },
      onSettled: () => setDeletingId(null),
    });
  };

  const errorMessage = myLinksQuery.error
    ? getGraphQLRequestErrorMessage(myLinksQuery.error, "Failed to load links.")
    : null;

  const rowProps = (linkId: string) => ({
    isConfirmingDelete: pendingDeleteId === linkId,
    isDeleting: deleteLinkMutation.isPending && deletingId === linkId,
    onStats: (id: string) => navigate(`/links/${id}/stats`),
    onCopy: (shortLink: string) => void copyWithToast(shortLink),
    onStartDelete: (id: string) => setPendingDeleteId(id),
    onCancelDelete: () => setPendingDeleteId(null),
    onConfirmDelete: confirmDeleteLink,
  });

  return (
    <section className="space-y-7">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-[2.15rem]">
              My links
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Manage your short URLs from a single dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="secondary">Total links: {totalCount}</Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => myLinksQuery.refetch()}
              disabled={myLinksQuery.isFetching}
            >
              Refresh
            </Button>
          </div>
        </div>
        <Separator className="bg-border/80" />
      </div>

      <div className="space-y-4 px-1 sm:px-0">
        <MyLinksListSection
          isLoading={myLinksQuery.isLoading}
          isError={myLinksQuery.isError}
          errorMessage={errorMessage}
          onRetry={() => myLinksQuery.refetch()}
          links={links}
          rowProps={rowProps}
        />

        <MyLinksPagination
          canGoPrevious={pagination.canGoPrevious}
          canGoNext={canGoNext}
          isFetching={myLinksQuery.isFetching}
          rangeLabel={`${rangeStart}–${rangeEnd} / ${totalCount}`}
          onPrevious={pagination.goToPrevious}
          onNext={() => pagination.goToNext(myLinksPage?.nextCursor)}
        />
      </div>
    </section>
  );
}
