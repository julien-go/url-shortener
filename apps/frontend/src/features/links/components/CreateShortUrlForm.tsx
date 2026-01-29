import * as React from "react";
import { useCreateShortUrl } from "../hooks/useCreateShortUrl";
import { getCreateShortUrlErrorMessage } from "../hooks/errors";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card } from "../../../components/ui/card";

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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Create a short link</h2>
        <p className="text-sm text-muted-foreground">
          Paste a URL and optionally choose a custom slug.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
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

        <div className="space-y-2">
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
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}
      </form>

      {created ? (
        <Card className="rounded-xl p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Short link</div>

            <a
              href={created.shortLink}
              target="_blank"
              rel="noreferrer"
              className="block truncate font-mono text-sm underline underline-offset-4"
              title={created.shortLink}
            >
              {created.shortLink}
            </a>

            <div className="flex gap-2">
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
              <p className="text-sm text-muted-foreground">{copyMessage}</p>
            ) : null}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
