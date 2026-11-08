/* =============================================================================
   REPOS — every public repository, grouped for reading.

   The data is a snapshot (`data/repos.json`) taken from the GitHub API, so the
   page needs no token, no rate limit and no network at render time. This module
   is pure: give it the snapshot, get groups and counts back.
   ========================================================================== */

export type Repo = {
  name: string;
  description: string;
  language: string;
  stars: number;
  fork: boolean;
  archived: boolean;
  updated: string;
  url: string;
  home: string;
  topics: string[];
};

export type Snapshot = {
  user: string;
  synced: string;
  count: number;
  repos: Repo[];
};

/** How a repo is presented: what it *is*, in one word. */
export type Kind = 'product' | 'site' | 'experiment';

export type Group = {
  key: Kind;
  label: string;
  blurb: string;
  repos: Repo[];
};

const PRODUCT_LANGS = new Set(['TypeScript', 'JavaScript', 'Python', 'C', 'Java', 'PHP', 'C++']);
const SITE_LANGS = new Set(['HTML', 'CSS']);

/**
 * A repo with a live URL is a product or a site — never an experiment.
 * Everything else is judged by what it is written in and how it is described.
 */
export function kindOf(repo: Repo): Kind {
  const desc = repo.description.toLowerCase();
  if (repo.home) {
    // A hosted thing with a server-side language is a product; a static one is a site.
    return SITE_LANGS.has(repo.language) ? 'site' : 'product';
  }
  if (desc.includes('portfolio') || desc.includes('website')) return 'site';
  if (PRODUCT_LANGS.has(repo.language) && desc.length > 0) return 'product';
  return 'experiment';
}

const LABELS: Record<Kind, { label: string; blurb: string }> = {
  product: { label: 'Products & tools', blurb: 'Hosted apps, dashboards and services.' },
  site: { label: 'Sites', blurb: 'Client builds, landing pages and this repository.' },
  experiment: { label: 'Studies & experiments', blurb: 'Coursework, models and things built to learn one idea.' },
};

const ORDER: Kind[] = ['product', 'site', 'experiment'];

/** Grouped, newest first inside each group, forks pushed to the end. */
export function groupRepos(repos: Repo[]): Group[] {
  const byKind = new Map<Kind, Repo[]>(ORDER.map((k) => [k, []]));

  for (const repo of repos) {
    byKind.get(kindOf(repo))!.push(repo);
  }

  return ORDER.map((key) => ({
    key,
    ...LABELS[key],
    repos: byKind
      .get(key)!
      .slice()
      .sort((a, b) => {
        if (a.fork !== b.fork) return a.fork ? 1 : -1;
        return b.updated.localeCompare(a.updated);
      }),
  })).filter((g) => g.repos.length > 0);
}

/** Distinct languages with counts, most used first. */
export function languageCounts(repos: Repo[]): { language: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const repo of repos) {
    const name = repo.language || 'Other';
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count || a.language.localeCompare(b.language));
}

/** A description worth showing. A bare URL is not a description, and neither is
 *  an empty string — both are better left out than filled with a placeholder. */
export function describe(repo: Repo): string {
  const text = repo.description.trim();
  if (!text || /^https?:\/\//i.test(text)) return '';
  return text;
}

/** "3 weeks ago" — coarse on purpose; an exact date on every row is noise. */
export function ago(iso: string, now: Date = new Date()): string {
  const then = new Date(`${iso}T00:00:00Z`).getTime();
  if (Number.isNaN(then)) return iso;
  const days = Math.floor((now.getTime() - then) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

/** A tiny stable hash so each row can get a deterministic accent colour. */
export function tintFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997;
  return ['mint', 'lilac', 'butter', 'sky', 'blush'][h % 5];
}
