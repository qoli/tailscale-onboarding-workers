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
