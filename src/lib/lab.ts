/* =============================================================================
   LAB DATA — the tables the Query Lab exposes.

   Built from content.ts at build time, so the database and the site can never
   disagree. Only fields that genuinely exist are published; nothing here is
   estimated.
   ========================================================================== */

import type { Table, Value } from './sql';
import { experience, projects, skillGroups } from '../data/content';

const CATEGORY: Record<string, string> = {
  websites: 'website',
  store: 'store',
  apps: 'app',
  dash: 'dashboard',
};

export const tables: Table[] = [
  {
    name: 'projects',
    columns: ['title', 'category', 'year', 'client', 'stack', 'status', 'live'],
    rows: projects.map((p) => ({
      title: p.title,
      category: CATEGORY[p.category] ?? p.category,
      year: Number(p.year) || null,
      client: p.caseStudy.client,
      stack: p.tags.join(', '),
      status: p.caseStudy.status,
      live: p.link ? 'yes' : 'no',
    })) as Record<string, Value>[],
  },
  {
    name: 'skills',
    columns: ['skill', 'area'],
    rows: skillGroups.flatMap((g) =>
      g.items.map((item) => ({ skill: item, area: g.label })),
    ) as Record<string, Value>[],
  },
  {
    name: 'roles',
    columns: ['role', 'company', 'place', 'period'],
    rows: experience.map((e) => ({
      role: e.role,
      company: e.org,
      place: e.place,
      period: e.when,
    })) as Record<string, Value>[],
  },
];

/** Queries offered as starting points. Every one of them runs. */
export const examples: { label: string; sql: string }[] = [
  {
    label: 'Everything, newest first',
    sql: 'SELECT title, category, year FROM projects ORDER BY year DESC',
  },
  {
    label: 'How many of each kind?',
    sql: 'SELECT category, COUNT(*) AS total FROM projects GROUP BY category ORDER BY total DESC',
  },
  {
    label: 'Only the live ones',
    sql: "SELECT title, year, status FROM projects WHERE live = 'yes' ORDER BY year DESC",
  },
  {
    label: 'Web work since 2025',
    sql: "SELECT title, stack FROM projects WHERE category = 'website' AND year >= 2025",
  },
  {
    label: 'Anything touching WordPress',
    sql: "SELECT title, category FROM projects WHERE stack LIKE '%WordPress%'",
  },
  {
    label: 'Skills by area',
    sql: 'SELECT area, COUNT(*) AS total FROM skills GROUP BY area ORDER BY total DESC',
  },
  {
    label: 'Where I have worked',
    sql: 'SELECT role, company, period FROM roles ORDER BY period DESC',
  },
  {
    label: 'Newest 3 projects',
    sql: 'SELECT title, year FROM projects ORDER BY year DESC LIMIT 3',
  },
];
