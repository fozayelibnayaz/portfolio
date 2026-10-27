# Fozayel Ibn Ayaz — Portfolio

A one-page portfolio built with **Astro 5 + TypeScript + GSAP + Lenis** and hand-written CSS.
Static output, no UI framework, no CSS library, no external requests.

**Palette — “Signal”:** ink `#07080b`, chalk `#f3f6f1`, electric lime `#ccff3f`, violet `#6f5bff`,
teal `#46e6c8`. Big Shoulders Display for headlines, Instrument Serif italic for accents,
Instrument Sans for body, JetBrains Mono for labels — all self-hosted.

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:4321
```

| Command | What it does |
| --- | --- |
| `npm run dev` | dev server on `0.0.0.0:4321` |
| `npm run build` | type-check (`astro check`) + production build → `dist/` |
| `npm run preview` | serve the built `dist/` on `:4322` |
| `npm run typecheck` | Astro + TypeScript diagnostics only |

---

## Pushing this to `github.com/fozayelibnayaz/portfolio`

The repo is a **project page**, so the site lives at `https://fozayelibnayaz.github.io/portfolio/`.
That means the build needs a base path — the included workflow already sets it.

### 1. Initialise and push

```bash
cd fozayel-portfolio

git init
git add .
git commit -m "Portfolio: clean hero, signal palette, GSAP motion"

git branch -M main
git remote add origin https://github.com/fozayelibnayaz/portfolio.git

# if the GitHub repo already has a README/commit, merge it first:
git pull --rebase origin main

git push -u origin main
```

`node_modules/`, `dist/` and `.astro/` are already ignored by `.gitignore` — nothing heavy gets
committed.

### 2. Turn on Pages

1. Open the repo → **Settings** → **Pages**
2. **Source:** `GitHub Actions` (not “Deploy from a branch”)
3. Push again (or **Actions → Deploy to GitHub Pages → Run workflow**)

`.github/workflows/deploy.yml` builds with `BASE_PATH=/portfolio` and publishes `dist/`.
Two minutes later the site is live at **https://fozayelibnayaz.github.io/portfolio/**

### 3. Alternative: manual build + push `dist/`

If you'd rather not use Actions, or you're deploying to Netlify/Vercel/Cloudflare:

```bash
# GitHub Pages (project site)  → must include the subpath
BASE_PATH=/portfolio npm run build

# Custom domain / Netlify / Vercel / Cloudflare Pages → root
npm run build
```

For Netlify/Vercel/Cloudflare just point them at the repo — build command `npm run build`,
output directory `dist`, no base path needed.

### If your default branch is not `main`

Change `branches: [main]` in `.github/workflows/deploy.yml` to match, or run:

```bash
git branch -M main
```

---

## The page, top to bottom

| # | Section | What it does |
| --- | --- | --- |
| — | Preloader | Counter to 100, bar fills, curtain lifts |
| 001 | Hero | Four elements only: the type, the portrait, the name, the line. `FULL–STACK` above, `DEVELOPER` behind the portrait, serif nameplate below, one sentence + two buttons at the foot |
| — | Marquee | Infinite strip of all eight shipped projects, slows on hover |
| 002 | Services | Build · Measure · Maintain — icon, one line, one proof line |
| 003 | Work | Filter chips, eight case-study cards each with a one-line result, then every verified live link |
| — | Stats | Full-bleed lime band: 4+ / 12+ / 6 / 3 |
| 004 | About | Statement headline, two sentences, three facts, one quote, portrait |
| 005 | Experience | Five roles, education and languages as a scannable table |
| 006 | Toolkit | Transmission panel — rotating giant technology names over drifting code, with Prev / Pause / Next and a progress rail — plus three grouped skill rows |
| 007 | Engineering | Six techniques shown as live demos, with every number counted from source at build time |
| 008 | Contact | Three tiles (email, WhatsApp, GitHub), CV download, reply-time note |

Long-form detail lives inside the per-project dialog, so the page itself stays visual.

## What was removed from the hero

The hero used to carry twelve elements — chips, a job rail, a status bar, a location line, a scroll
bar, a plate, a pitch block and a portrait. It now carries **four**: the two display lines, the
portrait, and the name. Everything else moved down the page or was deleted. The result is one clear
focal point instead of five competing ones.

## Engineering section

`src/components/Engineering.astro` proves the stack instead of claiming it. Six techniques, each
with a working demo rather than a description:

| Technique | Shown by |
| --- | --- |
| Fluid type | A word scaling on `clamp()`, with a rule that follows it |
| Mask composite | The portrait dissolved by two intersected gradients |
| Clipped gradient | A headline filled with a gradient, cut to the letterforms |
| Scroll choreography | A staggered ladder driven by ScrollTrigger |
| Infinite wrap | A strip looping via `modifiers` + `unitize` |
| Zero UI framework | `0` external requests |

The four headline numbers — CSS lines, TypeScript lines, components, media queries — are read
from disk by `src/lib/buildStats.ts` during the build. Change the source and the figures change
with it; there is no hand-typed number anywhere on the page to drift out of date.

## Motion inventory

All GSAP + ScrollTrigger, driven by a Lenis scroll loop, all skipped under `prefers-reduced-motion`
(content is never gated behind a tween):

- preloader counter → curtain lift → staggered hero entrance
- scroll-scrubbed hero parallax (portrait and aura)
- fade-and-rise reveals per section, batched with ScrollTrigger
- infinite marquee with a GSAP `modifiers` wrap that slows on hover
- transmission: auto-advance, progress bar, clip transitions, real controls
- 3D pointer tilt with image counter-parallax on project cards
- stat counters, header hide-on-scroll, lime scroll-progress bar, section spy
- magnetic buttons, custom cursor (fine pointers only), violet spotlight follow
- split-word masked reveals on the big headings (words wrapped at runtime, lifted through an
  `overflow:hidden` mask — real masks, no clipped descenders, untouched for screen readers)
- scroll-velocity skew on the marquee, read from `ScrollTrigger.getVelocity()` and clamped

## Structure

```
src/
  assets/fonts/          6 self-hosted woff2 subsets
  components/            Header, Hero, Marquee, Capabilities, Work, Stats, About,
                         Experience, Transmission, Contact, Footer, ProjectDialog,
                         Preloader, Cursor, SecHead
  data/content.ts        single source of truth: copy, projects, roles, links
  layouts/Base.astro     head, meta/OG, JSON-LD Person, chrome
  lib/asset.ts           base-path-safe asset helper (GitHub Pages friendly)
  lib/buildStats.ts      counts CSS/TS lines, components, media queries from disk at build time
  pages/index.astro      page composition
  scripts/anim.ts        Lenis + GSAP motion layer
  styles/                tokens · base · hero · sections · dialog · responsive
public/
  img/                   project screenshots + portraits
  files/                 Fozayel_Ibn_Ayaz_CV.pdf
.github/workflows/       GitHub Pages build + deploy
```

## Breakpoints

| Width | Behaviour |
| --- | --- |
| ≥ 1061px | Hero: type above, portrait layered over the giant word, name below |
| ≤ 1060px | Hero compacts, the giant word scales with the viewport |
| ≤ 1120px | Nav collapses to a drawer |
| ≤ 1080px | Services stack, about goes single-column, contact tiles stack |
| ≤ 1200px | Work grid 3 → 2 columns |
| ≤ 760px | Work grid → 1 column, full-screen dialog |
| ≤ 560px | Type scale tightens, stats 2-up |
| ≤ 800px tall (desktop) | The whole hero scales down so nothing can collide |

## Verified (headless Chromium)

- `astro check` → **0 errors, 0 warnings, 0 hints**
- Build → 1 page, 2.5 MB `dist/`; base-path build verified (`/portfolio/` links resolve)
- **20 widths** from 320 → 2560 px: `scrollWidth === innerWidth` everywhere, no element crossing
  the viewport edge
- 0 console errors, 0 failed requests
- Interactions exercised: filters (8 → 1 → 8 cards), case-study dialog + Escape + focus return,
  mobile drawer, anchor scrolling, transmission auto-advance / next, marquee hover
- `prefers-reduced-motion`: no preloader, no entrance animation, hero fully visible on load

## Accessibility

Skip link, semantic landmarks, focus-visible rings, `aria-*` on the dialog and drawer, Escape closes
overlays and restores focus, focus-trapped dialog, keyboard-operable carousel, `aria-pressed` on
autoplay, reduced-motion support, descriptive `alt` text.

## Content

Every string lives in `src/data/content.ts` — hero copy, services, all eight case studies, live
links, stats, roles, education, toolkit and contact details. Components never hard-code copy.
