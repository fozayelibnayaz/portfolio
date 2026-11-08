import { describe, expect, it } from 'vitest';
import { ago, describe as describeRepo, groupRepos, kindOf, languageCounts, tintFor, type Repo } from '../../src/lib/repos';
import snapshot from '../../src/data/repos.json';

const repo = (over: Partial<Repo> = {}): Repo => ({
  name: 'thing',
  description: '',
  language: 'TypeScript',
  stars: 0,
  fork: false,
  archived: false,
  updated: '2026-01-01',
  url: 'https://github.com/fozayelibnayaz/thing',
  home: '',
  topics: [],
  ...over,
});

describe('kindOf', () => {
  it('calls a hosted, server-side project a product', () => {
    expect(kindOf(repo({ home: 'https://x.dev', language: 'TypeScript' }))).toBe('product');
  });

  it('calls a hosted static page a site', () => {
    expect(kindOf(repo({ home: 'https://x.dev', language: 'HTML' }))).toBe('site');
    expect(kindOf(repo({ home: 'https://x.dev', language: 'CSS' }))).toBe('site');
  });

  it('calls an unhosted, described code repo a product', () => {
    expect(kindOf(repo({ language: 'Python', description: 'A CLI for invoices' }))).toBe('product');
  });

  it('calls a described portfolio a site even without a homepage', () => {
    expect(kindOf(repo({ language: 'HTML', description: 'my personal portfolio' }))).toBe('site');
  });

  it('calls coursework and undocumented repos experiments', () => {
    expect(kindOf(repo({ language: 'Python', description: '' }))).toBe('experiment');
    expect(kindOf(repo({ language: '', description: '' }))).toBe('experiment');
  });
});

describe('groupRepos', () => {
  it('returns groups in a fixed order and drops the empty ones', () => {
    const groups = groupRepos([
      // an undocumented, unhosted repo is an experiment, not a product
      repo({ name: 'b', language: 'Python' }),
      repo({ name: 'a', home: 'https://a.dev', language: 'TypeScript' }),
    ]);
    expect(groups.map((g) => g.key)).toEqual(['product', 'experiment']);
    expect(groups.map((g) => g.repos.length)).toEqual([1, 1]);
  });

  it('sorts newest first inside a group, forks last', () => {
    const groups = groupRepos([
      repo({ name: 'old', updated: '2024-01-01' }),
      repo({ name: 'new', updated: '2026-01-01' }),
      repo({ name: 'forked', updated: '2026-06-01', fork: true }),
    ]);
    expect(groups[0].repos.map((r) => r.name)).toEqual(['new', 'old', 'forked']);
  });

  it('never loses a repo', () => {
    const all = (snapshot as { repos: Repo[] }).repos;
    const counted = groupRepos(all).reduce((n, g) => n + g.repos.length, 0);
    expect(counted).toBe(all.length);
    expect(counted).toBe(50);
  });

  it('routes every hosted repo into product or site, never experiment', () => {
    const all = (snapshot as { repos: Repo[] }).repos;
    for (const r of all) {
      if (r.home) expect(kindOf(r), r.name).not.toBe('experiment');
    }
  });
});

describe('describe', () => {
  it('passes a real description through', () => {
    expect(describeRepo(repo({ description: 'A store for ceramics' }))).toBe('A store for ceramics');
  });

  it('treats a bare URL as no description', () => {
    expect(describeRepo(repo({ description: 'https://eagle-products-backend.vercel.app' }))).toBe('');
  });

  it('treats whitespace as no description', () => {
    expect(describeRepo(repo({ description: '   ' }))).toBe('');
  });
});

describe('languageCounts', () => {
  it('counts, sorts by frequency and folds empty languages into Other', () => {
    const counts = languageCounts([
      repo({ language: 'TypeScript' }),
      repo({ language: 'TypeScript' }),
      repo({ language: 'HTML' }),
      repo({ language: '' }),
    ]);
    expect(counts).toEqual([
      { language: 'TypeScript', count: 2 },
      { language: 'HTML', count: 1 },
      { language: 'Other', count: 1 },
    ]);
  });

  it('matches the snapshot totals', () => {
    const total = languageCounts((snapshot as { repos: Repo[] }).repos).reduce((n, l) => n + l.count, 0);
    expect(total).toBe(50);
  });
});

describe('ago', () => {
  const now = new Date('2026-03-01T00:00:00Z');
  it('says today and yesterday for recent pushes', () => {
    expect(ago('2026-03-01', now)).toBe('today');
    expect(ago('2026-02-28', now)).toBe('yesterday');
  });
  it('uses days, months and years', () => {
    expect(ago('2026-02-20', now)).toBe('9d ago');
    expect(ago('2025-12-01', now)).toBe('3mo ago');
    expect(ago('2024-01-01', now)).toBe('2y ago');
  });
  it('does not crash on junk', () => {
    expect(ago('not-a-date', now)).toBe('not-a-date');
  });
});

describe('tintFor', () => {
  it('is deterministic and always one of the five accents', () => {
    const allowed = ['mint', 'lilac', 'butter', 'sky', 'blush'];
    for (const name of ['portfolio', 'Bazar-Dor', 'ZENJI-Anime-Streetwear']) {
      expect(tintFor(name)).toBe(tintFor(name));
      expect(allowed).toContain(tintFor(name));
    }
  });
});
