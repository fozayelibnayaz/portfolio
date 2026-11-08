/* Prints the real first-load weight of the built site.
   Fails the build if it ever crosses the budget below.

   First load = the document (CSS is inlined into it), the fonts the page
   actually paints with, the module scripts, and the one image that is
   preloaded above the fold. Everything else is lazy. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const DIST = 'dist';
const BUDGET_KB = 700;

const html = readFileSync(join(DIST, 'index.html'), 'utf8');
const pick = (re) => [...html.matchAll(re)].map((m) => m[1]);

/* Module scripts linked from the document, plus the first chunk of the lab
   engine (it is a separate file, so it counts as a URL but not as bytes here —
   it only downloads on interaction). */
const jsFiles = [...new Set(pick(/<script[^>]+src="[^"]*\/assets\/([^"]+\.js)"/g))];
const inlineCss = pick(/<style>([\s\S]*?)<\/style>/g).join('');
const fonts = [...new Set([...inlineCss.matchAll(/url\([^)]*\/assets\/([^)]+\.woff2)\)/g)].map((m) => m[1]))];
const preloads = [...new Set(pick(/<link[^>]+rel="preload"[^>]+href="[^"]*\/img\/([^"]+\.avif)"/g))];
/* Images the stylesheet or an inline style attribute asks for (the hero
   blueprint) are part of first load even though nothing preloads them. They
   can live under /img/ or /assets/, so keep the whole path. */
const cssImages = [...new Set(
  [...html.matchAll(/url\(\s*["']?([^)"']+\.(?:png|webp|avif|jpe?g))["']?\s*\)/g)]
    .map((m) => m[1].replace(/^\.?\//, '')),
)];

const raw = (p) => statSync(join(DIST, p)).size;
const gz = (p) => gzipSync(readFileSync(join(DIST, p)), { level: 9 }).length;

let total = gz('index.html');
for (const f of fonts) total += raw(join('assets', f));
for (const f of jsFiles) total += gz(join('assets', f));
for (const f of preloads) total += raw(join('img', f));
for (const f of cssImages) total += raw(f);

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const assets = readdirSync(join(DIST, 'assets'));
const cssFiles = assets.filter((f) => f.endsWith('.css')).length;

console.log('Document        ', kb(gz('index.html')), `(CSS inlined: ${cssFiles} external)`);
console.log('Fonts           ', fonts.length, '→', kb(fonts.reduce((n, f) => n + raw(join('assets', f)), 0)));
console.log('Module scripts  ', jsFiles.length, '→', kb(jsFiles.reduce((n, f) => n + gz(join('assets', f)), 0)));
console.log('Preloaded image ', preloads.length, '→', kb(preloads.reduce((n, f) => n + raw(join('img', f)), 0)));
console.log('CSS background  ', cssImages.length, '→', kb(cssImages.reduce((n, f) => n + raw(f), 0)));
console.log('—'.repeat(46));
console.log('First load      ', kb(total), `/ budget ${BUDGET_KB} KB`);

if (total / 1024 > BUDGET_KB) {
  console.error(`\nOver budget: ${kb(total)} > ${BUDGET_KB} KB`);
  process.exit(1);
}
