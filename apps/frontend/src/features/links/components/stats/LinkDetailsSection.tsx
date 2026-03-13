import { Button } from "../../../../components/ui/button";
import { getGraphQLRequestErrorMessage } from "../../hooks/errors";
import type { LinkDetails } from "./types";

export function LinkDetailsSection({
  linkDetails,
  queryError,
  copyStatus,
  onCopy,
}: {
  linkDetails: LinkDetails | null;
  queryError: unknown;
  copyStatus: "idle" | "copied" | "error";
  onCopy: () => Promise<void>;
}) {
  return (
    <section className="space-y-4 border-b border-border/70 pb-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Link</h2>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCopy}
            disabled={!linkDetails?.shortLink}
            aria-describedby="copy-link-status"
          >
            {copyStatus === "copied"
              ? "Copied"
              : copyStatus === "error"
                ? "Copy failed"
                : "Copy"}
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            disabled={!linkDetails?.shortLink}
          >
            <a
              href={linkDetails?.shortLink ?? "#"}
              target="_blank"
              rel="noreferrer"
            >
              Open
            </a>
          </Button>
          <span
            id="copy-link-status"
            role="status"
            aria-live="polite"
            className="sr-only"
          >
            {copyStatus === "copied"
              ? "Short link copied to clipboard."
              : copyStatus === "error"
                ? "Failed to copy short link."
                : ""}
          </span>
        </div>
      </div>

      {queryError ? (
        <div role="alert" className="text-sm text-muted-foreground">
          {getGraphQLRequestErrorMessage(
            queryError,
            "Unable to load link details.",
          )}
        </div>
      ) : linkDetails ? (
        <div className="grid gap-4 text-sm md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-muted-foreground">Short link</div>
              <div className="font-mono break-all">{linkDetails.shortLink}</div>
            </div>

            <div className="space-y-1">
              <div className="text-muted-foreground">Slug</div>
              <div className="font-mono">{linkDetails.code}</div>
            </div>
          </div>

          <div className="space-y-1 md:border-l md:border-border/70 md:pl-5">
            <div className="text-muted-foreground">Target URL</div>
            <div className="break-all">{linkDetails.originalUrl}</div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Link not found.</div>
      )}
    </section>
  );
}
