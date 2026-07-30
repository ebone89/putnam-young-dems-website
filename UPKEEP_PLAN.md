# Upkeep & Improvement Plan

Working reference for maintaining and growing putnamyoungdemsfl.org. Based on a Cloudflare dashboard verification pass on 2026-07-30 (staging deploy of commit `1578125` confirmed successful; Decap media library thumbnails confirmed fixed).

## Current state

- **Hosting:** single Cloudflare Worker (`putnam-young-dems-website`, not a Pages project), deployed via Cloudflare's Git integration. Production branch is `main`; non-production branches (including `staging`) build their own previews automatically on push.
- **Content editing:** Decap CMS at `/admin/`, authenticated via first-party GitHub OAuth. Every content edit is a Git commit — full history, easy rollback, no separate CMS database.
- **Data:** D1 (`pcyd-signups`) backs volunteer/RSVP sign-ups, rate-limited per IP. Secrets (admin token, GitHub OAuth client ID/secret) are stored as encrypted Cloudflare environment variables, not in code.
- **Why this holds up well for a small volunteer org:** no database server or CMS backend to patch, deployments are effectively free, and git-backed content means nothing is ever lost to a bad edit.

## Recurring upkeep

| Cadence | Task |
|---|---|
| Weekly (active campaign season) / Monthly (otherwise) | Log into `/admin/`: add upcoming events, retire past ones, update elected officials and ballot guide entries, refresh the photo gallery after events. |
| Each election cycle | Full pass on Ballot Guide and Elected Officials pages for accuracy. |
| Periodically | Check `npm audit` output in Cloudflare build logs. As of this pass, 3 high-severity dependency vulnerabilities were flagged — run `npm audit fix` or bump the affected packages by hand. |
| Occasionally | Rotate the GitHub OAuth client credentials and `ADMIN_TOKEN`. Confirm only trusted GitHub accounts have write access to the repo, since that's equivalent to CMS login access. |
| Every change to `staging` | Sanity-check the staging preview URL before merging to `main` — this is already the intended workflow, keep using it. |

## Improvement ideas, roughly in priority order

1. **npm audit fixes** — the 3 flagged high-severity vulnerabilities are the most concrete, actionable item on this list and should happen before any of the items below.
2. **Internal one-page content guide** — a short doc for whoever handles content (how to log in, add an event, swap a photo). Closes the biggest practical gap for a site like this: what happens when the original builder isn't around to make edits.
3. **Cloudflare Web Analytics** — free, privacy-respecting, fits the existing stack. Gives whoever maintains content visibility into what pages actually get traffic.
4. **More prominent "get involved" pathway** — volunteer roles, committee openings, precinct captain sign-ups, surfaced more visibly than the current Get Involved page. Routes visitor enthusiasm into structure instead of a one-time form fill.
5. **ActBlue donation integration** — a real fundraising embed/button. Standard across nearly all Democratic sites; worth confirming it isn't already planned or intentionally deferred before treating this as a gap.
6. **Email list capture** — Mailchimp, Action Network, or similar, to convert one-time visitors into a reachable list rather than relying solely on the D1 sign-up table.
7. **Calendar/RSVP with reminders** — builds on the existing Events collection instead of static event cards; higher effort than the items above, worth scoping separately once the smaller items are done.

## Notes

- This file is an internal planning doc, not site copy — `CONTENT_STYLE.md` doesn't govern it.
- The Solidarity Tech migration (see `CLAUDE.md`) is a separate, already-planned initiative and would likely absorb or replace items 4 and 6 above once scoped — don't start build-out on those in parallel without checking that overlap first.
