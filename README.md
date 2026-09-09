# Fozayel Ibn Ayaz — Build Room

A story-based portfolio built around an arrival sequence. The visitor knocks on the doorway, the doors open, and the site becomes a small live build room: five stage controls turn the portfolio on one section at a time before the completed work appears.

The unified **Build Room** direction uses a high-contrast black, white, and graphite system across the public portfolio and CMS. After the knock, the build monitor stays beside the site while navigation and scrolling advance each corresponding stage:

1. Opening — start with the person.
2. Experience — follow the thread.
3. What I Bring — make it useful.
4. Projects — see what moved.
5. Contact — leave with a next step and complete the build.

## Included

- A Three.js double-door threshold with three knocks, black-and-white room lighting, corridor markers, path lights, camera walk-through, and reduced-motion support.
- A rotary dial-up navigation dock that remains beside the portfolio after the walk: HOME, EXPERIENCE, WHAT I BRING, PROJECTS, and CONTACT each rotate the numbered dial to the corresponding chapter.
- A compact frontend-app window inside the dial dock: a Figma-like wireframe appears first, then the design takes shape, the interface is developed, real content is implemented, and the complete app output finishes the sequence. It shows the interface itself rather than code or backend details.
- Clicks, scrolls, touch swipes, dial buttons, and keyboard navigation remain available. A skip/minimize control and reduced-motion path remain available.
- A portfolio flow covering introduction, experience, capabilities, projects, and contact.
- Six project stories with readable summaries, contribution, approach, stack, and why each build matters.
- Identity, role, location, portrait, CV, phone, GitHub, Gmail, experience, education, and digital-marketing content.
- Four skills groups plus exactly five digital-marketing practice items.
- Black-and-white visual styling, responsive layouts, accessible controls, keyboard stage/section shortcuts (`1`–`5`), and project detail dialogs.
- Password-protected admin CMS at `/cms.html`. The legacy `/cms/` path remains available. Neither route is linked from the public portfolio, and both are marked `noindex,nofollow`.

## Local development

```bash
npm install
npm run dev
```

For a network-accessible preview:

```bash
npm run dev -- --host 0.0.0.0
```

## Production build

```bash
npm run build
npm run preview -- --host 0.0.0.0
```

## Admin CMS

Primary admin URL:

```text
http://localhost:4174/cms.html
```

Compatibility URL:

```text
http://localhost:4174/cms/
```

The CMS edits identity, projects, skills, digital marketing, experience, education, portrait, CV, and complete content JSON. Local drafts are saved in the current browser. Open portfolio tabs receive content, portrait, and CV changes through the browser’s live sync channel; a newly selected CV updates the portfolio’s CV link without a page refresh.

GitHub Pages is static, so the editor lock is browser-level protection rather than server authentication. The CMS keeps GitHub tokens in memory only.

## Deploy to GitHub Pages

The included `deploy.sh` works both inside a Git clone and from a downloaded workspace without `.git`. When `.git` is missing, it creates a temporary clone of the target repository, copies the current workspace into it, builds, commits, and pushes without force-pushing.

Run:

```bash
chmod +x deploy.sh && ./deploy.sh
```

Target repository:

```text
https://github.com/fozayelibnayaz/portfolio.git
```

Published URLs:

```text
https://fozayelibnayaz.github.io/portfolio/
https://fozayelibnayaz.github.io/portfolio/cms.html
```

If Git needs an identity on the computer, configure it once with `git config --global user.name` and `git config --global user.email`. GitHub authentication may require a credential manager or personal access token. Never commit a token to the project.
