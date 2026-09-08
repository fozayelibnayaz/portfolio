# GitHub Pages deployment

The portfolio uses a Vite production build and the repository workflow at `.github/workflows/deploy.yml`.

## One-time GitHub Pages setup

Sign in as the repository owner and open:

`https://github.com/fozayelibnayaz/portfolio/settings/pages`

Select:

```text
Build and deployment → Source → GitHub Actions → Save
```

After saving, open **Actions**, select **Deploy portfolio to GitHub Pages**, and run the workflow on `main` if it does not start automatically.

If the **Pages** menu is missing, confirm that:

- You are signed in as `fozayelibnayaz` or have repository administrator access.
- The repository is public or your GitHub plan supports Pages for the repository.
- Actions are enabled under **Settings → Actions → General**.

## Safe local deploy

Use the included script from the repository root. It also works from a downloaded workspace without a `.git` folder by preparing a temporary clone before pushing:

```bash
chmod +x deploy.sh
./deploy.sh
```

The script:

1. Installs dependencies with `npm ci` when a lockfile is present.
2. Runs the production build.
3. Stages the source files while respecting `.gitignore`.
4. Creates a commit when there are changes.
5. Pushes to `main` without force-pushing.

If Git has not been configured on the computer yet, set the commit identity once:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

The script assumes this remote:

```text
https://github.com/fozayelibnayaz/portfolio.git
```

You can override it without editing the script:

```bash
REMOTE_URL="https://github.com/fozayelibnayaz/portfolio.git" COMMIT_MESSAGE="Update portfolio" ./deploy.sh
```

GitHub may prompt for authentication. Use a GitHub credential manager or a personal access token with the required repository permission; never commit a token to the project.

## Published URLs

```text
Portfolio: https://fozayelibnayaz.github.io/portfolio/
CMS:       https://fozayelibnayaz.github.io/portfolio/cms.html
```

The CMS password gate is browser-level protection because GitHub Pages is static. The CMS is not linked from the public site and is marked `noindex,nofollow`.
