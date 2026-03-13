export function renderStatusPage({
  title,
  heading,
  message,
  actionHref,
  actionLabel,
  brandName,
}: {
  title: string;
  heading: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
  brandName?: string;
}) {
  const action =
    actionHref && actionLabel
      ? `<a href="${actionHref}">${actionLabel}</a>`
      : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body {
        margin: 0;
        padding: 24px;
        font-family: Inter, system-ui, sans-serif;
        background: #f7f7fb;
        color: #18181b;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
      }

      .card {
        max-width: 520px;
        width: 100%;
        background: white;
        border: 1px solid #e4e4e7;
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
      }

      .brand {
        font-size: 14px;
        font-weight: 700;
        color: #7c3aed;
        margin-bottom: 12px;
      }

      h1 {
        margin: 0 0 12px;
        font-size: 32px;
        line-height: 1.1;
      }

      p {
        margin: 0;
        color: #52525b;
        line-height: 1.6;
      }

      a {
        display: inline-block;
        margin-top: 20px;
        color: #7c3aed;
        text-decoration: none;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <main class="card">
       <div class="brand">${brandName}</div>
      <h1>${heading}</h1>
      <p>${message}</p>
      ${action}
    </main>
  </body>
</html>`;
}
