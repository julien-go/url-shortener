import * as React from "react";
import { useNavigate } from "react-router-dom";
import { getGraphQLRequestErrorMessage } from "../features/links/hooks/errors";
import { useMyLinks } from "../features/links/hooks/useMyLinks";
import { useDeleteLink } from "../features/links/hooks/useDeleteLink";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Badge } from "../components/ui/badge";

const PAGE_SIZE = 10;

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString();
}

export function MyLinksPage() {
  const navigate = useNavigate();

  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([
    null,
  ]);

  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(
    null,
  );
  const [copyMessage, setCopyMessage] = React.useState<string | null>(null);

  const currentCursor = cursorStack[cursorStack.length - 1];

  const myLinksQuery = useMyLinks(PAGE_SIZE, currentCursor, true);
  const deleteLinkMutation = useDeleteLink();

  const myLinksPage = myLinksQuery.data?.myLinks;
  const rawLinks = React.useMemo(
    () => myLinksPage?.items ?? [],
    [myLinksPage?.items],
  );

  const links = myLinksPage?.items ?? [];

  const canGoPrevious = cursorStack.length > 1;
  const canGoNext = Boolean(myLinksPage?.nextCursor);
  const totalCount = myLinksPage?.totalCount ?? 0;
  const currentPage = cursorStack.length;
  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd =
    totalCount === 0
      ? 0
      : Math.min((currentPage - 1) * PAGE_SIZE + rawLinks.length, totalCount);

  const goToNextPage = () => {
    if (!myLinksPage?.nextCursor) return;
    setCursorStack((previousStack) => [
      ...previousStack,
      myLinksPage.nextCursor,
    ]);
  };

  const goToPreviousPage = () => {
    if (!canGoPrevious) return;
    setCursorStack((previousStack) => previousStack.slice(0, -1));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("Copied to clipboard.");
    } catch {
      setCopyMessage("Copy failed. Please copy manually.");
    }
    window.setTimeout(() => setCopyMessage(null), 2000);
  };

  const startDeleteConfirmation = (linkId: string) => {
    setPendingDeleteId(linkId);
  };

  const cancelDeleteConfirmation = () => {
    setPendingDeleteId(null);
  };

  const confirmDeleteLink = (linkId: string) => {
    setDeletingId(linkId);
    deleteLinkMutation.mutate(linkId, {
      onSuccess: () => {
        setCursorStack([null]);
        setPendingDeleteId(null);
      },
      onSettled: () => setDeletingId(null),
    });
  };

  const errorMessage = myLinksQuery.error
    ? getGraphQLRequestErrorMessage(myLinksQuery.error, "Failed to load links.")
    : null;

  return (
    <section className="space-y-5">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">My links</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your short URLs from a single dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Total links : {totalCount}</Badge>
            <Badge variant="secondary">Page {currentPage}</Badge>
            <Button
              variant="secondary"
              onClick={() => myLinksQuery.refetch()}
              disabled={myLinksQuery.isFetching}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {myLinksQuery.isLoading ? (
            <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
              Loading your links…
            </div>
          ) : myLinksQuery.isError ? (
            <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
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
            <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
              {rawLinks.length === 0
                ? "No links yet."
                : "No result for the current search."}
            </div>
          ) : (
            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-[320px]">Short link</TableHead>
                    <TableHead>Original URL</TableHead>
                    <TableHead className="w-27.5 text-right">Clicks</TableHead>
                    <TableHead className="w-35">Created</TableHead>
                    <TableHead className="w-55 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {links.map((link) => {
                    const isConfirmingDelete = pendingDeleteId === link.id;
                    const isDeletingThisRow =
                      deleteLinkMutation.isPending && deletingId === link.id;

                    return (
                      <TableRow key={link.id}>
                        <TableCell className="align-top">
                          <a
                            href={link.shortLink}
                            target="_blank"
                            rel="noreferrer"
                            className="focus-premium block max-w-75 truncate rounded-md text-sm font-medium underline decoration-primary/60 underline-offset-4 transition hover:text-primary"
                            title={link.shortLink}
                          >
                            {link.shortLink}
                          </a>
                        </TableCell>
                        <TableCell className="align-top">
                          <a
                            href={link.originalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block max-w-125 truncate text-sm text-muted-foreground hover:text-foreground hover:underline"
                            title={link.originalUrl}
                          >
                            {link.originalUrl}
                          </a>
                        </TableCell>

                        <TableCell className="text-right tabular-nums align-top">
                          {link.clickCount}
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground align-top">
                          {formatDateLabel(link.createdAt)}
                        </TableCell>

                        <TableCell className="align-top">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                navigate(`/links/${link.id}/stats`)
                              }
                            >
                              Statistics
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(link.shortLink)}
                            >
                              Copy
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startDeleteConfirmation(link.id)}
                              disabled={isDeletingThisRow}
                            >
                              Delete
                            </Button>
                          </div>

                          {isConfirmingDelete ? (
                            <div className="mt-2 flex items-center justify-end gap-2 text-xs text-muted-foreground">
                              <span>Delete this link?</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelDeleteConfirmation}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => confirmDeleteLink(link.id)}
                                disabled={isDeletingThisRow}
                              >
                                {isDeletingThisRow ? "Deleting…" : "Confirm"}
                              </Button>
                            </div>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          {copyMessage ? (
            <div className="text-sm text-muted-foreground">{copyMessage}</div>
          ) : null}

          {(canGoPrevious || canGoNext) && (
            <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card/60 p-3">
              <div className="text-sm text-muted-foreground">
                {myLinksQuery.isFetching
                  ? "Loading…"
                  : `${rangeStart}–${rangeEnd} / ${totalCount}`}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={goToPreviousPage}
                  disabled={!canGoPrevious || myLinksQuery.isFetching}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={goToNextPage}
                  disabled={!canGoNext || myLinksQuery.isFetching}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
