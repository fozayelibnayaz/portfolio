import { describe, expect, it } from 'vitest';
import {
  buildIndex,
  highlight,
  liveSuggestions,
  search,
  summarise,
  tokenize,
  type Doc,
} from '../../src/lib/ask';
import { buildCorpus } from '../../src/lib/corpus';

/* =============================================================================
   The ⌘K engine. Everything the palette shows comes out of these functions,
   so this is where the behaviour is pinned down: ranking order, the AND→OR
   fallback, diacritics, and the rule that the same query always returns the
   same order.
   ========================================================================== */

const docs: Doc[] = [
  {
    id: 'project:blondeau',
    kind: 'project',
    title: 'Déménagement Blondeau',
    text: 'wordpress local seo french moving company paris',
    tags: ['WordPress', 'Local SEO'],
    meta: 'Website · France',
  },
  {
    id: 'project:eagle',
    kind: 'project',
    title: 'Eagle Analytics System',
    text: 'python streamlit analytics hub for a 3d streaming platform',
    tags: ['Python', 'Streamlit'],
    meta: 'Dashboard · 2024',
  },
  {
    id: 'project:zenji',
    kind: 'project',
    title: 'ZENJI Anime Streetwear',
    text: 'react store motion design japanese streetwear',
    tags: ['React', 'Store'],
    meta: 'Store · 2025',
  },
  {
    id: 'skill:python',
    kind: 'skill',
    title: 'Python',
    text: 'Languages data',
    meta: 'Languages',
  },
  {
    id: 'section:vitals',
    kind: 'section',
    title: 'Vitals',
    text: 'performance metrics speed accessibility',
    href: '#vitals',
  },
];

const index = buildIndex(docs);

describe('tokenize', () => {
  it('lowercases and splits on punctuation', () => {
    expect(tokenize('WordPress, Python')).toEqual(['wordpress', 'python']);
  });

  it('strips diacritics so "demenagement" finds "Déménagement"', () => {
    expect(tokenize('Déménagement')).toEqual(['demenagement']);
  });

  it('keeps technology punctuation and also emits the parts', () => {
    expect(tokenize('Next.js')).toEqual(['next.js', 'next', 'js']);
  });

  it('keeps c++ and c# intact', () => {
    expect(tokenize('c++ and c#')).toEqual(['c++', 'c#']);
  });

  it('drops stop words but keeps the query if it is nothing but stop words', () => {
    expect(tokenize('what is the work')).toEqual(['work']);
    expect(tokenize('the of and')).toEqual(['the', 'of', 'and']);
  });

  it('de-duplicates while keeping first-seen order', () => {
    expect(tokenize('python python react')).toEqual(['python', 'react']);
  });

  it('returns an empty array for blank input', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize('   ')).toEqual([]);
    expect(tokenize('!!!')).toEqual([]);
  });
});

describe('search — ranking', () => {
  it('returns nothing for an empty query', () => {
    const r = search(index, '');
    expect(r.hits).toEqual([]);
    expect(r.terms).toEqual([]);
  });

  it('finds a project by a body term', () => {
    const r = search(index, 'streamlit');
    expect(r.hits[0].doc.id).toBe('project:eagle');
  });

  it('ranks a title match above a body match', () => {
    const r = search(index, 'vitals');
    expect(r.hits[0].doc.id).toBe('section:vitals');
  });

  it('is case-insensitive', () => {
    expect(search(index, 'PYTHON').hits[0].doc.id).toBe('skill:python');
  });

  it('matches across diacritics', () => {
    const r = search(index, 'demenagement');
    expect(r.hits[0].doc.id).toBe('project:blondeau');
  });

  it('reports which terms matched', () => {
    const r = search(index, 'french');
    expect(r.hits[0].matched).toContain('french');
  });

  it('requires every term by default', () => {
    const r = search(index, 'python streamlit');
    expect(r.relaxed).toBe(false);
    expect(r.hits).toHaveLength(1);
    expect(r.hits[0].doc.id).toBe('project:eagle');
  });

  it('relaxes to OR when the strict search finds nothing', () => {
    const r = search(index, 'python zzzz');
    expect(r.relaxed).toBe(true);
    expect(r.hits.length).toBeGreaterThan(0);
  });

  it('honours the limit', () => {
    const r = search(index, 'store', 1);
    expect(r.hits).toHaveLength(1);
  });

  it('is stable — the same query returns the same order every time', () => {
    const a = search(index, 'a').hits.map((h) => h.doc.id);
    const b = search(index, 'a').hits.map((h) => h.doc.id);
    expect(a).toEqual(b);
  });

  it('breaks a score tie by kind first, then by id', () => {
    /* Three documents with identical text and identical titles: only the
       tie-break decides the order, so the assertion is exact. */
    const tie = buildIndex([
      { id: 'b', kind: 'skill', title: 'Widget', text: 'same' },
      { id: 'a', kind: 'skill', title: 'Widget', text: 'same' },
      { id: 'z', kind: 'project', title: 'Widget', text: 'same' },
    ]);
    expect(search(tie, 'widget').hits.map((h) => h.doc.id)).toEqual(['z', 'a', 'b']);
  });

  it('never returns a document that matched nothing', () => {
    const r = search(index, 'kubernetes');
    expect(r.hits).toEqual([]);
  });
});

describe('highlight', () => {
  it('marks the matched run, case-insensitively', () => {
    const parts = highlight('Eagle Analytics', ['analytics']);
    expect(parts).toEqual([
      { text: 'Eagle ', hit: false },
      { text: 'Analytics', hit: true },
    ]);
  });

  it('returns the whole string as one plain run when there are no terms', () => {
    expect(highlight('Anything', [])).toEqual([{ text: 'Anything', hit: false }]);
  });

  it('is safe with regex metacharacters in the term', () => {
    const parts = highlight('c++ and next.js', ['c++', 'next.js']);
    expect(parts.filter((p) => p.hit).map((p) => p.text)).toEqual(['c++', 'next.js']);
  });

  it('marks every occurrence', () => {
    const parts = highlight('seo and seo', ['seo']);
    expect(parts.filter((p) => p.hit)).toHaveLength(2);
  });
});

describe('summarise', () => {
  it('counts by kind and pluralises', () => {
    const r = search(index, 'store');
    expect(summarise(r.hits)).toMatch(/project/);
  });

  it('says so when there is nothing', () => {
    expect(summarise([])).toBe('no matches');
  });
});

describe('the real corpus', () => {
  const corpus = buildCorpus();

  it('builds documents from content.ts', () => {
    expect(corpus.length).toBeGreaterThan(20);
  });

  it('gives every document a unique id', () => {
    const ids = corpus.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every document a title and searchable text', () => {
    for (const d of corpus) {
      expect(d.title.length, `title for ${d.id}`).toBeGreaterThan(0);
      expect(d.text.length, `text for ${d.id}`).toBeGreaterThan(0);
    }
  });

  it('finds a real project by a real technology', () => {
    const realIndex = buildIndex(corpus);
    const r = search(realIndex, 'wordpress', 8);
    expect(r.hits.length).toBeGreaterThan(0);
    expect(r.hits.some((h) => h.doc.kind === 'project' || h.doc.kind === 'skill')).toBe(true);
  });

  it('does not return a skill because a sibling in the same group matched', () => {
    /* Regression: every skill in a group shared the group's whole item list
       as its searchable text, so "python" returned C, Java and CSS3 too. */
    const realIndex = buildIndex(corpus);
    const titles = search(realIndex, 'python', 8).hits.map((h) => h.doc.title);
    expect(titles).toContain('Python');
    for (const wrong of ['C', 'C++', 'Java', 'CSS3', 'HTML5', 'PHP']) {
      expect(titles, `"${wrong}" must not match python`).not.toContain(wrong);
    }
  });

  it('offers only suggestions that return results', () => {
    /* A chip that leads to "no matches" reads as a broken search. Every one
       we ship is checked against the index it will be used with. */
    const realIndex = buildIndex(corpus);
    const chips = liveSuggestions(realIndex);
    expect(chips.length).toBeGreaterThan(2);
    for (const chip of chips) {
      expect(search(realIndex, chip, 1).hits.length, `chip "${chip}"`).toBeGreaterThan(0);
    }
  });

  it('finds the contact section by the word "hire"', () => {
    const realIndex = buildIndex(corpus);
    const r = search(realIndex, 'hire', 8);
    expect(r.hits[0].doc.id).toBe('section:contact');
  });

  it('every link document has an href', () => {
    for (const d of corpus.filter((x) => x.kind === 'link')) {
      expect(d.href, `href for ${d.id}`).toBeTruthy();
    }
  });
});
