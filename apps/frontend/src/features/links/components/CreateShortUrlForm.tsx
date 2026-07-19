import * as React from "react";
import { useCreateShortUrl } from "../hooks/useCreateShortUrl";
import { getCreateShortUrlErrorMessage } from "../hooks/errors";
import { useToast } from "../../../app/providers/useToast";
import { useCopyWithToast } from "../hooks/useCopyWithToast";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Separator } from "../../../components/ui/separator";
import { ErrorBanner } from "../../../components/ui/error-banner";

export function CreateShortUrlForm() {
  const [originalUrl, setOriginalUrl] = React.useState("");
  const [code, setCode] = React.useState("");
  const { toast } = useToast();
  const copyWithToast = useCopyWithToast();

  const createShortUrlMutation = useCreateShortUrl();

  const errorMessage = createShortUrlMutation.error
    ? getCreateShortUrlErrorMessage(createShortUrlMutation.error)
    : null;

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    createShortUrlMutation.mutate(
      {
        originalUrl,
        code: code.trim() || undefined,
      },
      {
        onSuccess: () => {
          setOriginalUrl("");
          setCode("");
          toast({ message: "Short link created.", variant: "success" });
        },
      },
    );
  }

  const created = createShortUrlMutation.data?.createShortUrl;

  const copyCreatedLink = () => {
    if (!created?.shortLink) return;
    void copyWithToast(created.shortLink);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-3xl md:text-[2.25rem]">
          Create a short link
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Paste a URL and optionally choose a custom slug.
        </p>
      </div>
      <Separator className="my-6 bg-border/80 sm:my-8" />

      <form
        onSubmit={onSubmit}
        className="space-y-4.5 sm:space-y-5"
        aria-busy={createShortUrlMutation.isPending}
      >
        <div className="mb-5 flex flex-col gap-y-1.5 space-y-2 sm:mb-6">
          <Label htmlFor="originalUrl">Original URL</Label>
          <Input
            id="originalUrl"
            type="url"
            required
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://example.com"
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={
              errorMessage ? "create-short-link-error" : undefined
            }
          />
        </div>

        <div className="flex flex-col gap-y-1.5 space-y-2">
          <Label htmlFor="code">Custom slug (optional)</Label>
          <Input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="promo-2026"
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={
              errorMessage ? "create-short-link-error" : undefined
            }
          />
        </div>

        <Button
          className="w-full"
          type="submit"
          disabled={createShortUrlMutation.isPending}
        >
          {createShortUrlMutation.isPending ? "Creating…" : "Create link"}
        </Button>

        {errorMessage ? (
          <ErrorBanner id="create-short-link-error">
            {errorMessage}
          </ErrorBanner>
        ) : null}
      </form>

      {created ? (
        <div className="border-t border-border/80 pt-4 sm:pt-5">
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Short link
            </div>

            <a
              href={created.shortLink}
              target="_blank"
              rel="noreferrer"
              aria-label={`${created.shortLink}`}
              className="focus-premium block break-all rounded-md text-sm font-medium underline decoration-primary/60 underline-offset-4 transition hover:text-primary sm:truncate sm:break-normal"
              title={created.shortLink}
            >
              {created.shortLink}
            </a>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={copyCreatedLink}>
                Copy
              </Button>
              <Button asChild>
                <a href={created.shortLink} target="_blank" rel="noreferrer">
                  Open
                </a>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
