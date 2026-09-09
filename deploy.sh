#!/usr/bin/env bash
set -euo pipefail

# Safe GitHub Pages deploy for the Fozayel portfolio.
# It never force-pushes. It works both inside a Git clone and from a
# downloaded workspace folder that does not contain .git yet.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REMOTE_URL="${REMOTE_URL:-https://github.com/fozayelibnayaz/portfolio.git}"
BRANCH="${BRANCH:-main}"
COMMIT_MESSAGE="${COMMIT_MESSAGE:-Update portfolio: frontend app build overlay and CMS theme}"
TEMP_DIR=""

cleanup() {
  if [[ -n "$TEMP_DIR" && -d "$TEMP_DIR" ]]; then
    rm -rf "$TEMP_DIR"
  fi
}
trap cleanup EXIT

command -v npm >/dev/null 2>&1 || { echo "npm is required." >&2; exit 1; }
command -v git >/dev/null 2>&1 || { echo "git is required." >&2; exit 1; }

cd "$ROOT_DIR"

if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi
npm run build

DEPLOY_DIR="$ROOT_DIR"

if [[ ! -d "$ROOT_DIR/.git" ]]; then
  echo "No .git folder found. Preparing a temporary clone of $REMOTE_URL …"
  TEMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/fozayel-portfolio.XXXXXX")"
  DEPLOY_DIR="$TEMP_DIR/repo"
  git clone --branch "$BRANCH" "$REMOTE_URL" "$DEPLOY_DIR"

  # Copy the current workspace into the clone while preserving the clone's
  # Git history and leaving generated dependencies/build output out of Git.
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete \
      --exclude '.git/' \
      --exclude 'node_modules/' \
      --exclude 'dist/' \
      --exclude '.cache/' \
      --exclude '.npm/' \
      --exclude '.arena/' \
      --exclude 'uploads/' \
      "$ROOT_DIR/" "$DEPLOY_DIR/"
  elif command -v python3 >/dev/null 2>&1; then
    python3 - "$ROOT_DIR" "$DEPLOY_DIR" <<'PY'
import shutil
import sys
from pathlib import Path

source = Path(sys.argv[1])
destination = Path(sys.argv[2])
ignored = {'.git', 'node_modules', 'dist', '.cache', '.npm', '.arena', 'uploads'}

for current, directories, files in __import__('os').walk(source):
    current_path = Path(current)
    relative = current_path.relative_to(source)
    directories[:] = [name for name in directories if name not in ignored]
    target = destination / relative
    target.mkdir(parents=True, exist_ok=True)
    for filename in files:
        source_file = current_path / filename
        target_file = target / filename
        if filename in ignored:
            continue
        shutil.copy2(source_file, target_file)
PY
  else
    echo "A Git clone is required when neither rsync nor python3 is available." >&2
    exit 1
  fi
fi

cd "$DEPLOY_DIR"

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

# Remove generated folders if an older repository revision tracked them.
git rm -r --cached --ignore-unmatch dist node_modules uploads .cache .npm .arena >/dev/null 2>&1 || true
git add -A

if git diff --cached --quiet; then
  echo "No file changes to commit."
else
  git commit -m "$COMMIT_MESSAGE"
fi

git branch -M "$BRANCH"
git push -u origin "$BRANCH"

echo "Deployed to $REMOTE_URL on branch $BRANCH."
echo "Portfolio: https://fozayelibnayaz.github.io/portfolio/"
echo "CMS:       https://fozayelibnayaz.github.io/portfolio/cms.html"
