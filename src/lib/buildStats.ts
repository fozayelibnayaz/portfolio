/**
 * Measured at build time by reading the actual source tree.
 * Nothing here is typed in by hand — every number is counted from disk,
 * so anyone who clones the repo and runs the build gets the same figures.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(process.cwd(), 'src');

const read = (p: string) => {
  try {
    return readFileSync(join(SRC, p), 'utf8');
  } catch {
    return '';
  }
};

const ls = (p: string) => {
  try {
    return readdirSync(join(SRC, p));
  } catch {
    return [];
  }
};

const lines = (s: string) => s.split('\n').filter((l) => l.trim().length > 0).length;

/* ---------------------------------------------------------------- styles */
const styleFiles = ls('styles').filter((f) => f.endsWith('.css'));
const cssSource = styleFiles.map((f) => read(`styles/${f}`)).join('\n');
const cssLines = lines(cssSource);
const mediaQueries = (cssSource.match(/@media/g) ?? []).length;
const customProps = new Set(cssSource.match(/--[a-z0-9-]+(?=\s*:)/gi) ?? []).size;

/* -------------------------------------------------------------- scripts */
const animSource = read('scripts/anim.ts');
const dataSource = read('data/content.ts');
const tsLines = lines(animSource) + lines(dataSource);

const gsap = {
  scrollTrigger: (animSource.match(/ScrollTrigger\.create|scrollTrigger:/g) ?? []).length,
  timelines: (animSource.match(/gsap\.timeline/g) ?? []).length,
  tweens: (animSource.match(/gsap\.(to|from|fromTo|set)\(/g) ?? []).length,
  quickTo: (animSource.match(/gsap\.quickTo/g) ?? []).length,
  modifiers: (animSource.match(/modifiers:/g) ?? []).length,
};

/* ----------------------------------------------------------- components */
const components = ls('components').filter((f) => f.endsWith('.astro')).length;
const pages = ls('pages').filter((f) => f.endsWith('.astro')).length;

/* --------------------------------------------------------------- assets */
const fonts = ls('assets/fonts').length;

const countPublic = (dir: string) => {
  try {
    return readdirSync(join(process.cwd(), 'public', dir)).length;
  } catch {
    return 0;
  }
};
const images = countPublic('img');

/* --------------------------------------------------- external dependencies */
const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
const runtime = Object.keys(pkg.dependencies ?? {});
const uiFrameworks = runtime.filter((d) =>
  /^(react|vue|svelte|solid-js|preact|@angular|jquery|bootstrap|tailwindcss)$/.test(d),
);

export const buildStats = {
  cssLines,
  tsLines,
  mediaQueries,
  customProps,
  components,
  pages,
  fonts,
  images,
  gsap,
  runtime,
  uiFrameworks,
  frameworks: runtime.filter((d) => ['astro', 'gsap', 'lenis'].includes(d)),
};
