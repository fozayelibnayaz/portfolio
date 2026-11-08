#!/usr/bin/env node
/* =============================================================================
   sync-repos.mjs — refresh the repository snapshot the site renders.

   GitHub is called once, at build time, and the answer is written to
   src/data/repos.json. The page then needs no token, no rate limit and no
   network at render time.

     node scripts/sync-repos.mjs

   Unauthenticated requests are limited to 60/hour per IP. If you hit that,
   set GITHUB_TOKEN and it will be sent as a bearer token (5,000/hour).
   ========================================================================== */

import { writeFileSync } from 'node:fs';

const USER = 'fozayelibnayaz';
const OUT = 'src/data/repos.json';

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'portfolio-sync',
  'X-GitHub-Api-Version': '2022-11-28',
};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const all = [];
for (let page = 1; page <= 10; page++) {
  const res = await fetch(
    `https://api.github.com/users/${USER}/repos?per_page=100&page=${page}&sort=pushed`,
    { headers },
  );

  if (!res.ok) {
    console.error(`GitHub said ${res.status}: ${(await res.json()).message ?? 'no message'}`);
    process.exit(1);
  }

  const batch = await res.json();
  all.push(...batch);
  if (batch.length < 100) break;
}

const repos = all
  .map((r) => ({
    name: r.name,
    description: (r.description ?? '').trim(),
    language: r.language ?? '',
    stars: r.stargazers_count ?? 0,
    fork: Boolean(r.fork),
    archived: Boolean(r.archived),
    updated: (r.pushed_at ?? r.updated_at ?? '').slice(0, 10),
    url: r.html_url,
    home: (r.homepage ?? '').trim(),
    topics: r.topics ?? [],
  }))
  .sort((a, b) => b.updated.localeCompare(a.updated));

const doc = {
  user: USER,
  synced: new Date().toISOString().slice(0, 10),
  count: repos.length,
  repos,
};

writeFileSync(OUT, `${JSON.stringify(doc, null, 1)}\n`);

const hosted = repos.filter((r) => r.home).length;
console.log(`${OUT}: ${repos.length} repos, ${hosted} with a live site, synced ${doc.synced}`);
