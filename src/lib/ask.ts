/* =============================================================================
   ASK — the search index behind ⌘K.

   This is not a language model and it does not pretend to be one. It is a
   small, honest, fully-tested ranking engine: every document it can return is
   a real thing on this page, and every result says which terms matched it.

   Pure module — no DOM, no clock, no randomness. Same input, same order, every
   time. That is what makes it worth testing.
   ========================================================================== */

export type DocKind = 'project' | 'skill' | 'role' | 'link' | 'section';

export type Doc = {
  id: string;
  kind: DocKind;
  title: string;
  /** Searchable body copy. Never rendered as-is. */
  text: string;
  tags?: string[];
  /** Short descriptor shown under the title. */
  meta?: string;
  /** Where choosing the result goes. */
  href?: string;
};

export type Hit = {
  doc: Doc;
  score: number;
  /** The query terms this document actually matched, best first. */
  matched: string[];
};

export type Index = {
  docs: Doc[];
  /** Precomputed lowercase forms, so a keystroke never re-lowercases the corpus. */
  fields: { title: string; tags: string; meta: string; text: string; kind: string }[];
  titleWords: string[][];
  tagWords: string[][];
};

export type SearchResult = {
  hits: Hit[];
  /** True when the strict all-terms search found nothing and we relaxed it. */
  relaxed: boolean;
  terms: string[];
};

/** Words that carry no signal. Kept short and deliberate. */
const STOP = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'do', 'does', 'for', 'from',
  'how', 'i', 'in', 'is', 'it', 'its', 'me', 'my', 'of', 'on', 'or', 'that', 'the',
  'their', 'them', 'then', 'there', 'these', 'this', 'to', 'was', 'what', 'when',
  'where', 'which', 'who', 'why', 'with', 'you', 'your',
]);

/**
 * Lowercase, strip diacritics, split on anything that is not a letter, digit,
 * or one of the symbols that appear in real technology names (c++, c#, .net).
 */
const deaccent = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export function tokenize(input: string): string[] {
  if (!input) return [];

  const cleaned = deaccent(input);

  const raw = cleaned.split(/[^a-z0-9+#.]+/).filter(Boolean);
  const out: string[] = [];

  for (const token of raw) {
    const trimmed = token.replace(/^[.]+|[.]+$/g, '');
    if (!trimmed) continue;

    /* "next.js" should be findable by "next.js", "next" and "js". */
    if (trimmed.includes('.')) {
      out.push(trimmed);
      for (const part of trimmed.split('.')) {
        if (part.length > 1) out.push(part);
      }
      continue;
    }
    out.push(trimmed);
  }

  const meaningful = out.filter((t) => !STOP.has(t));
  const chosen = meaningful.length ? meaningful : out;

  /* De-duplicate but keep first-seen order, which keeps scores stable. */
  return [...new Set(chosen)];
}

const words = (s: string): string[] => s.split(/[^a-z0-9+#]+/).filter(Boolean);

export function buildIndex(docs: Doc[]): Index {
  /* Normalise the documents exactly the way the query is normalised. Stripping
     accents from only one side is how "demenagement" stops finding
     "Déménagement" — a bug the unit tests exist to catch. */
  const fields = docs.map((d) => ({
    title: deaccent(d.title),
    tags: deaccent((d.tags ?? []).join(' ')),
    meta: deaccent(d.meta ?? ''),
    text: deaccent(d.text),
    kind: d.kind.toLowerCase(),
  }));

  return {
    docs,
    fields,
    titleWords: fields.map((f) => words(f.title)),
    tagWords: fields.map((f) => words(f.tags)),
  };
}

/* Field weights: a hit in the title says far more than a hit in prose. */
const W = { title: 9, tags: 6, meta: 4, text: 3, kind: 2 } as const;

type Quality = 0 | 1 | 2 | 3;

/** 3 = whole word, 2 = word starts with the term, 1 = term appears inside. */
function quality(term: string, field: string, wordList: string[]): Quality {
  if (!field) return 0;
  if (field === term) return 3;
  if (wordList.includes(term)) return 3;
  for (const w of wordList) if (w.startsWith(term)) return 2;
  if (field.includes(term)) return 1;
  return 0;
}

function scoreDoc(index: Index, i: number, terms: string[]): { score: number; matched: string[] } {
  const f = index.fields[i];
  let score = 0;
  const matched: string[] = [];

  for (const term of terms) {
    const q = Math.max(
      quality(term, f.title, index.titleWords[i]),
      quality(term, f.tags, index.tagWords[i]),
      quality(term, f.meta, []),
      quality(term, f.text, []),
      quality(term, f.kind, []),
    );
    if (q === 0) continue;
    matched.push(term);

    score += W.title * quality(term, f.title, index.titleWords[i]);
    score += W.tags * quality(term, f.tags, index.tagWords[i]);
    score += W.meta * quality(term, f.meta, []);
    score += W.text * quality(term, f.text, []);
    score += W.kind * quality(term, f.kind, []);
  }

  /* A title that contains every term is almost certainly what was meant. */
  if (terms.length > 1 && terms.every((t) => f.title.includes(t))) score += 40;

  return { score, matched };
}

const KIND_RANK: Record<DocKind, number> = {
  project: 0,
  skill: 1,
  role: 2,
  link: 3,
  section: 4,
};

function rank(index: Index, terms: string[], strict: boolean): Hit[] {
  const hits: Hit[] = [];

  for (let i = 0; i < index.docs.length; i++) {
    const { score, matched } = scoreDoc(index, i, terms);
    if (score <= 0) continue;
    if (strict && matched.length !== terms.length) continue;
    hits.push({ doc: index.docs[i], score, matched });
  }

  hits.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const k = KIND_RANK[a.doc.kind] - KIND_RANK[b.doc.kind];
    if (k !== 0) return k;
    return a.doc.id < b.doc.id ? -1 : a.doc.id > b.doc.id ? 1 : 0;
  });

  return hits;
}

/**
 * Search the corpus. Terms are combined with AND by default; if nothing
 * matches every term we fall back to OR so a half-typed query still helps.
 */
export function search(index: Index, query: string, limit = 8): SearchResult {
  const terms = tokenize(query);
  if (!terms.length) return { hits: [], relaxed: false, terms };

  const strict = rank(index, terms, true);
  if (strict.length) return { hits: strict.slice(0, limit), relaxed: false, terms };

  const loose = rank(index, terms, false);
  return { hits: loose.slice(0, limit), relaxed: loose.length > 0, terms };
}

/** Candidate chips. Kept as candidates rather than gospel — see below. */
export const SUGGESTION_CANDIDATES = [
  'python',
  'wordpress',
  'playwright',
  'dashboards',
  'france',
  'analytics',
];

/**
 * Only offer a chip that actually returns something. A suggestion that leads
 * to "no matches" teaches the visitor the search is broken, so the list is
 * checked against the live index at build time instead of being trusted.
 */
export function liveSuggestions(index: Index, limit = 5): string[] {
  return SUGGESTION_CANDIDATES.filter((s) => search(index, s, 1).hits.length > 0).slice(0, limit);
}

/** Split text into highlighted / plain runs for rendering. */
export function highlight(text: string, terms: string[]): { text: string; hit: boolean }[] {
  if (!terms.length) return [{ text, hit: false }];

  const escaped = terms
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (!escaped.length) return [{ text, hit: false }];

  const re = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(re).filter((p) => p !== '');
  const lower = terms.map((t) => t.toLowerCase());

  return parts.map((p) => ({ text: p, hit: lower.includes(p.toLowerCase()) }));
}

/** One-line summary of what a result set contains, for the palette footer. */
export function summarise(hits: Hit[]): string {
  if (!hits.length) return 'no matches';
  const counts = new Map<DocKind, number>();
  for (const h of hits) counts.set(h.doc.kind, (counts.get(h.doc.kind) ?? 0) + 1);

  const order: DocKind[] = ['project', 'skill', 'role', 'link', 'section'];
  const bits = order
    .filter((k) => counts.has(k))
    .map((k) => `${counts.get(k)} ${k}${counts.get(k) === 1 ? '' : 's'}`);

  return bits.join(' · ');
}
