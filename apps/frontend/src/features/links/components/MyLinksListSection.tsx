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
      <div
        role="alert"
        className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
      >
        <p>{errorMessage}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
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
  );
}
