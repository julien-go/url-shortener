import { getDayUtc } from "../../utils/dayUtc";
import { findByCode, trackClick } from "./shortUrls.repo";
import { ResolveShortUrlResult } from "./shortUrls.types";

export async function resolveShortUrl(
  code: string,
  opts?: { track?: boolean },
): Promise<ResolveShortUrlResult> {
  const link = await findByCode(code);

  if (!link) return { ok: false, reason: "NOT_FOUND" };
  if (link.deleted_at) return { ok: false, reason: "DELETED" };
  if (!link.is_active) return { ok: false, reason: "INACTIVE" };

  if (opts?.track !== false) {
    const dayUtc = getDayUtc();
    void trackClick(link.id, dayUtc).catch(console.error);
  }

  return { ok: true, targetUrl: link.target_url };
}
