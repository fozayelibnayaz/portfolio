/* =============================================================================
   CHECK TOKENS — fails if the built page uses a CSS variable it never defines.

   This exists because a token that is referenced but never declared does not
   throw, does not warn, and does not fail a type check. It silently renders as
   nothing: `border-radius: var(--r-md)` becomes a square corner, and a whole
   component quietly loses its surface. It shipped once; it should not ship
   again.

   Run against `dist/` after a build:  node scripts/check-tokens.mjs
   ========================================================================== */

import { readFile, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

/** Every .css file Astro emitted, plus the inline <style> blocks of the HTML. */
async function collectCss() {
  const chunks = [];

  const index = await readFile(join(DIST, 'index.html'), 'utf8').catch(() => '');
  for (const m of index.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) chunks.push(m[1] ?? '');
  chunks.push(index);

  const walk = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (extname(entry.name) === '.css') chunks.push(await readFile(path, 'utf8'));
    }
  };
  await walk(DIST).catch(() => {});

  return chunks.join('\n');
}

const css = await collectCss();
if (!css.trim()) {
  console.error('check-tokens: no CSS found — run a build first.');
  process.exit(1);
}

/* Custom properties declared anywhere (including at-rule scopes). */
const defined = new Set();
for (const m of css.matchAll(/(--[a-zA-Z0-9_-]+)\s*:/g)) defined.add(m[1]);

/* Custom properties read through var(), with an optional fallback. */
const used = new Map();
for (const m of css.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)\s*(,)?/g)) {
  const name = m[1];
  const hasFallback = Boolean(m[2]);
  if (!used.has(name)) used.set(name, hasFallback);
  else if (!hasFallback) used.set(name, false);
}

/* A var() with a fallback is safe even when undefined — that is what a
   fallback is for. Only bare references are errors. */
const missing = [...used.entries()]
  .filter(([name, hasFallback]) => !defined.has(name) && !hasFallback)
  .map(([name]) => name)
  .sort();

if (missing.length) {
  console.error(`check-tokens: ${missing.length} undefined custom propert${missing.length === 1 ? 'y' : 'ies'}`);
  for (const name of missing) console.error(`  ${name}`);
  process.exit(1);
}

console.log(`check-tokens: ${used.size} referenced, ${defined.size} declared — all resolved.`);
