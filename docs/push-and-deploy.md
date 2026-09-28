# Push the portfolio from macOS and publish on GitHub Pages

This guide deploys the **free static version** to the existing repository, `https://github.com/fozayelibnayaz/portfolio`. GitHub Pages cannot run the Next.js server, password-protected CMS, upload API, or server-side password settings. GitHub Actions automatically discovers public GitHub repositories, including forks, and rebuilds the project list hourly. Private repos require an explicit, concept-only publication file and an Actions secret; details are in [`project-auto-sync.md`](project-auto-sync.md). No CMS password is included in the public project.

## 1. Download and unzip on your Mac

Download `fozayel-portfolio-dynamic.zip`. Your browser normally saves it in **Downloads** (unless you changed the browser's download setting). In Finder, open Downloads and double-click the ZIP. It should create a folder named `fozayel-portfolio-dynamic`.

## 2. Clone the existing repository

Open Terminal and run:

```bash
cd ~/Desktop
git clone https://github.com/fozayelibnayaz/portfolio.git portfolio-live
```

This clone preserves the repository's existing Git history. Do not run `git init` in the extracted project, and do not copy the project over the clone's hidden `.git` folder.

## 3. Copy the new project files into the clone

The following command assumes the unzipped folder is `~/Downloads/fozayel-portfolio/`:

```bash
rsync -a --delete \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='.github-pages-build/' \
  --exclude='out/' \
  --exclude='.env' \
  --exclude='.DS_Store' \
  ~/Downloads/fozayel-portfolio-dynamic/ \
  ~/Desktop/portfolio-live/
```

If Finder unzipped it somewhere else, change only the first (source) path. `--delete` makes the clone's working files match the new project, including its GitHub Pages workflow; excluding `.git/` preserves the cloned history. Back up any uncommitted or repository-only files you need first.

## 4. Review and push

```bash
cd ~/Desktop/portfolio-live
git remote -v
git status --short
git branch --show-current
```

Confirm the remote is `https://github.com/fozayelibnayaz/portfolio.git`, review the file changes, then commit and push the branch you cloned:

```bash
git add -A
git commit -m "Prepare portfolio for GitHub Pages"
git push -u origin HEAD
```

If GitHub asks you to authenticate, use its browser sign-in or GitHub CLI (`gh auth login`). Never paste a personal access token into chat or commit one to the repository.

## 5. Turn on Pages deployment

1. Open the repository on GitHub and select **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Open **Actions → Deploy portfolio to GitHub Pages**. If the first automatic run did not start, choose **Run workflow** on the repository's default branch.
4. Wait for the workflow to finish successfully. It runs `npm ci`, creates the `/portfolio` static export, and deploys it with GitHub Pages.
5. Visit **https://fozayelibnayaz.github.io/portfolio/**.

The workflow is in `.github/workflows/deploy-pages.yml`; it runs on pushes to `main` or `master`, manual dispatch, and hourly on a schedule. If your repository's default branch has a different name, edit the workflow's `branches` list to include that branch, then push the change. The repository must have GitHub Pages available; the existing public Pages site is already at the intended address.

## 6. Update the live portfolio later

For projects, keep each public GitHub repository's description and README current; the portfolio workflow detects new repositories and refreshes their cards/detail pages hourly without editing `content/portfolio.json`. To add a private concept, use the explicit safe-summary opt-in described in [`project-auto-sync.md`](project-auto-sync.md). For profile, skills, experience, and non-repository content, edit `content/portfolio.json`, then commit and push as usual.

GitHub Pages does **not** host the CMS sign-in, changeable CMS password, CRUD API, or uploaded-media API. The originally supplied passphrase is not put in the public files. The portrait and site files are already included; don't replace the transparent cutout with a background image unless you intend to change the design.

## Optional local verification

On a Mac with Node.js 20.9 or newer:

```bash
cd ~/Desktop/portfolio-live
npm ci
npm run typecheck
npm run build:github-pages
```

The static site appears in `out/`; this output is generated locally and is not required in the Git commit. The GitHub Actions workflow builds it automatically. For a local preview, run `npm run dev` and visit `http://localhost:3000`; the normal local app includes the CMS, but that CMS is not part of GitHub Pages.
