import { Router } from "express";
import { resolveShortUrl } from "../../modules/shortUrls/shortUrls.service";
import { redirectRateLimit } from "../../security/rateLimit.middleware";
import { renderStatusPage } from "../statusPage";

export const redirectRouter = Router();

redirectRouter.get("/:code", redirectRateLimit, async (req, res) => {
  const secPurpose = String(req.headers["sec-purpose"] ?? "").toLowerCase();
  const purpose = String(req.headers["purpose"] ?? "").toLowerCase();

  const isSpeculative =
    purpose.includes("prefetch") ||
    secPurpose.includes("prefetch") ||
    secPurpose.includes("prerender");

  const code = Array.isArray(req.params.code)
    ? req.params.code[0]
    : req.params.code;

  const result = await resolveShortUrl(code ?? "", {
    track: !isSpeculative,
  });

  if (result.ok) return res.redirect(302, result.targetUrl);

  if (result.reason === "DELETED") {
    return res
      .status(410)
      .type("html")
      .send(
        renderStatusPage({
          title: "Link gone • Fliro",
          heading: "This link is no longer available.",
          message: "The short link existed before, but it has been deleted.",
          actionHref: "https://app.fliro.cc",
          actionLabel: "Open dashboard",
        }),
      );
  }

  return res
    .status(404)
    .type("html")
    .send(
      renderStatusPage({
        title: "Link not found • Fliro",
        heading: "This short link does not exist.",
        message: "Check the URL and try again.",
        actionHref: "https://app.fliro.cc",
        actionLabel: "Open dashboard",
      }),
    );
});
