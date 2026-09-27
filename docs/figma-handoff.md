# Figma-ready UI/UX handoff

**Current source of truth:** the running production-like site, `/home/user/uploads/image-1.png` (the user's direct composition reference), and [`portfolio-design-board.svg`](portfolio-design-board.svg). The current design is a close recreation of the supplied hero layout, adapted for Fozayel. It replaces the earlier split editorial hero. It uses the supplied portrait and truthful portfolio content; it does not reproduce the reference subject's identity or copy.

A native `.fig` file cannot be authored or published from this workspace because there is no Figma workspace/account or API available. The companion vector board is importable into Figma and includes the desktop/mobile hero composition, tokens, and UI annotations. Use this document to grow it into the complete frame/component library. No native Figma deliverable is claimed.

## Figma file plan

1. **00 — Foundations:** palette, type styles, spacing, grid, elevation, motion and accessibility.
2. **01 — Components:** header/status pill, nav links/counts, theme control, CTA/social pills, display type, portrait states, section headings, cards, timeline rows, form fields, CMS controls.
3. **02 — Portfolio / Light:** hero viewport, full homepage, project detail, mobile menu open, contact validation/submission affordance.
4. **03 — Portfolio / Dark:** same home/detail states; maintain contrast and legibility. The portrait remains grayscale by default and reveals its natural color on hover/focus.
5. **04 — CMS:** sign-in, overview, editors for each content collection, reorder/visibility, upload, publish, empty and error states at desktop/mobile widths.

## Key frames

| Frame | Viewport | Notes |
| --- | ---: | --- |
| Home hero / Light | 1568 × 835 | Match the user's supplied reference composition: status pill, centered nav, rounded dark CTA; oversized outlined first name and solid second line; overlapping monochrome portrait; role/copy/project action left; contact pills right; centered scroll cue. |
| Home / Light | 1440 × 900 | Full-page capture; hero above the fold, followed by about, selected work, experience, skills, education, contact and footer. |
| Home / Tablet | 820 × 900 | Compact type/nav; confirm name and right/left actions remain balanced. |
| Home / Mobile | 390 × 844 | Compact status/controls, stacked headline, centered crop, readable intro/CTA panel, contact pills, scroll cue. |
| Home / Mobile | 360 × 800 | Narrow-fit and no horizontal overflow. |
| Project detail / Light + Dark | 1440, 390 | Reading column, summary, meta, highlights, tags, links and next action. |
| Mobile menu / Light + Dark | 390 | Menu opened; anchor navigation and theme persistence. |
| CMS / Light | 1440, 390 | Management shell, all collection editors, upload and publish/error states. |

Capture both theme states at desktop and mobile. Theme choice is persisted; if there is no stored choice, respect the OS preference.

## Hero and responsive composition

### Desktop

- Header: **76px**, three balanced zones. Left: rounded availability pill with green dot. Center: About / Tech Stack `[skill count]` / Work `[project count]` / Experience / Contact. Right: theme control and dark rounded “Let’s Talk” CTA.
- Stage: full-width canvas; `height: calc(100svh - 76px)`, `min-height: 650px`, capped at 860px. Warm paper background, near-black ink.
- Centered display headline: “FOZAYEL” with transparent fill and dark outline, then the large solid “IBN AYAZ” line. The portrait overlaps the solid line in the foreground.
- Fozayel's own transparent portrait is centered, grayscale by default, and transitions to natural color on hover/focus. On narrow touch devices it remains grayscale (no hover-only action is required to understand the page).
- Lower-left content: full-stack developer + data analyst role, supplied introduction, dark pill “View Projects” action. Lower-right: rounded GitHub, email, phone and location pills. Small centered scroll cue.
- Use the supplied portrait only; no stock or reference-person imagery. The cutout is delivered in responsive WebP variants with a PNG fallback.

### Mobile and tablet

- At 720px and below, use the compact header with status on the left, theme/talk/menu controls on the right, and an expandable nav sheet.
- Retain the same two-line name treatment. Center the portrait beneath/overlapping the title. Put readable copy and project action in a soft paper panel over the lower portrait; keep contact pills in their own right-side stack and the scroll cue centered at the foot.
- At 420px and below, scale the solid name carefully to fit; trim gutters, not readable copy. Clip the portrait within the hero rather than letting it create page overflow.
- Verify the page at exactly **360, 375, 390, 430, 620, 720, 768, 820, 1024, 1280, 1440 and 1920px**. Ensure visible nav actions, no horizontal scrolling, readable panel contrast, and stable anchor navigation.

## Visual tokens

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| Canvas / Paper | `#FDFDFC` | `#141414` | Page/hero background |
| Ink / Primary | `#141414` | `#F3F1EA` | Headline and actions |
| Text / Muted | `#686868` | `#A19F98` | Body and helper copy |
| Border / Hairline | `#E7E7E4` | `#2C2C29` | Pills, dividers and outlines |
| Surface / Soft | `#F3F1EA` | `#1C1C1A` | Supporting sections |
| Accent / Leaf | `#22C55E` | `#36D978` | Availability dot, focus, small emphasis |

### Typography and motion

- **Archivo** display face, heavy for the solid name, outlined first line; tight tracking and compact leading. Scale fluidly from desktop down to 360px.
- **Inter** body and controls, generally 10–15px in the hero, 11–18px in supporting sections.
- **JetBrains Mono** for count annotations and quiet metadata.
- Keep the paper/ink contrast and precise hierarchy. Rounded shapes are limited to status, social and primary-action pills; do not turn the editorial lower page into a generic app dashboard.
- Portrait filter transition is ~700ms; buttons/social links are subtle and short. Respect `prefers-reduced-motion`.

## Additional site components

The portfolio body includes editable About, Projects, Experience, Skills, Education, optional Awards/Services/Testimonials, Contact and Footer sections. Project cards use abstract original covers rather than invented client screenshots. Project detail routes are generated from portfolio data. Experience content must preserve Eagle 3D Streaming as **Data Analyst · Jul 2023 — Aug 2026** (`current: false`). Do not add unsupported metrics, employers or testimonials.

The CMS has collection-level add/edit/delete, reorder, show/hide, upload and publish actions for profile, experience, projects, skills, education, services, testimonials, contact and global settings. Keep editable content separate from display markup/styles.

## Known handoff limits

- This workspace has no Figma account or workspace, so there is no native `.fig` file or Figma URL. Import the SVG board into Figma and create the page library above when a workspace is available.
- The direct reference is reviewed visually side-by-side at its supplied 1568 × 835 composition; no automated pixel-diff claim is made.
- Dark mode is a separate palette, not a simple inversion. Keep the supplied image grayscale at rest and color on hover/focus in both modes.
