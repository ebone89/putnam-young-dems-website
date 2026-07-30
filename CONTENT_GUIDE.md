# Content Editor Guide

A short reference for whoever handles day-to-day content on putnamyoungdemsfl.org — no developer required for any of this.

## Getting in

The admin panel lives at `putnamyoungdemsfl.org/admin/` (the same interface exists on every Cloudflare preview URL too, which is useful for reviewing changes before they go live). On the login screen, click "Login with GitHub" and authorize with whichever GitHub account has been granted access to the `ebone89/putnam-young-dems-website` repo.

There's no separate CMS password to remember or lose track of — access is entirely controlled through GitHub. Adding or removing an editor just means adding or removing their GitHub account as a collaborator on the repo.

## How content and publishing actually work

Every change made in the admin panel becomes a Git commit in the repository, and every commit to the `main` branch triggers Cloudflare to rebuild and redeploy the live site automatically, usually within a minute or two. There's no separate "publish" step beyond clicking Publish on an entry in the CMS — and because every change is a commit, every past version of every page is preserved in the site's history if something ever needs to be rolled back.

For anything riskier — a big rewrite of a page, a batch of new events — ask whoever manages the repo about pushing it to the `staging` branch first. That deploys to its own private preview URL without touching the live site, so it can be reviewed before merging into `main`.

## What each section controls

The left-hand Collections list is organized by content type, not by page, though a few map directly onto one page each:

- **Events** — the list shown in the site's upcoming events section. Title, start date, optional end date, a free-text time description, and location details.
- **Voter Registration** and **Election Dates** — the standalone informational pages about registering to vote and key election dates.
- **Ballot Guide** — the entries that populate the ballot guide page.
- **Elected Officials** — the profiles shown on that page.
- **Photo Gallery** — every photo shown in the site's gallery, each with its own caption, optional date, and a Published toggle that hides a photo without deleting it.
- **Get Involved Photos** — the small slideshow of photos shown under the page intro on the Get Involved page. Kept as its own collection rather than a field on the Get Involved page text (see below) because of an editor bug with combining the two.
- **Documents** — downloadable files like flyers or PDFs.
- **Page Content** — the actual written text for each page of the site (Home, About, Get Involved, Events, Voter Resources, Elected Officials, Ballot Guide, Gallery, Documents, Contact, plus a general "Community Context" entry). This is where to fix a typo, reword a paragraph, or update a mission statement — not where to add a new event or photo.

## Adding or editing an event

Open **Events**, click into the entry, and you'll see a list of individual events you can expand, reorder by dragging the handle, or remove with the X. Clicking "Add event" creates a new one with fields for title, start date, an optional end date for multi-day events, a plain-text time range, location name and address, and a description. Use the Publish button in the top bar to commit the change; the preview panel on the right shows roughly how the entry will read once live.

## Adding or replacing photos

Open **Photo Gallery**, expand the entry, and click "Add photo" to create a new slot. Click "Choose an image" to open the media library, where you can pick an existing image already uploaded to the site or click Upload to add a new one from your computer. Once an image is selected, fill in a caption (this doubles as the image's alt text for accessibility, so it's worth writing a real description rather than leaving it blank) and an optional date. The Published toggle temporarily hides a photo from the live gallery without losing it. Publish the entry the same way as anywhere else in the CMS.

The Get Involved page has its own small photo slideshow, separate from the main Photo Gallery above and managed the same way: open **Get Involved Photos** in the sidebar (not Page Content — that only holds this page's text), click "Add photo", upload, and Publish. Add one or more photos there and they'll cross-fade automatically under the page intro, with arrows and dots if there's more than one.

## Editing page text

Open **Page Content** and pick the page you want to change. These entries tend to hold larger blocks of text mapped to specific sections of that page, so it's worth reading through the existing structure before editing so the right block gets replaced rather than accidentally duplicated. As with everything else, changes go live once you click Publish.

## Giving someone else access

There's no separate CMS account system to manage — admin access is entirely GitHub repo access. To let someone else log in and edit content:

1. Ask for the GitHub username (or email) of the account they'll log in with. If they don't have a GitHub account, they'll need to create one first (free, at github.com) — it doesn't need to be tied to their real name.
2. Go to `github.com/ebone89/putnam-young-dems-website` → **Settings** → **Collaborators and teams** (left sidebar) → **Add people**.
3. Enter their GitHub username and send the invite. They'll get an email/notification to accept it.
4. Once they accept, they can go to `putnamyoungdemsfl.org/admin/`, click "Login with GitHub", and authorize — no separate password or setup on your end.

To remove someone's access later, go back to that same Collaborators page and remove them — that immediately revokes their ability to log into the CMS too, since it's the same permission.

A couple of things worth knowing before handing this off:

- Every collaborator can edit and publish **any** page — there's no per-page or per-collection permission control in this setup. Only add people you'd trust with the whole site.
- Every publish is a real, immediate commit to the live site (see "How content and publishing actually work" above) — there's no draft/review step unless you specifically ask them to use the `staging` branch for something first and have someone else merge it.
- GitHub itself has 2FA and its own account security; that's the actual security boundary for who can edit the site, not anything in this CMS.

## A few practical tips

- Autosave in Decap CMS only saves your draft locally in the browser — it doesn't commit anything to the site until you click Publish, so don't assume an edit is live just because the page said "changes saved."
- If uploading new photos, downsize them first (roughly 1500px on the longest side is plenty for a website). This keeps the site fast and keeps the repo from bloating with oversized image files over time.
- If anything ever looks broken in the admin, especially around images, checking the deployment history in Cloudflare's dashboard is the fastest way to confirm whether the live site actually picked up the latest fix or is still running an older build.
