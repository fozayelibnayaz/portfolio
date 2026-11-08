# Deploying this site

## How it actually works

`fozayelibnayaz/portfolio` is a **source repository with a GitHub Actions
workflow**. It does not hold built files. On every push to `main`,
`.github/workflows/deploy.yml` runs:

```
actions/checkout → setup-node 22 → npm ci → BASE_PATH=/portfolio npm run build
                 → upload dist → deploy-pages
```

So the thing you push is the **source**, and GitHub builds and publishes it.

Live URL: <https://fozayelibnayaz.github.io/portfolio/>

## Why `BASE_PATH` matters

The site is served from a `/portfolio/` subpath, so every asset URL has to be
prefixed. `astro.config.mjs` reads `process.env.BASE_PATH` and falls back to
`/`. The workflow sets it to `/portfolio`. Building without it produces a page
whose CSS, images and hero background all 404 — it looks unstyled.

## Deploying a change

```bash
cd ~ && rm -rf portfolio-push \
  && git clone https://github.com/fozayelibnayaz/portfolio.git portfolio-push \
  && cd portfolio-push \
  && find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} + \
  && unzip -oq ~/portfolio-source.zip -d . \
  && git add -A \
  && git commit -m "describe the change" \
  && git push origin main
```

The `find … rm -rf` clears the previous tree (everything except `.git`) so files
you deleted locally do not linger. `portfolio-source.zip` contains the whole
source including `.github/`, so the workflow survives the wipe.

Watch the run at
<https://github.com/fozayelibnayaz/portfolio/actions>. It takes about a minute.
Hard-refresh afterwards (Ctrl/Cmd + Shift + R) — GitHub Pages serves HTML with a
short cache and an old copy can sit in front of the new one.

## What NOT to do

- **Do not push a zip of `dist/`.** That replaces the source with build output,
  deletes the workflow and `package.json`, and the site stops rebuilding. It
  also cannot be re-derived later.
- **Do not commit `dist/` or `node_modules/`.** Both are in `.gitignore`; CI
  builds from source.

## Checks before pushing

```bash
npm ci
npm run verify        # astro check → build → token check → unit tests
npm run test:e2e      # Playwright, needs: npx playwright install chromium
npm run sync:repos    # refresh the repo snapshot from the GitHub API
```

`npm run verify` includes `scripts/check-tokens.mjs`. That script fails the
build if the CSS references a custom property it never defines — a bug class
that throws nothing, warns nothing, and silently renders as `border-radius: 0`
or a transparent panel.
