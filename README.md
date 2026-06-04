# file-salad-web

The FileSalad **anonymous web app** in **React 19 + Vite + TanStack Query**. Drop a
file, get a public link in seconds — no account, no install. The browser uploads
bytes **directly to storage** via a presigned URL; the backend only signs and
tracks metadata.

This is the one-pager counterpart to [`file-salad-electron`](../file-salad-electron)
(the authenticated desktop app). Both share the same backend and the same design
system, [`file-salad-ui-lib`](../file-salad-ui-lib).

## Stack

- **React 19** + **TypeScript 5.8**, built with **Vite 6**.
- **TanStack Query** for server state, uploads, and the feature-flags fetch.
- **React Router** — home (`/`), share-code redeem (`/s/:code`), privacy (`/privacy`).
- **Tailwind CSS** for app layout only; all design tokens and branded components
  come from `file-salad-ui-lib`.
- **lucide-react** icons, **meemaw** for conditional rendering.
- **Vitest** + Testing Library + **MSW** (mocked API) + `fake-indexeddb` for tests.

## Features

- **Anonymous upload:** drag-drop, paste, or click. Presign → client PUT → done.
  No bytes touch the backend. Capped per browser via an `X-Fingerprint` header
  + server-side IP cap.
- **Share codes:** mint a short, human-shareable code for an upload; anyone can
  redeem it at `/s/:code` for a fresh download URL (gated by a feature flag).
- **Local history:** uploads are remembered in IndexedDB + localStorage and shown
  in a desktop sidebar / mobile bottom sheet. Opt-in, toggleable, never leaves
  the browser.
- **URL-expiry handling:** public links and codes carry an absolute expiry; the
  UI invalidates stale URLs and auto-refreshes them via the download endpoint.
- **Feature flags:** the UI fetches `/features` on boot (cached per the server's
  TTL hint) to toggle share-codes and other rollouts without a redeploy.
- **SEO:** the home page is indexable; user-bearing `/s/:code` links are `noindex`.

## Structure

```
src/
  main.tsx                entry — mounts React
  app.tsx                 root: providers + routes
  app.provider.tsx        QueryClient, FeatureFlagsProvider, BrowserRouter
  app.routes.tsx          route definitions
  features/
    upload/               the main screen
      screen/             composition root + parts (drop-area, history, top-bar)
      api/                hooks: useUploadFile, useShareCode, useRedeemCode, useWebUsage…
      providers/          HistoryProvider (context + IndexedDB/localStorage)
      types/ utils/       upload DTOs + controllers (paste, page-drop, history-db)
    privacy/              privacy policy page
  shared/
    config/env.ts         single source of truth for API/web base URLs + share-link builder
    constants/            routes.ts, endpoints.ts (backend paths)
    feature-flags/        FlagSource contract, /features provider, hooks
    services/             api-client (fetch wrapper), api-error, fingerprint
    seo/ ui/ utils/       document meta, local UI bits, url-expiry helpers
    test-utils/           Vitest + MSW setup
```

Features are self-contained (screen + api + types + utils). Cross-feature
concerns live under `shared/`. Backend paths are centralized in
`shared/constants/endpoints.ts`; env access goes through `shared/config/env.ts`.

## Getting started

```bash
pnpm install
pnpm dev          # Vite dev server on http://localhost:5173
```

The web app talks to the [`backend`](../backend); start that first (it defaults
to `http://localhost:8096`).

> **Install note:** this app consumes `file-salad-ui-lib` from a `github:` tag
> that intentionally doesn't ship `dist/`, so it builds on install. `pnpm` 10+
> blocks build scripts for git deps by default — `package.json` already
> allowlists it via `pnpm.onlyBuiltDependencies`, so a plain `pnpm install`
> works.

## Environment

Env vars are read through `src/shared/config/env.ts`. Defaults are baked in, so
`.env` is optional for local dev.

| Var | Default | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8096` | Backend API base |
| `VITE_WEB_BASE_URL` | `http://localhost:5173` | This app's own base (used to build share links) |

The checked-in `.env` sets `API_BASE_URL` for convenience; prefer the `VITE_`-prefixed
names so Vite exposes them to the client.

## Commands

```bash
pnpm dev          # dev server (hot reload)
pnpm build        # tsc -b && vite build → dist/
pnpm preview      # serve the built dist/ on :4173
pnpm typecheck    # tsc -b --noEmit
pnpm lint         # eslint src
pnpm format       # prettier --write src
pnpm test         # vitest run
pnpm test:watch   # vitest watch
pnpm clean        # rm dist/, coverage, tsbuildinfo
```

## Testing

Tests run under Vitest with jsdom. The backend is mocked with **MSW** and storage
with **fake-indexeddb**, so the full upload/redeem flows are exercised without any
real network or browser APIs. Shared handlers and the QueryClient wrapper live in
`src/shared/test-utils/`.

## See also

- [`../backend`](../backend) — the API this app calls (presign, share codes, features).
- [`../docs/api-docs.md`](../docs/api-docs.md) — full API reference.
- [`../docs/url-expiry.md`](../docs/url-expiry.md) — how link/code expiry is handled end-to-end.
