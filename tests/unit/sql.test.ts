import { describe, expect, it } from 'vitest';
import { lex, run, SqlError, type Table } from '../../src/lib/sql';
import { tables, examples } from '../../src/lib/lab';

/* =============================================================================
   The Query Lab runs SQL for real, in the browser. That is only worth
   claiming if the engine actually behaves — so the engine is tested here
   like any other query layer: projection, filtering, grouping, ordering,
   limits, and the errors a visitor will genuinely hit.
   ========================================================================== */

const fixture: Table[] = [
  {
    name: 'projects',
    columns: ['title', 'category', 'year', 'stack'],
    rows: [
      { title: 'EuroEdge', category: 'website', year: 2026, stack: 'WordPress, SEO' },
      { title: 'Blondeau', category: 'website', year: 2025, stack: 'WordPress, Local SEO' },
      { title: 'Gauvin', category: 'website', year: 2025, stack: 'WordPress' },
      { title: 'Eagle Analytics', category: 'dashboard', year: 2024, stack: 'Python, Streamlit' },
      { title: 'ZENJI', category: 'store', year: 2025, stack: 'React, Motion' },
      { title: 'Job Radar', category: 'app', year: 2026, stack: 'Next.js' },
    ],
  },
];

const q = (sql: string, t = fixture) => run(sql, t);

describe('lex', () => {
  it('splits a simple query', () => {
    const tokens = lex('SELECT a FROM t');
    expect(tokens.map((t) => t.t)).toEqual(['kw', 'ident', 'kw', 'ident']);
  });

  it('keeps a quoted string whole, commas and all', () => {
    const tokens = lex("WHERE stack = 'WordPress, SEO'");
    const str = tokens.find((t) => t.t === 'str');
    expect(str).toEqual({ t: 'str', v: 'WordPress, SEO' });
  });

  it('understands multi-character operators', () => {
    const ops = lex('a >= 1 AND b != 2').filter((t) => t.t === 'op').map((t) => (t as { v: string }).v);
    expect(ops).toEqual(['>=', '!=']);
  });

  it('strips -- comments', () => {
    const tokens = lex('SELECT a -- just a comment\nFROM t');
    expect(tokens.some((t) => t.t === 'ident' && t.v === 'comment')).toBe(false);
  });

  it('rejects an unclosed string', () => {
    expect(() => lex("WHERE a = 'oops")).toThrow(SqlError);
  });
});

describe('projection', () => {
  it('SELECT * returns every column in table order', () => {
    const r = q('SELECT * FROM projects');
    expect(r.columns).toEqual(['title', 'category', 'year', 'stack']);
    expect(r.rows).toHaveLength(6);
  });

  it('selects named columns in the order asked', () => {
    const r = q('SELECT year, title FROM projects');
    expect(r.columns).toEqual(['year', 'title']);
    expect(r.rows[0][1]).toBe('EuroEdge');
  });

  it('supports AS aliases', () => {
    const r = q('SELECT title AS name FROM projects');
    expect(r.columns).toEqual(['name']);
  });
});

describe('filtering', () => {
  it('filters on a string', () => {
    const r = q("SELECT title FROM projects WHERE category = 'website'");
    expect(r.rows).toHaveLength(3);
  });

  it('is case-insensitive for values', () => {
    const r = q("SELECT title FROM projects WHERE category = 'WEBSITE'");
    expect(r.rows).toHaveLength(3);
  });

  it('compares numbers', () => {
    const r = q('SELECT title FROM projects WHERE year >= 2025');
    expect(r.rows).toHaveLength(5);
  });

  it('combines with AND', () => {
    const r = q("SELECT title FROM projects WHERE category = 'website' AND year >= 2026");
    expect(r.rows).toEqual([['EuroEdge']]);
  });

  it('combines with OR', () => {
    const r = q("SELECT title FROM projects WHERE category = 'store' OR category = 'app'");
    expect(r.rows).toHaveLength(2);
  });

  it('supports LIKE with %', () => {
    const r = q("SELECT title FROM projects WHERE stack LIKE '%WordPress%'");
    expect(r.rows).toHaveLength(3);
  });

  it('supports LIKE with a prefix pattern', () => {
    const r = q("SELECT title FROM projects WHERE title LIKE 'Blon%'");
    expect(r.rows).toEqual([['Blondeau']]);
  });

  it('supports !=', () => {
    const r = q("SELECT title FROM projects WHERE category != 'website'");
    expect(r.rows).toHaveLength(3);
  });
});

describe('aggregation', () => {
  it('COUNT(*) with GROUP BY', () => {
    const r = q('SELECT category, COUNT(*) AS total FROM projects GROUP BY category');
    expect(r.columns).toEqual(['category', 'total']);
    const byCat = Object.fromEntries(r.rows.map((row) => [row[0], row[1]]));
    expect(byCat).toEqual({ website: 3, dashboard: 1, store: 1, app: 1 });
  });

  it('COUNT(*) without GROUP BY collapses to one row', () => {
    const r = q('SELECT COUNT(*) AS n FROM projects');
    expect(r.rows).toEqual([[6]]);
  });

  it('AVG rounds to two decimals', () => {
    const r = q('SELECT AVG(year) FROM projects');
    expect(r.rows[0][0]).toBe(2025.17);
  });

  it('MIN and MAX', () => {
    const r = q('SELECT MIN(year), MAX(year) FROM projects');
    expect(r.rows[0]).toEqual([2024, 2026]);
  });

  it('SUM over a number column', () => {
    const r = q('SELECT SUM(year) FROM projects');
    expect(r.rows[0][0]).toBe(12151);
  });

  it('aggregates respect WHERE', () => {
    const r = q("SELECT COUNT(*) FROM projects WHERE category = 'website'");
    expect(r.rows[0][0]).toBe(3);
  });
});

describe('ordering and limits', () => {
  it('orders ascending by default', () => {
    const r = q('SELECT year FROM projects ORDER BY year');
    expect(r.rows[0][0]).toBe(2024);
  });

  it('orders descending', () => {
    const r = q('SELECT year FROM projects ORDER BY year DESC');
    expect(r.rows[0][0]).toBe(2026);
  });

  it('orders strings alphabetically', () => {
    const r = q('SELECT title FROM projects ORDER BY title');
    expect(r.rows.map((x) => x[0])).toEqual([
      'Blondeau', 'Eagle Analytics', 'EuroEdge', 'Gauvin', 'Job Radar', 'ZENJI',
    ]);
  });

  it('orders by an aggregate in a grouped query', () => {
    const r = q('SELECT category, COUNT(*) AS total FROM projects GROUP BY category ORDER BY total DESC');
    expect(r.rows[0]).toEqual(['website', 3]);
  });

  it('LIMIT truncates', () => {
    const r = q('SELECT title FROM projects LIMIT 2');
    expect(r.rows).toHaveLength(2);
  });

  it('LIMIT 0 returns nothing', () => {
    const r = q('SELECT title FROM projects LIMIT 0');
    expect(r.rows).toHaveLength(0);
  });
});

describe('errors are helpful', () => {
  it('refuses anything that is not a SELECT', () => {
    expect(() => q('DELETE FROM projects')).toThrow(/Only SELECT/);
  });

  it('names an unknown table and lists the real ones', () => {
    expect(() => q('SELECT * FROM nope')).toThrow(/No table "nope"/);
  });

  it('names an unknown column', () => {
    expect(() => q('SELECT salary FROM projects')).toThrow(/No column "salary"/);
  });

  it('names an unknown column inside WHERE', () => {
    expect(() => q('SELECT title FROM projects WHERE salar = 1')).toThrow(/No column "salar"/);
  });

  it('rejects an empty query', () => {
    expect(() => q('   ')).toThrow(/Empty/);
  });

  it('rejects trailing junk', () => {
    expect(() => q('SELECT title FROM projects garbage')).toThrow(SqlError);
  });

  it('rejects an unclosed string', () => {
    expect(() => q("SELECT title FROM projects WHERE title = 'x")).toThrow(SqlError);
  });
});

describe('the real database', () => {
  it('exposes the three tables', () => {
    expect(tables.map((t) => t.name)).toEqual(['projects', 'skills', 'roles']);
  });

  it('has a row for every project on the site', () => {
    const projects = tables.find((t) => t.name === 'projects')!;
    expect(projects.rows.length).toBeGreaterThan(6);
  });

  it('every example query runs without throwing', () => {
    for (const ex of examples) {
      expect(() => run(ex.sql, tables), ex.label).not.toThrow();
      const r = run(ex.sql, tables);
      expect(r.rows.length, `${ex.label} returned nothing`).toBeGreaterThan(0);
      expect(r.columns.length).toBeGreaterThan(0);
    }
  });

  it('the "live only" example really returns only live projects', () => {
    const r = run("SELECT title FROM projects WHERE live = 'yes'", tables);
    const all = tables.find((t) => t.name === 'projects')!;
    const liveCount = all.rows.filter((row) => row.live === 'yes').length;
    expect(r.rows).toHaveLength(liveCount);
  });

  it('every project row has a numeric year', () => {
    const projects = tables.find((t) => t.name === 'projects')!;
    for (const row of projects.rows) {
      expect(typeof row.year, `${row.title}`).toBe('number');
    }
  });
});
