import { Button } from "../../../../components/ui/button";
import { ErrorBanner } from "../../../../components/ui/error-banner";
import { getGraphQLRequestErrorMessage } from "../../hooks/errors";
import type { LinkDetails } from "./types";

export function LinkDetailsSection({
  linkDetails,
  queryError,
  onCopy,
}: {
  linkDetails: LinkDetails | null;
  queryError: unknown;
  onCopy: () => Promise<void>;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-6 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        {queryError ? (
          <ErrorBanner className="flex-1">
            {getGraphQLRequestErrorMessage(
              queryError,
              "Unable to load link details.",
            )}
          </ErrorBanner>
        ) : linkDetails ? (
          <div className="grid gap-4 text-sm sm:grid-cols-2 sm:gap-16">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Short link
                </div>
                <div className="font-mono break-all">
                  {linkDetails.shortLink}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Slug
                </div>
                <div className="font-mono">{linkDetails.code}</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Target URL
              </div>
              <div className="break-all">{linkDetails.originalUrl}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Link not found.</div>
        )}

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="bg-card hover:bg-accent"
            onClick={onCopy}
            disabled={!linkDetails?.shortLink}
          >
            Copy
          </Button>

          <Button asChild size="sm" disabled={!linkDetails?.shortLink}>
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
    </section>
  );
}
