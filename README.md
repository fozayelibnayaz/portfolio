# Fozayel Ibn Ayaz — portfolio

A responsive, editorial-style portfolio built with Next.js, using Fozayel's supplied portrait, verified portfolio content, and CV. The GitHub Pages build is a static export designed for the existing repository at `fozayelibnayaz/portfolio`.

## Hosting options and the GitHub Pages limitation

### Free GitHub Pages (the prepared deployment)

GitHub Actions builds and deploys the site from the `main` or `master` branch. The published URL is `https://fozayelibnayaz.github.io/portfolio/`. This static build includes the portfolio and project pages, but GitHub Pages **cannot run the server-side CMS, password checks, uploads, or API routes**. Its `/admin/` page explains how to edit the content source. To update the site, edit `content/portfolio.json` in the repository and push; Actions rebuilds it. No CMS password is stored in or required by the Pages version.

To build the same static export locally, use Node.js 20.9+:

```bash
npm ci
npm run build:github-pages
```

The generated website is placed in `out/`. The script makes a temporary build copy and omits server-only CMS/API handlers from the published artifact; the regular source project remains available for local development.

### Full CMS (local or a Node.js server)

The normal `npm run dev` / `npm run build` app includes the password-protected `/admin` CMS and API routes. It requires a Node.js server. Set `CMS_PASSWORD` in the shell or hosting provider's secret settings; never commit the password or a `.env` file. The CMS stores editable JSON and uploads on disk. On a server, a durable volume is required for changes to persist. **This full CMS mode is not available on GitHub Pages.** The supplied passphrase is not embedded in the public source.

## Design and implementation

- Next.js 16, React 19, TypeScript 7, App Router, and hand-authored responsive CSS.
- Self-hosted Archivo, Inter, and JetBrains Mono fonts; responsive WebP portrait variants and the transparent PNG master; local CV asset.
- Accessible color theme control, reduced-motion support, and mobile navigation.
- Contact form hands off through a prepared `mailto:` message by default; it does not claim to store or deliver a message on a server.
- Eagle 3D Streaming is listed as Data Analyst, Jul 2023–Aug 2026, `current: false`.

## Deploy to GitHub Pages

1. Push the project into the existing `https://github.com/fozayelibnayaz/portfolio` repository, preserving its `.git` history. Follow [`docs/push-and-deploy.md`](docs/push-and-deploy.md) for the Mac clone/copy/commit commands.
2. In the GitHub repository, open **Settings → Pages** and choose **GitHub Actions** as the build/deployment source.
3. Push to `main` or `master` (or manually run **Actions → Deploy portfolio to GitHub Pages → Run workflow**). Wait for the workflow to finish successfully.
4. Visit `https://fozayelibnayaz.github.io/portfolio/`. The workflow uses the repository base path `/portfolio`; do not publish the contents of `out/` to the repository root manually.

The Pages workflow needs no password or personal access token. GitHub Pages cannot securely host an admin password or private CMS. Use repository editing and a push for updates. See [`docs/push-and-deploy.md`](docs/push-and-deploy.md) for the exact first-time steps and troubleshooting.

## Local CMS and server-mode commands

```bash
npm ci
CMS_PASSWORD='choose-a-strong-password' npm run dev
```

Visit `http://localhost:3000/admin`. For production Node mode:

```bash
npm run typecheck
npm run build
CMS_PASSWORD='choose-a-strong-password' npm run start
```

The CMS fails closed for publishing when `CMS_PASSWORD` is unset. Use a password manager and a host secret manager; do not place passwords in source, chat, or `.env.example`. `PORTFOLIO_DATA_DIR` may point to a mounted durable directory for CMS JSON and uploaded files. On GitHub Pages, this variable has no effect because no server runs.

## Content and QA

- Main editable source: `content/portfolio.json`.
- `content/default.json` is the fallback/metadata seed.
- Public homepage: `/`; project detail pages: `/projects/<slug>/`.
- In the Pages static artifact, `/admin/` is a short explanation page (no sign-in); in normal Node mode, `/admin` is the CMS.
- [`docs/qa-report.md`](docs/qa-report.md) records build, device, accessibility, security, and Lighthouse checks.
- [`docs/figma-handoff.md`](docs/figma-handoff.md) documents tokens/layout; [`docs/portfolio-design-board.svg`](docs/portfolio-design-board.svg) is an editable vector board for Figma.

Run `npm run typecheck` and `npm run build:github-pages` before a Pages release. The standard server build is `npm run build`.
