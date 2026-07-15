import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { ErrorBanner } from "../../../components/ui/error-banner";
import { LinkCard } from "./LinkCard";
import { LinkRow } from "./LinkRow";
import type { MyLink } from "../api/types";
import type { LinkItemProps } from "./linkList";

const SKELETON_ROW_COUNT = 4;

export function MyLinksListSection({
  isLoading,
  isError,
  errorMessage,
  onRetry,
  links,
  rowProps,
}: {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  links: MyLink[];
  rowProps: (linkId: string) => Omit<LinkItemProps, "link">;
}) {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading your links"
        className="space-y-2"
      >
        {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorBanner>
        <p>{errorMessage}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </ErrorBanner>
    );
  }

  if (links.length === 0) {
    return (
      <div className="rounded-lg border border-border/80 bg-muted/35 p-6 text-sm text-muted-foreground">
        No links yet.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 lg:hidden">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} {...rowProps(link.id)} />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border bg-card lg:block">
        <Table>
          <TableCaption className="sr-only">
            List of your short links with their target URLs, click counts,
            creation dates, and row actions.
          </TableCaption>
          <TableHeader>
            <TableRow className="border-b border-border bg-primary/7 hover:bg-primary/7">
              <TableHead className="w-[320px] px-4 py-3 text-xs font-bold uppercase tracking-wide text-primary">
                Short link
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-primary">
                Original URL
              </TableHead>
              <TableHead className="w-27.5 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-primary">
                Clicks
              </TableHead>
              <TableHead className="w-35 px-4 py-3 text-xs font-bold uppercase tracking-wide text-primary">
                Created
              </TableHead>
              <TableHead className="w-55 px-4 py-3 text-xs font-bold uppercase tracking-wide text-primary">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {links.map((link) => (
              <LinkRow key={link.id} link={link} {...rowProps(link.id)} />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
