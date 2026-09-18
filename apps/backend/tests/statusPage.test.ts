import { describe, expect, it } from "vitest";
import { renderStatusPage } from "../src/http/statusPage";

const base = {
  title: "Too many requests",
  heading: "Too many requests",
  message: "limit reached",
};

describe("renderStatusPage", () => {
  it("escapes a quote in actionHref so the attribute cannot be broken out", () => {
    const html = renderStatusPage({
      ...base,
      actionHref: '/abc" onmouseover="alert(1)',
      actionLabel: "Try again",
    });

    expect(html).not.toContain('onmouseover="alert(1)"');
    expect(html).toContain(
      '<a href="/abc&quot; onmouseover=&quot;alert(1)">Try again</a>',
    );
  });

  it("escapes markup in every interpolated field", () => {
    const html = renderStatusPage({
      title: "<script>t</script>",
      heading: "<img src=x>",
      message: "a & b",
      actionHref: "/x",
      actionLabel: "<b>go</b>",
      brandName: "<i>Fliro</i>",
    });

    expect(html).not.toContain("<script>t</script>");
    expect(html).not.toContain("<img src=x>");
    expect(html).toContain("&lt;img src=x&gt;");
    expect(html).toContain("a &amp; b");
    expect(html).toContain("&lt;b&gt;go&lt;/b&gt;");
    expect(html).toContain("&lt;i&gt;Fliro&lt;/i&gt;");
  });

  it("omits the brand block instead of printing undefined", () => {
    const html = renderStatusPage({ ...base });

    expect(html).not.toContain("undefined");
    expect(html).not.toContain('class="brand"');
  });

  it("renders the brand when one is provided", () => {
    const html = renderStatusPage({ ...base, brandName: "Fliro" });

    expect(html).toContain('<div class="brand">Fliro</div>');
  });

  it("omits the action link when href or label is missing", () => {
    expect(renderStatusPage({ ...base, actionHref: "/x" })).not.toContain("<a ");
    expect(renderStatusPage({ ...base, actionLabel: "Go" })).not.toContain(
      "<a ",
    );
  });
});
