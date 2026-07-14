import * as React from "react";
import { useNavigate } from "react-router-dom";
import { getGraphQLRequestErrorMessage } from "../features/links/hooks/errors";
import { useMyLinks } from "../features/links/hooks/useMyLinks";
import { useDeleteLink } from "../features/links/hooks/useDeleteLink";
import { useCursorPagination } from "../features/links/hooks/useCursorPagination";
import { useCopyToClipboard } from "../lib/hooks/useCopyToClipboard";

import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { MyLinksPagination } from "../features/links/components/MyLinksPagination";
import { LinkCard } from "../features/links/components/LinkCard";
import { LinkRow } from "../features/links/components/LinkRow";

const PAGE_SIZE = 10;

export function MyLinksPage() {
  const navigate = useNavigate();
  const pagination = useCursorPagination();
  const { status: copyStatus, copy } = useCopyToClipboard();

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
    onCopy: (shortLink: string) => void copy(shortLink),
    onStartDelete: (id: string) => setPendingDeleteId(id),
    onCancelDelete: () => setPendingDeleteId(null),
    onConfirmDelete: confirmDeleteLink,
  });

  return (
    <section className="space-y-7">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-[2.15rem]">
              My links
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Manage your short URLs from a single dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Badge
              variant="secondary"
              className="border-border/70 bg-background/65 px-3 py-1 text-xs font-medium"
            >
              Total links: {totalCount}
            </Badge>

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
        <div className="h-px bg-border/55" />
        {myLinksQuery.isLoading ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg border border-border/80 bg-muted/35 p-5 text-sm text-muted-foreground"
          >
            Loading your links…
          </div>
        ) : myLinksQuery.isError ? (
          <div
            role="alert"
            className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
          >
            <p>{errorMessage}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => myLinksQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : links.length === 0 ? (
          <div className="rounded-lg border border-border/80 bg-muted/35 p-6 text-sm text-muted-foreground">
            No links yet.
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {links.map((link) => (
                <LinkCard key={link.id} link={link} {...rowProps(link.id)} />
              ))}
            </div>

            <div className="hidden overflow-hidden rounded-lg bg-background/35 md:block">
              <Table className="border-y border-border/65">
                <TableCaption className="sr-only">
                  List of your short links with their target URLs, click counts,
                  creation dates, and row actions.
                </TableCaption>
                <TableHeader>
                  <TableRow className="border-b border-border/70 bg-primary/10">
                    <TableHead className="w-[320px] px-4 py-3 text-foreground">
                      Short link
                    </TableHead>
                    <TableHead className="px-4 py-3 text-foreground">
                      Original URL
                    </TableHead>
                    <TableHead className="w-27.5 px-4 py-3 text-right text-foreground">
                      Clicks
                    </TableHead>
                    <TableHead className="w-35 px-4 py-3 text-foreground">
                      Created
                    </TableHead>
                    <TableHead className="w-55 px-4 py-3  text-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {links.map((link, index) => (
                    <LinkRow
                      key={link.id}
                      link={link}
                      index={index}
                      {...rowProps(link.id)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
        {copyStatus !== "idle" ? (
          <div
            role="status"
            aria-live="polite"
            className="border-l-2 border-primary/30 pl-3 text-sm text-muted-foreground/90"
          >
            {copyStatus === "copied"
              ? "Copied to clipboard."
              : "Copy failed. Please copy manually."}
          </div>
        ) : null}

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
