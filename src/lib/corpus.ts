/* =============================================================================
   CORPUS — turns the site's own content into documents the ⌘K index can rank.
   One source of truth: if it is not in content.ts, it cannot be searched.
   ========================================================================== */

import type { Doc } from './ask';
import { experience, liveLinks, extraWork, projects, skillGroups, site } from '../data/content';

export function buildCorpus(): Doc[] {
  const docs: Doc[] = [];

  for (const p of projects) {
    docs.push({
      id: `project:${p.key}`,
      kind: 'project',
      title: p.title,
      text: [
        p.catLabel,
        p.year,
        p.metric,
        p.badge,
        p.caseStudy.sub,
        p.caseStudy.problem,
        ...p.caseStudy.did,
        p.caseStudy.changed,
        p.caseStudy.client,
        p.caseStudy.role,
      ].join(' '),
      tags: [...p.tags, p.catLabel, p.year],
      meta: `${p.catLabel} · ${p.year}`,
      href: p.link ?? undefined,
    });
  }

  for (const group of skillGroups) {
    for (const item of group.items) {
      /* A skill's body is its own group, never its siblings' names: sharing
         the whole list makes every skill match every other skill's query,
         which looks like a broken search engine. */
      docs.push({
        id: `skill:${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        kind: 'skill',
        title: item,
        text: `skill tool technology ${group.label}`,
        tags: [group.label],
        meta: group.label,
      });
    }
  }

  for (const role of experience) {
    docs.push({
      id: `role:${role.org.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      kind: 'role',
      title: role.role,
      text: `${role.org} ${role.place ?? ''} ${role.when}`,
      tags: [role.org, role.when],
      meta: `${role.org} · ${role.when}`,
    });
  }

  for (const l of liveLinks) {
    docs.push({
      id: `link:${l.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      kind: 'link',
      title: l.label,
      text: `${l.label} ${l.meta} live site`,
      tags: [l.meta],
      meta: l.meta,
      href: l.href,
    });
  }

  for (const e of extraWork) {
    docs.push({
      id: `link:${e.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      kind: 'link',
      title: e.label,
      text: `${e.label} ${e.meta} repository source code`,
      tags: [e.meta],
      meta: e.meta,
      href: e.href,
    });
  }

  const sections: { id: string; title: string; text: string }[] = [
    { id: 'work', title: 'Selected work', text: 'projects case studies shipped websites stores apps dashboards gallery' },
    { id: 'stack', title: 'How it is built', text: 'stack layers interface logic data infra quality architecture react node sql docker playwright' },
    { id: 'lab', title: 'Query lab', text: 'sql query database search filter group order run table rows' },
    { id: 'repos', title: 'Repositories', text: 'github repos repositories code projects public experiments coursework' },
    { id: 'about', title: 'About', text: 'biography background dhaka bangladesh story' },
    { id: 'experience', title: 'Experience', text: 'jobs roles career history employment timeline' },
    { id: 'contact', title: 'Contact', text: `email ${site.email} whatsapp phone github hire work together` },
  ];

  for (const s of sections) {
    docs.push({
      id: `section:${s.id}`,
      kind: 'section',
      title: s.title,
      text: s.text,
      meta: 'jump to section',
      href: `#${s.id}`,
    });
  }

  /* One project can appear in more than one list (a live link and an extra
     work entry, for instance). The palette must never show the same thing
     twice, so first mention wins. */
  const seen = new Set<string>();
  return docs.filter((d) => {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });
}
