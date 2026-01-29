import * as React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../app/providers/useAuth";
import { isGraphQLRequestError } from "../features/links/hooks/errors";
import { DashboardLayout } from "../app/layouts/DashboardLayout";
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

const PAGE_SIZE = 10;

export function MyLinksPage() {
  const { token } = useAuth();
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([
    null,
  ]);

  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [copyMessage, setCopyMessage] = React.useState<string | null>(null);
  const currentCursor = cursorStack[cursorStack.length - 1];

  const myLinksQuery = useMyLinks(PAGE_SIZE, currentCursor, !!token);
  const deleteLinkMutation = useDeleteLink();

  const myLinksPage = myLinksQuery.data?.myLinks;
  const links = myLinksPage?.items ?? [];

  const canGoPrevious = cursorStack.length > 1;
  const canGoNext = Boolean(myLinksPage?.nextCursor);

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

  const confirmAndDeleteLink = (linkId: string) => {
    const confirmed = window.confirm("Delete this link?");
    if (!confirmed) return;
    setDeletingId(linkId);
    deleteLinkMutation.mutate(linkId, {
      onSettled: () => setDeletingId(null),
    });
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const errorMessage = myLinksQuery.error
    ? isGraphQLRequestError(myLinksQuery.error)
      ? (myLinksQuery.error.errors?.[0]?.message ?? "Failed to load links.")
      : "Failed to load links."
    : null;

  return (
    <DashboardLayout maxWidth="xl">
      <Card className="rounded-2xl bg-background">
        <CardHeader className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl">My links</CardTitle>
            <p className="text-sm text-muted-foreground">
              {myLinksQuery.isLoading
                ? "…"
                : `${myLinksPage?.totalCount ?? 0} link(s)`}
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={() => myLinksQuery.refetch()}
            disabled={myLinksQuery.isFetching}
          >
            Refresh
          </Button>
        </CardHeader>

        <CardContent>
          {myLinksQuery.isLoading ? (
            <div className="rounded-lg border bg-card p-4 text-sm text-foreground">
              Loading…
            </div>
          ) : myLinksQuery.isError ? (
            <div className="rounded-lg border bg-card p-4 text-sm text-foreground">
              {errorMessage}
            </div>
          ) : links.length === 0 ? (
            <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
              No links yet.
            </div>
          ) : (
            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-[360px]">Short</TableHead>
                    <TableHead>Original URL</TableHead>
                    <TableHead className="w-[110px] text-right">
                      Clicks
                    </TableHead>
                    <TableHead className="w-[140px]">Created</TableHead>
                    <TableHead className="w-[190px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {links.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="align-top">
                        <a
                          href={link.shortLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex max-w-[340px] truncate rounded-md border bg-muted/40 px-2 py-1 font-mono text-sm text-foreground hover:bg-muted"
                          title={link.shortLink}
                        >
                          {link.shortLink}
                        </a>

                        <div className="mt-2 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(link.shortLink)}
                          >
                            Copy
                          </Button>
                          <Button asChild variant="secondary" size="sm">
                            <a
                              href={link.shortLink}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open
                            </a>
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell className="align-top">
                        <a
                          href={link.originalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block max-w-[520px] truncate text-sm text-muted-foreground hover:text-foreground hover:underline"
                          title={link.originalUrl}
                        >
                          {link.originalUrl}
                        </a>
                      </TableCell>

                      <TableCell className="text-right tabular-nums align-top">
                        {link.clickCount}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground align-top">
                        {new Date(link.createdAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell className="text-right align-top">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => confirmAndDeleteLink(link.id)}
                          disabled={
                            deleteLinkMutation.isPending &&
                            deletingId === link.id
                          }
                        >
                          {deleteLinkMutation.isPending &&
                          deletingId === link.id
                            ? "Deleting…"
                            : "Delete"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {copyMessage ? (
            <div className="mt-3 text-sm text-muted-foreground">
              {copyMessage}
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousPage}
              disabled={!canGoPrevious || myLinksQuery.isFetching}
            >
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              {myLinksQuery.isFetching ? "Loading…" : ""}
            </div>

            <Button
              variant="outline"
              onClick={goToNextPage}
              disabled={!canGoNext || myLinksQuery.isFetching}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
