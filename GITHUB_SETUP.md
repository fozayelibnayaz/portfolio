# Fix GitHub Pages deployment

The Vite build is passing. The current GitHub Actions failure happens before the build because the repository does not have a GitHub Pages site configured:

```text
Get Pages site failed: 404
Please verify that the repository has Pages enabled and configured to build using GitHub Actions
```

This is a repository setting, not a JavaScript or Vite error. `actions/configure-pages` cannot enable Pages with the normal `GITHUB_TOKEN`.

## Required one-time fix

Sign in as the repository owner and open:

`https://github.com/fozayelibnayaz/portfolio/settings/pages`

Then select:

```text
Build and deployment → Source → GitHub Actions → Save
```

After saving, open **Actions**, select **Deploy portfolio to GitHub Pages**, and choose **Run workflow** on `main`.

If the **Pages** menu is missing, confirm that:

- You are signed in as `fozayelibnayaz` or have repository administrator access.
- The repository is public or your GitHub plan supports Pages for the repository.
- Actions are enabled under **Settings → Actions → General**.

## Optional fully automated enablement

If you cannot enable Pages from the UI, create a repository secret named `PAGES_TOKEN` using a GitHub token with Pages write permission (a classic token with `repo` scope also works for a private repository). Then change the Configure Pages step in `.github/workflows/deploy.yml` to:

```yaml
      - name: Enable GitHub Pages
        id: pages
        uses: actions/configure-pages@v6
        with:
          token: ${{ secrets.PAGES_TOKEN }}
          enablement: true
```

The standard workflow currently uses the safer official configuration step and expects the one-time UI setting.

## Clean replacement push

The previous commit accidentally tracked generated folders. The `.gitignore` now excludes them. From the project folder:

```bash
cd /home/user
npm install
npm run build

git init
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/fozayelibnayaz/portfolio.git
git add .
git commit -m "Fix GitHub Pages configuration"
git branch -M main
git push -u origin main --force
```

The force push is intentional if the old repository tree should be replaced. It removes tracked `node_modules/`, `dist/`, and `uploads/` from the remote because those paths are now ignored.
