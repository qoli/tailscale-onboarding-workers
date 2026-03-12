import { DOCUMENT_TEMPLATE } from "./document";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeInviteUrl(value: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function buildMarkdown(inviteUrl: string | null): string {
  const invitePlaceholder =
    inviteUrl ??
    "[未提供 invite_url。若使用者已附帶邀請連結，請改填該連結；若沒有附帶，請先向使用者索取邀請連結後再繼續。]";
  return DOCUMENT_TEMPLATE.replaceAll("{{INVITE_URL}}", invitePlaceholder);
}

function buildHtml(requestUrl: URL, inviteUrl: string | null, markdown: string): string {
  const shareUrl = new URL(requestUrl.toString());
  if (!inviteUrl) {
    shareUrl.searchParams.delete("invite_url");
  } else {
    shareUrl.searchParams.set("invite_url", inviteUrl);
  }

  const markdownUrl = new URL(requestUrl.toString());
  markdownUrl.searchParams.set("format", "md");

  const inviteCard = inviteUrl
    ? `<div class="card">
            <span class="label">Invite URL</span>
            <div class="value"><a href="${escapeHtml(inviteUrl)}">${escapeHtml(inviteUrl)}</a></div>
          </div>`
    : `<div class="card">
            <span class="label">Invite URL</span>
            <div class="value">未提供。若使用者已附帶邀請連結，請把它放進 <code>?invite_url=https://...</code>；若沒有附帶，先向使用者索取邀請連結。</div>
          </div>`;

  const inviteAction = inviteUrl
    ? `<a href="${escapeHtml(inviteUrl)}">Open Invite Link</a>`
    : "";

  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Tailscale Remote Support Onboarding</title>
    <style>
      :root {
        --bg: #f4efe7;
        --panel: rgba(255, 251, 245, 0.9);
        --ink: #1f2b24;
        --muted: #5f6f64;
        --accent: #0f766e;
        --accent-2: #b45309;
        --border: rgba(31, 43, 36, 0.12);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, rgba(180, 83, 9, 0.12), transparent 32%),
          radial-gradient(circle at top right, rgba(15, 118, 110, 0.12), transparent 24%),
          linear-gradient(180deg, #f8f2e8, var(--bg));
      }
      .wrap {
        width: min(1040px, calc(100vw - 32px));
        margin: 0 auto;
        padding: 32px 0 56px;
      }
      .hero, .doc {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(31, 43, 36, 0.08);
      }
      .hero {
        padding: 24px;
        margin-bottom: 20px;
      }
      h1 {
        margin: 0 0 8px;
        font-size: clamp(28px, 4vw, 44px);
        line-height: 1.05;
      }
      p {
        margin: 0;
        color: var(--muted);
        line-height: 1.6;
      }
      .meta {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 12px;
        margin-top: 18px;
      }
      .card {
        padding: 14px 16px;
        border-radius: 16px;
        background: rgba(255,255,255,0.72);
        border: 1px solid var(--border);
      }
      .label {
        display: block;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent-2);
        margin-bottom: 6px;
      }
      .value, .value a {
        color: var(--ink);
        font-weight: 600;
        word-break: break-all;
      }
      .links {
        margin-top: 18px;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }
      .links a {
        text-decoration: none;
        color: white;
        background: var(--accent);
        padding: 10px 14px;
        border-radius: 999px;
        font-weight: 600;
      }
      .links a.secondary {
        background: transparent;
        color: var(--accent);
        border: 1px solid rgba(15, 118, 110, 0.25);
      }
      .doc {
        padding: 24px;
      }
      pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
        font: 14px/1.68 "SFMono-Regular", "Menlo", "Monaco", monospace;
        color: var(--ink);
      }
    </style>
  </head>
  <body>
    <main class="wrap">
      <section class="hero">
        <h1>Tailscale Remote Support Onboarding</h1>
        <p>這個 Worker 會把遠程支援文檔公開發佈，並從 <code>?invite_url=</code> 動態注入邀請連結。</p>
        <div class="meta">
          ${inviteCard}
          <div class="card">
            <span class="label">Share URL</span>
            <div class="value">${escapeHtml(shareUrl.toString())}</div>
          </div>
        </div>
        <div class="links">
          ${inviteAction}
          <a class="secondary" href="${escapeHtml(markdownUrl.toString())}">View Markdown</a>
        </div>
      </section>
      <section class="doc">
        <pre>${escapeHtml(markdown)}</pre>
      </section>
    </main>
  </body>
</html>`;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const inviteUrl = normalizeInviteUrl(url.searchParams.get("invite_url"));
    const markdown = buildMarkdown(inviteUrl);

    if (url.searchParams.get("format") === "md") {
      return new Response(markdown, {
        headers: {
          "content-type": "text/markdown; charset=utf-8",
          "cache-control": "no-store",
        },
      });
    }

    return new Response(buildHtml(url, inviteUrl, markdown), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  },
};
