# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

putnamyoungdemsfl.org — the public site for Putnam County Young Democrats (PCYD), a forming (pre-charter) local political org in Palatka, FL. No build step: static HTML/CSS/vanilla JS, served by a Cloudflare Worker (`worker.js`) that owns a few `/api/*` routes, with everything else falling through to static assets via Cloudflare's assets binding. Content editing happens through Decap CMS at `/admin/`, which commits directly to GitHub via a first-party OAuth flow (no third-party proxy). D1 (`pcyd-signups`) backs the volunteer/RSVP sign-up form.

**Standing priorities:** the admin console (`/admin/`) must stay functional through every change, and mobile must always work. Sign-ups currently write to D1 directly; a future migration to **Solidarity Tech** is planned but not started — don't build against D1 assuming it's permanent, and don't fold that migration silently into unrelated work.

## Commands

```
npm install                    # install wrangler (only dependency)
npx wrangler dev --persist-to "$env:TEMP\pcyd-wrangler-state"
```

The `--persist-to` flag pointing outside the repo is required locally: `.wrangler/state`'s D1 SQLite files, if written inside the watched project root, retrigger wrangler's own file watcher and cause an infinite reload loop where every request hangs.

First time only, apply the schema to the local D1 database (same `--persist-to` path):
```
npx wrangler d1 execute pcyd-signups --local --persist-to "$env:TEMP\pcyd-wrangler-state" --file=./schema.sql
```

Then open `http://localhost:8787`. `.dev.vars` (gitignored; copy from `.dev.vars.example`) supplies `GITHUB_CLIENT_ID`/`SECRET` (placeholders are fine unless testing OAuth login end-to-end) and `ADMIN_TOKEN` for `/admin/signups.html`.

There is no build step, linter, or test suite. Verify changes by running `wrangler dev` and checking the affected page(s) in a browser — always including `/admin/` if `worker.js` or its security headers changed.

## Architecture

**Routing (`worker.js`):** Every request goes through the Worker first (`run_worker_first: true` in `wrangler.jsonc` — this is required for the security headers below to apply to static pages, not just `/api/*`). The Worker matches `/api/auth*` (GitHub OAuth for Decap), `/api/signup` (POST, writes to D1), `/api/signups` (GET, admin-token-gated read), and falls through everything else to `env.ASSETS.fetch()`.

**Security headers:** Applied to every response via `withSecurityHeaders()`. Two separate CSPs: `CSP_DEFAULT` for public pages, `CSP_ADMIN` for `/admin/*` (adds `'unsafe-eval'`, required because Decap CMS evaluates its YAML config with `eval()`). Don't collapse these back into one policy — doing so either breaks the admin console or weakens the public-page CSP. If you add a new external host (CDN, embed, font), update the CSP allowlist here; a too-strict CSP fails silently (the CMS or asset just won't load) rather than throwing a visible error.

**Content model:** Nearly all page copy lives in `_data/*.json`, edited through Decap CMS (`admin/config.yml` defines the collections/fields). Each JSON file maps to one CMS collection and is consumed client-side:
- `assets/js/page-content.js` provides `loadPageContent(file, applyFn)` plus `applyText`/`applyImage`/`applyParagraphs`/`applyCards` helpers. Every content page fetches its `_data/*-page.json` and swaps text into elements by `id`.
- **Static HTML always has real fallback copy baked in** — the JS fetch only overlays it if it succeeds. Never leave an element with a content-binding `id` empty in the HTML; the fallback is not decorative, it's what renders if the fetch fails.
- List-shaped content (events, officials, gallery, ballot guide, documents) follows a `published: boolean` convention instead of deletion, so records can be hidden without losing history (e.g. past election dates, unconfirmed ballot entries default to `published: false`).
- When adding a new editable field, it must be added in three places to actually work: the `_data/*.json` file, `admin/config.yml`'s matching collection/field, and the HTML page's fallback content + `id`-based binding (or list-rendering JS).

**Sign-ups (`_data` is not involved here):** `POST /api/signup` (handled in `worker.js`) validates and inserts into D1's `signups` table (`schema.sql`), rate-limited 5/60s per IP via the `SIGNUP_LIMITER` binding (fails open if the binding is missing, so local dev without it still works). `admin/signups.html` reads them back via `GET /api/signups`, gated by a shared-secret `X-Admin-Token` header checked against `env.ADMIN_TOKEN`. `assets/js/signup.js` has the shared client-side submit handler both the volunteer and RSVP forms call into.

**Decap OAuth (`/api/auth`, `/api/auth/callback`):** First-party GitHub OAuth flow, no proxy. State is stashed in a short-lived `HttpOnly` cookie for CSRF protection across the redirect. The callback's response page does a two-step `postMessage` handshake with Decap's popup listener (ping with `authorizing:github`, wait for Decap's echo, then send the real success payload with the origin Decap echoed back) — sending the success message immediately without this handshake means Decap silently never picks it up.

**Theming (`styles.css`):** Semantic surface tokens (`--hero-bg`, `--page-bg`, `--surface`, `--border`, `--link`, etc.) that components reference instead of raw brand colors, overridden under `[data-theme="dark"]`. Dark is the default theme (set by an inline head script on every page, before first paint); an explicit user choice is saved to `localStorage` and wins from then on. Every content page (not the homepage) follows the same three-band layout top to bottom: a `--hero-bg` band for the page title, a `--page-bg` band for the body content, and a closing `--hero-bg` band (reusing `.hero`) for the final CTA before the footer. **Full token reference, values, and a plain-English cheat sheet: `COLOR_SYSTEM.md` — read it before touching any color in `styles.css`.** Always use the semantic tokens, never raw brand colors (`--river-blue`, `--azalea-pink`, etc.) directly in a component rule, except the one deliberate exception noted in that doc (the homepage button card).

**Putnam Watch (`putnam-watch/`):** A separate, self-contained accountability/promise-tracker sub-site (own HTML/CSS/JS, own roster in `data.js`). Deliberately soft-launched — linked from a Voter Resources card, not in main site nav. Its roster is intentionally kept independent from `_data/officials.json`; don't merge them without checking with the project owner first, that decision has been revisited and closed before.

## Working conventions

- **Any text you write that ends up on the site (page copy, event/ballot-guide/document descriptions, new `_data/*.json` fields) must follow `CONTENT_STYLE.md`.** Read it before drafting or editing user-facing copy — it exists so site content reads as professional writing, not generic AI output.
- No automated tests exist. If adding any, mock GitHub OAuth and D1 rather than hitting them live.
- This is a two-person-scale civic org site with real users (volunteers signing up, an admin checking signups) — prefer minimal, targeted diffs over broad refactors, and don't change `worker.js` security headers or the OAuth flow without smoke-testing `/admin/` afterward.
- Content/copy decisions (page wording, which officials/events/ballot entries are published) are the site owner's call, not something to infer from context — when in doubt, leave `published: false` and ask.
