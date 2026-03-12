# tailscale-onboarding-workers

Cloudflare Worker for publishing a public Tailscale remote-support onboarding page.

The Worker renders a Markdown onboarding template and injects a Tailscale invite URL through `?invite_url=` at request time.

## Why this exists

- Keep the onboarding document public and reusable.
- Avoid hardcoding live invite links in the repository.
- Let consultants share a single Worker URL with a per-session invite link.

## Files

- `src/index.ts`: Worker entrypoint and HTML/Markdown rendering
- `src/document.ts`: onboarding template source
- `REMOTE_SUPPORT_TAILSCALE_ONBOARDING.md`: local Markdown copy of the onboarding instructions
- `wrangler.jsonc`: Wrangler config

## Local development

```bash
npx wrangler dev --config wrangler.jsonc
```

## Deploy

```bash
npx wrangler deploy --config wrangler.jsonc
```

## Usage

Pass the invite link explicitly:

```text
https://<worker-host>/?invite_url=https://login.tailscale.com/uinv/...
```

Markdown output:

```text
https://<worker-host>/?invite_url=https://login.tailscale.com/uinv/...&format=md
```

If no `invite_url` is provided, the page now tells the operator to use a user-supplied invite link or ask the user for one before continuing.

## Copyable Share Text

```text
請依照這份文檔引導客戶完成 Tailscale 遠端支援加入流程，並優先自主探測與自主執行；如果我有附帶邀請連結就直接使用，如果沒有附帶就先向我索取邀請連結，再繼續下一步：https://raw.githubusercontent.com/qoli/tailscale-onboarding-workers/refs/heads/main/REMOTE_SUPPORT_TAILSCALE_ONBOARDING.md
```

## Direct Codex Instruction

```text
閱讀這份文檔，並嚴格依照文檔流程執行 Tailscale onboarding：https://raw.githubusercontent.com/qoli/tailscale-onboarding-workers/refs/heads/main/REMOTE_SUPPORT_TAILSCALE_ONBOARDING.md

執行規則：
- 如果我已附帶邀請連結，直接使用該連結
- 如果我沒有附帶邀請連結，先向我索取邀請連結，再繼續
- 優先自主探測、自主打開頁面、自主檢查狀態，不要先詢問我
- 只有在你無法從現有上下文、瀏覽器或管理端自行取得必要資訊時，才向我提問
- 一次只做一步，等待回覆後再進下一步
- 不要要求我貼出密碼、驗證碼、token 或其他可重用授權資訊
```
