import * as React from "react";
import { Copy, Trash2 } from "lucide-react";
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

import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";

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
          <div className="rounded-lg border border-border/80 bg-muted/35 p-5 text-sm text-muted-foreground">
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
          <div className="rounded-lg border border-border/80 bg-muted/35 p-6 text-sm text-muted-foreground">
            {rawLinks.length === 0
              ? "No links yet."
              : "No result for the current search."}
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {links.map((link) => {
                const isConfirmingDelete = pendingDeleteId === link.id;
                const isDeletingThisRow =
                  deleteLinkMutation.isPending && deletingId === link.id;

                return (
                  <article
                    key={link.id}
                    className="space-y-3 rounded-lg border border-border/80 bg-background/45 p-4"
                  >
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        Short link
                      </p>
                      <a
                        href={link.shortLink}
                        target="_blank"
                        rel="noreferrer"
                        className="focus-premium block break-all rounded-md text-sm font-medium underline decoration-primary/60 underline-offset-4 transition hover:text-primary"
                      >
                        {link.shortLink}
                      </a>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        Target URL
                      </p>
                      <a
                        href={link.originalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block break-all text-sm text-muted-foreground hover:text-foreground hover:underline"
                      >
                        {link.originalUrl}
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Clicks</p>
                        <p className="font-semibold tabular-nums">
                          {link.clickCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="font-medium text-foreground/90">
                          {formatDateLabel(link.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/links/${link.id}/stats`)}
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
                        className="col-span-2 text-destructive/85 hover:text-destructive"
                        onClick={() => startDeleteConfirmation(link.id)}
                        disabled={isDeletingThisRow}
                      >
                        Delete
                      </Button>
                    </div>

                    {isConfirmingDelete ? (
                      <div className="space-y-2 rounded-md border border-destructive/25 bg-destructive/8 p-2.5 text-xs">
                        <span className="text-destructive/90">
                          Delete this link?
                        </span>
                        <div className="flex gap-2">
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
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>

            <div className="hidden overflow-hidden rounded-lg bg-background/35 md:block">
              <Table className="border-y border-border/65">
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
                  {links.map((link, index) => {
                    const isConfirmingDelete = pendingDeleteId === link.id;
                    const isDeletingThisRow =
                      deleteLinkMutation.isPending && deletingId === link.id;

                    return (
                      <TableRow
                        key={link.id}
                        className={
                          index % 2 === 0
                            ? "bg-background/10 hover:bg-muted/35"
                            : "bg-primary/4 hover:bg-primary/[0.14]"
                        }
                      >
                        <TableCell className="px-4 py-3.5 align-top">
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
                        <TableCell className="px-4 py-3.5 align-top">
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

                        <TableCell className="px-4 py-3.5 text-right tabular-nums align-top">
                          {link.clickCount}
                        </TableCell>

                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground align-top">
                          {formatDateLabel(link.createdAt)}
                        </TableCell>

                        <TableCell className="px-4 py-3.5 align-top">
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
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => copyToClipboard(link.shortLink)}
                              aria-label="Copy short link"
                            >
                              <Copy className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="px-2.5 text-destructive/85 hover:text-destructive"
                              onClick={() => startDeleteConfirmation(link.id)}
                              disabled={isDeletingThisRow}
                              aria-label="Delete link"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>

                          {isConfirmingDelete ? (
                            <div className="mt-2 flex justify-end">
                              <div className="ml-auto flex max-w-full flex-wrap items-center justify-center gap-2 rounded-md border border-destructive/25 bg-destructive/8 px-2.5 py-2 text-xs">
                                <span className="text-destructive/90">
                                  Delete this link?
                                </span>
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
                            </div>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
        {copyMessage ? (
          <div className="border-l-2 border-primary/30 pl-3 text-sm text-muted-foreground/90">
            {copyMessage}
          </div>
        ) : null}

        {(canGoPrevious || canGoNext) && (
          <div className="mt-2 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
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
      </div>
    </section>
  );
}
