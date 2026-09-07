# Fozayel Ibn Ayaz — Work World

A from-scratch, responsive Three.js portfolio built for GitHub Pages. A procedural seated developer works at a desk behind a large display, while five clear chapter controls open the portfolio story.

It is not a game and does not depend on a remote 3D model, external font, CDN, or runtime API.

## Included

- Procedural seated 3D developer with desk, display, keyboard, chair, headphones, studio lighting, soft shadows, responsive resizing, and reduced-motion support.
- Five chapters: Person, Work, Skills, Path, and Contact.
- Six project case files, skills grouped by purpose, a separate digital-marketing practice box, experience, education, contact actions, GitHub, phone, CV, and direct Gmail compose links.
- Cropped portrait used in the hero badge, identity card, WebGL fallback, and favicon.
- Animated Three.js skill constellation in the Skills chapter.
- Dark/light theme switcher with persisted preference.
- Optional password-protected CMS at `/cms.html`.

## Local development

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Production build

```bash
npm run build
npm run preview
```

The build produces both `index.html` and `cms.html` in `dist/`.

## CMS

Open:

```text
https://fozayelibnayaz.github.io/portfolio/cms.html
```

The initial CMS password is `amarportfolio`. The editor can update identity, projects, skills, digital marketing, experience, education, portrait, CV, and the complete JSON content file. Local drafts are saved in the current browser.

Because GitHub Pages is static, the CMS password is a browser-level editor lock rather than server authentication. To publish publicly, use the optional GitHub publisher in **Settings** with a fine-grained GitHub token that has **Contents: Read and write** access to this repository. The token is not saved by the CMS. Alternatively, download the JSON/CV files and commit them normally.

## GitHub Pages

1. Push this project to GitHub on the `main` branch.
2. Open **Settings → Pages** and choose **GitHub Actions**.
3. Push to `main` or manually run **Deploy portfolio to GitHub Pages**.
4. Visit `https://fozayelibnayaz.github.io/portfolio/`.

The workflow builds `dist/` before deployment. Do not publish the raw source entry directly; Vite must transform the module and stylesheet links.
