import { Router } from "express";
import { resolveShortUrl } from "../../modules/shortUrls/shortUrls.service";

export const redirectRouter = Router();

redirectRouter.get("/:code", async (req, res) => {
  const secPurpose = String(req.headers["sec-purpose"] ?? "").toLowerCase();
  const purpose = String(req.headers["purpose"] ?? "").toLowerCase();

  const isSpeculative =
    purpose.includes("prefetch") ||
    secPurpose.includes("prefetch") ||
    secPurpose.includes("prerender");

  const result = await resolveShortUrl(req.params.code, {
    track: !isSpeculative,
  });

  if (result.ok) return res.redirect(302, result.targetUrl);
  if (result.reason === "DELETED") return res.status(410).send("Gone");
  return res.status(404).send("Not found");
});
