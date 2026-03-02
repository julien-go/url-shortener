import * as React from "react";
import { useCreateShortUrl } from "../hooks/useCreateShortUrl";
import { getCreateShortUrlErrorMessage } from "../hooks/errors";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Separator } from "../../../components/ui/separator";

export function CreateShortUrlForm() {
  const [originalUrl, setOriginalUrl] = React.useState("");
  const [code, setCode] = React.useState("");
  const [copyMessage, setCopyMessage] = React.useState<string | null>(null);

  const createShortUrlMutation = useCreateShortUrl();

  const errorMessage = createShortUrlMutation.error
    ? getCreateShortUrlErrorMessage(createShortUrlMutation.error)
    : null;

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    createShortUrlMutation.mutate({
      originalUrl,
      code: code.trim() || undefined,
    });
  }

  const created = createShortUrlMutation.data?.createShortUrl;

  const copyCreatedLink = async () => {
    if (!created?.shortLink) return;
    try {
      await navigator.clipboard.writeText(created.shortLink);
      setCopyMessage("Copied to clipboard.");
    } catch {
      setCopyMessage("Copy failed. Please copy manually.");
    }
    window.setTimeout(() => setCopyMessage(null), 2000);
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-[2.25rem]">
          Create a short link
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Paste a URL and optionally choose a custom slug.
        </p>
      </div>
      <Separator className="my-8 bg-border/80" />

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="flex flex-col space-y-2.5 gap-y-1.5 mb-8">
          <Label htmlFor="originalUrl">Original URL</Label>
          <Input
            id="originalUrl"
            type="url"
            required
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="flex flex-col space-y-2.5 gap-y-1.5">
          <Label htmlFor="code">Custom slug (optional)</Label>
          <Input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="promo-2026"
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
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}
      </form>

      {created ? (
        <div className="border-t border-border/80 pt-4 sm:pt-5">
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">
              Short link
            </div>

            <a
              href={created.shortLink}
              target="_blank"
              rel="noreferrer"
              className="focus-premium block truncate rounded-md text-sm font-medium underline decoration-primary/60 underline-offset-4 transition hover:text-primary"
              title={created.shortLink}
            >
              {created.shortLink}
            </a>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={copyCreatedLink}>
                Copy
              </Button>
              <Button asChild variant="secondary">
                <a href={created.shortLink} target="_blank" rel="noreferrer">
                  Open
                </a>
              </Button>
            </div>
            {copyMessage ? (
              <p className="border-l-2 border-primary/30 pl-3 text-sm text-muted-foreground/90">
                {copyMessage}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
