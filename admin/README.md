# Portfolio Admin — static CMS

A WordPress-style dashboard for editing **every visible piece of content** on the site.
It lives at `admin/index.html` and works anywhere the site works (GitHub Pages included)
because it is fully static — no server, no database.

**Password:** `fozayel2026` (change: see below)

## What you can edit
| Section | Contents |
|---|---|
| Site | browser title, meta description |
| Hero | eyebrow, name, subline, status chip |
| About | title, paragraphs, quick facts, photos |
| Experience | roles (add / remove / reorder), bullets, tech tags |
| Skills | groups + chips, footnote |
| Projects | cards + case-study bullets + live links |
| Contact | title, email, phone, GitHub, CV path, footer |
| Settings | accent color, hero background (golden-hour video vs rainy-night photo), rain on/off |

## How publishing works (and why)
GitHub Pages serves static files — there is no PHP/server like real WordPress, so:

1. **Save** — every edit auto-saves a draft to this browser's `localStorage`.
   The live preview pane reads the same draft, so what you see is exactly what publishes.
2. **Publish ⤓** — downloads `content.json` to your computer.
3. Upload that file to the repo root (`Add file → Upload files` on github.com) and commit.
4. The site fetches `content.json` on every visit → your changes go live in ~1 minute.

No `content.json` in the repo? The site runs on the built-in content — it never breaks.

## Notes
- The draft stays in **this browser only**. Clearing site data clears the draft
  (published JSON is safe in the repo). Use *Export JSON* as a backup.
- *Import JSON* restores a previously exported/published file.
- To change the password: replace the `DEFAULT_HASH` value in `admin.js`
  with the SHA-256 of your new password
  (`echo -n "newpass" | sha256sum`).
- Editing while serving from `file://` may block the preview iframe and storage
  in some browsers. Serve the folder instead: `python3 -m http.server` →
  `http://localhost:8000/admin/`.
- To add new photos: upload them to `img/` in the repo, then reference them by
  path (`img/myphoto.jpg`) in any image field.
