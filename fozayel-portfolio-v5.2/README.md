# Fozayel Ibn Ayaz — Portfolio

Personal portfolio of **Fozayel Ibn Ayaz** — full-stack developer & data analyst, Dhaka, Bangladesh.

**Live:** https://fozayelibnayaz.github.io/portfolio/

## Stack
- Vanilla HTML / CSS / JavaScript — no frameworks, no build step
- Vintage-style animated hero (canvas wireframe), walking-character contact scene
- Dark / light theme switcher (hero & contact follow the theme)
- Built-in CMS at `/admin` (password-protected): edit every visible string, roles, projects & settings, preview, then publish `content.json` to this repo
- Fonts: Inter Variable + JetBrains Mono (self-hosted)

## Structure
```
index.html          site
404.html            GitHub Pages fallback
content.json        CMS content (single source of truth)
admin/              CMS dashboard
css/ js/ fonts/     styles, scripts, self-hosted fonts
img/ media/         avatar, favicon, og-image
```

## Edit content
1. Open `/admin/` on the live site (or locally)
2. Log in, make edits, use Preview to check
3. Publish → download `content.json` → replace it in this repo → commit

## Local preview
```bash
python3 -m http.server 8080
# open http://localhost:8080
```

---
© 2026 Fozayel Ibn Ayaz
