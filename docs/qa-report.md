# QA report — reference-match redesign

**Run date:** 2026-09-27 (Asia/Dhaka) · **Environment:** production build (`npm run build` → `npm run start`), Node 20.20.2, Next.js 16.3.6. Manual visual comparison used the user's local 1568 × 835 reference screenshot at `/home/user/uploads/image-1.png`.

## Verified

- **Build, types and dependencies:** `npm run typecheck`, the normal server-mode `npm run build`, and `npm run build:github-pages` pass. `npm audit --omit=dev --audit-level=moderate` reported 0 production dependency vulnerabilities.
- **Reference composition:** visually checked at 1568 × 835. The hero follows the supplied layout: status/navigation/CTA row; centered outlined “FOZAYEL” and solid “IBN AYAZ” lines; overlapping portrait; role, intro and project CTA at left; rounded contact/social pills at right; centered scroll cue. Uses Fozayel's name and supplied portrait, not the reference subject's identity or content.
- **Portrait:** recreated a clean transparent 1254 × 1254 cutout from the supplied full-resolution photo; refined segmentation removes the chair/background without the prior jagged side edge. Delivered 520/760/1024px responsive WebP variants, 1254px WebP and PNG fallback. Browser test confirmed grayscale at rest and natural-color CSS filter on hover. Source switches to a user-edited CMS image when one is set.
- **Responsive:** headless Chromium checked **360, 375, 390, 430, 620, 720, 768, 820, 1024, 1280, 1440 and 1920px**. Document/body scroll widths matched the viewport at every width; no horizontal overflow.
- **Interactions:** responsive nav opened and closed via link; dark theme toggled and survived reload; portrait hover computed `grayscale(1)` → `grayscale(0)`; no browser page errors or console errors.
- **Node-server routes/assets:** `/`, `/admin`, `/projects/ai-youtube-command-center`, `/projects/eagle-3d-analytics-bi-hub`, `/api/content`, `/robots.txt`, `/sitemap.xml`, and the supplied CV returned HTTP 200 in the production server build.
- **GitHub Pages export and repo auto-sync (2026-09-28):** `npm run build:github-pages` fetched the current public GitHub repository list, including forks, excluded the portfolio repo itself, matched 3 repositories to existing case studies, and generated 42 new cards (48 projects total). Next.js prerendered all 48 project detail routes; generated sitemap has 49 URLs including the homepage. README sections render on detail pages, two suitable README images were localized, and all generated local asset paths use the `/portfolio/` prefix. The project gallery now classifies all entries into three detected types, displays nine cards per 3×3 page with type filters and page controls, and includes swipe/arrow-key handlers. A local static-host smoke test returned HTTP 200 for the homepage, admin guidance, all project pages, SEO files, fonts, and 67 local HTML references/assets; the CMS API correctly returned 404. The build-stage sync left checked-in `content/portfolio.json` unchanged. Private-repository opt-in is intentionally skipped without a read token and has not been tested against a private repository.
- **Content integrity:** Eagle 3D Streaming is Data Analyst, Jul 2023 — Aug 2026, `current: false`.
- **SEO/accessibility:** Lighthouse 12.6.1 on the local production server reported desktop **99/100/100/100** and mobile **85/100/100/100** for performance/accessibility/best-practices/SEO. Desktop FCP/LCP/TBT/CLS: 0.3s / 0.8s / 0ms / 0. Mobile: 1.1s / 4.1s / 160ms / 0. Scores are one throttled local lab run, not a real-user guarantee; retest on the deployed HTTPS domain and devices.
- **CMS storage adapter:** set `PORTFOLIO_DATA_DIR` to a durable mounted volume; the app seeds `portfolio.json` on first request and stores/serves image/PDF uploads from its `uploads` folder. A local mounted-volume simulation verified seed, authenticated content write/read, upload, and retrieval from the volume-backed route. Full host setup is in the root README.

## Accessibility coverage

Semantic landmarks/headings, skip link, portrait alt text, explicit form labels, visible keyboard focus, reduced-motion rules, descriptive menu/theme controls, mobile `aria-expanded`, Lighthouse accessibility, and light/dark contrast were checked. A full manual screen-reader session and broad assistive-technology matrix were not performed.

## Known limitations / release checklist

1. The selected GitHub Pages deployment is static: it has no CMS login, server API, or upload endpoint. Update public content in `content/portfolio.json` and push to redeploy. The separate Node-mode CMS is file-backed and intended for a single Node instance with a mounted persistent volume; ephemeral/read-only serverless filesystems will not persist edits/uploads. For multiple app replicas, move content and uploads to shared database/object storage.
2. The contact form defaults to a prepared `mailto:` handoff. A remote endpoint can be configured in CMS but must handle CORS and anti-spam controls.
3. The `.fig` file cannot be generated without Figma workspace/account access. `docs/portfolio-design-board.svg` is importable; `docs/figma-handoff.md` specifies pages, frames, responsive rules and component states.
4. Reference validation was a manual visual comparison. No automated pixel-diff test against the screenshot was run.
5. `CMS_PASSWORD` is only for the separate Node-mode CMS; never commit it or include it in the GitHub Pages build. The public static Pages site has no CMS password. No password is required for the chosen deployment.
