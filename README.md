# Fozayel Ibn Ayaz — Come In

A from-scratch portfolio built around one simple invitation: arrive, knock, and come in. The public site opens with an interactive Three.js double door. The visitor starts three deliberate knocks, the door opens, and the site reveals a calm story about Fozayel's experience, projects, skills, and contact details.

The public entry point is `index.html`. The story is intentionally clear for a non-technical visitor:

1. Introduction — who Fozayel is and what he makes.
2. Experience — roles, responsibilities, and education.
3. What I Bring — practical capabilities and digital marketing.
4. Projects — six project stories with contribution, approach, stack, and why each one matters.
5. Contact — direct ways to start a conversation.

## Included

- A meaningful Three.js threshold scene with a double door, frame, room light, knock feedback, opening animation, cinematic camera walk-through, and a three-frame arrival film before the portfolio appears.
- The arrival film moves through Experience, Making, and Projects with animated typography, progress cues, a skip control, reduced-motion support, and a CSS fallback when WebGL is unavailable.
- An arrival gate that can be entered by clicking the door or button, pressing Enter, or pressing Space.
- A linear story with dedicated Experience and Projects sections instead of mixing project work into an experience timeline.
- Six project stories with readable summaries, contribution, approach, stack, and why each build matters.
- Identity, role, location, portrait, CV, phone, GitHub, Gmail, experience, education, and digital-marketing content.
- Four skills groups plus exactly five digital-marketing practice items.
- Light and dark themes, responsive layouts, accessible buttons and links, keyboard section shortcuts (`1`–`5`), and project detail dialogs.
- A password-protected admin CMS at `/cms.html`. The legacy `/cms/` path remains available as a compatibility route. Neither route is linked from the public portfolio, and both CMS pages are marked `noindex,nofollow`.

## Local development

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal. The dev server is configured for a network-accessible live preview:

```bash
npm run dev -- --host 0.0.0.0
```

## Production build

```bash
npm run build
npm run preview -- --host 0.0.0.0
```

## Admin CMS

Open the primary admin path:

```text
http://localhost:4174/cms.html
```

The compatibility route is also available:

```text
http://localhost:4174/cms/
```

or, after deployment:

```text
https://fozayelibnayaz.github.io/portfolio/cms.html
```

The initial password is `amarportfolio`. The CMS edits identity, projects, skills, digital marketing, experience, education, portrait, CV, and the complete content JSON. Local drafts are saved in the current browser.

GitHub Pages is static, so the password gate is a browser-level editor lock rather than server authentication. To publish a draft publicly from the CMS, use a fine-grained GitHub token with **Contents: Read and write** access to `fozayelibnayaz/portfolio`. The CMS keeps that token in memory only. You can also download the JSON and commit it manually.

## Deploy to GitHub Pages

The repository includes `deploy.sh`. It installs dependencies, builds the production site, stages the source, creates a commit, and pushes to the `main` branch without a force push. It also works when this folder was downloaded without `.git`: the script creates a temporary clone, copies the current workspace into it, and pushes the update.

```bash
chmod +x deploy.sh
./deploy.sh
```

The script assumes the repository remote is:

```text
https://github.com/fozayelibnayaz/portfolio.git
```

After the push, GitHub Actions should rebuild the site. The public portfolio will be available at:

```text
https://fozayelibnayaz.github.io/portfolio/
```

The CMS will be available at:

```text
https://fozayelibnayaz.github.io/portfolio/cms.html
```

Generated `dist/` files are intentionally ignored by Git. Do not put a GitHub token in the script or commit it to the repository.
