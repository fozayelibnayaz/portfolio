# Automatic GitHub project sync

The GitHub Pages build reads the repositories owned by `fozayelibnayaz` and merges them with the existing hand-written case studies **during the GitHub Actions build**. It does not need project additions to be committed to the portfolio's `content/portfolio.json`.

## What updates automatically

- The workflow runs on pushes to the portfolio repository, manual dispatch, and **hourly** on GitHub Actions' schedule. A newly created repository normally appears after the next successful scheduled run (typically within about an hour; GitHub can delay scheduled jobs).
- It includes all public repositories owned by the account, **including forks and archived repositories**, except the portfolio repository itself so the site does not list itself.
- Public repo cards/details use the GitHub description, README text and sections, repository topics, primary language, homepage, creation year, source link, and the first suitable README image when one can be safely downloaded. Existing hand-written projects remain; a repository with a matching name or source URL is merged into its existing case study instead of being duplicated.
- README text is rendered as escaped text/paragraphs/lists, not executable HTML. Project names, descriptions, stack/topics, bullets, and screenshots can only be as complete and accurate as their GitHub repository metadata and README. Keep those updated in each project repository. The sync does not invent missing results or claims.
- Public repositories are read without a token. GitHub Pages itself remains static; each scheduled Action rebuilds and deploys the static project and detail pages.

## Private repositories: explicit, safe concept-only opt-in

The public site cannot safely expose a private repository's ordinary name, URL, README, code, stack, or screenshots. A private project is skipped unless you deliberately add a root-level file named `PORTFOLIO_PUBLIC.md`. The sync publishes **only** its first Markdown heading as the public title and its first non-heading paragraph as the one-sentence concept. It does not publish the private repo name/link, the rest of the README, topics, code, or technologies. Anything you put in that title and paragraph will be visible to anyone visiting the portfolio, so review it for confidentiality/NDA restrictions before opting in.

Template for a private repository's root-level `PORTFOLIO_PUBLIC.md`:

```md
# A public-safe title for this project

A short, high-level sentence describing the general problem or idea without client names, private data, implementation specifics, credentials, or confidential results.
```

The file is an intentional per-private-repo publication approval. It keeps portfolio JSON maintenance automatic, while giving you a clear privacy gate.

### Enable private concept sync (optional)

To let Actions discover private repositories and read only their opt-in file, create a **fine-grained, read-only** GitHub token yourself; do not share it with anyone or put it in a file/commit. Grant repository **Metadata: read-only** and **Contents: read-only** access for the repos you want the automation to inspect (all repositories if desired). Then add it to the portfolio repo at **Settings → Secrets and variables → Actions → New repository secret**:

- Name: `PORTFOLIO_REPO_READ_TOKEN`
- Secret value: your token

The workflow passes that secret only to the sync script. The build removes it from the environment before running Next.js, and no token is written to the site or generated JSON. Without this secret, all public repos still sync normally and all private repos are skipped. You never need to send the token in chat.

## Important boundaries

- A new **public** repo is automatic; a private repo needs the opt-in summary file and (for account-wide private discovery) the Actions secret.
- This is scheduled, not instantaneous. Create/update the repo or README and wait for the next hourly deployment; use **Actions → Deploy portfolio to GitHub Pages → Run workflow** to refresh sooner.
- New or changed private concepts will be made public only after the opt-in file is added. Do not opt in work you are not allowed to describe publicly.
- Manually curated non-repository case studies and all unrelated portfolio content remain in `content/portfolio.json`.
