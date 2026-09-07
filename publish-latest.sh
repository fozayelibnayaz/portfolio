#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
npm install
npm run build

git init
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/fozayelibnayaz/portfolio.git
git rm -r --cached --ignore-unmatch node_modules dist uploads .sudo_as_admin_successful >/dev/null 2>&1 || true
git add .
git commit -m "Publish Work World portfolio"
git branch -M main
git push -u origin main --force

echo "Published. Wait for GitHub Actions, then open https://fozayelibnayaz.github.io/portfolio/"
