import { Router } from "express";
import { resolveShortUrl } from "../../modules/shortUrls/shortUrls.service";
import { SLUG_MAX_LENGTH } from "../../modules/shortUrls/shortUrls.constants";
import { redirectRateLimit } from "../../security/rateLimit.middleware";
import { renderStatusPage } from "../statusPage";
import { env } from "../../config/env";

export const redirectRouter = Router();

function renderNotFound(res: import("express").Response) {
  return res
    .status(404)
    .type("html")
    .send(
      renderStatusPage({
        title: `Link not found • ${env.APP_NAME}`,
        heading: "This short link does not exist.",
        message: "Check the URL and try again.",
        actionHref: env.APP_DASHBOARD_URL,
        actionLabel: "Open dashboard",
        brandName: env.APP_NAME,
      }),
    );
}

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

  if (!code || code.length > SLUG_MAX_LENGTH) {
    return renderNotFound(res);
  }

  const result = await resolveShortUrl(code, {
    track: !isSpeculative,
  });

  if (result.ok) return res.redirect(302, result.targetUrl);

  if (result.reason === "DELETED") {
    return res
      .status(410)
      .type("html")
      .send(
        renderStatusPage({
          title: `Link gone • ${env.APP_NAME}`,
          heading: "This link is no longer available.",
          message: "The short link existed before, but it has been deleted.",
          actionHref: env.APP_DASHBOARD_URL,
          actionLabel: "Open dashboard",
          brandName: env.APP_NAME,
        }),
      );
  }

  return renderNotFound(res);
});
