import { useState } from "react";
import { useCreateShortUrl } from "../hooks/useCreateShortUrl";
import { getCreateShortUrlErrorMessage } from "../hooks/errors";

export function CreateShortUrlForm() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [code, setCode] = useState("");

  const mutation = useCreateShortUrl();

  const errorMessage = mutation.error
    ? getCreateShortUrlErrorMessage(mutation.error)
    : null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    mutation.mutate({
      originalUrl,
      code: code.trim() || undefined,
    });
  }

  const created = mutation.data?.createShortUrl;

  return (
    <section style={{ maxWidth: 520 }}>
      <h1>Create a short link</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          <div>Original URL</div>
          <input
            type="url"
            required
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </label>

        <label>
          <div>Custom slug (optional)</div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="promo-2026"
          />
        </label>

        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating…" : "Create link"}
        </button>

        {errorMessage && <div role="alert">{errorMessage}</div>}
      </form>

      {created && (
        <div style={{ marginTop: 16 }}>
          <div>
            <strong>Short link</strong>
          </div>
          <div>{created.shortLink}</div>

          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(created.shortLink)}
          >
            Copy
          </button>
        </div>
      )}
    </section>
  );
}
