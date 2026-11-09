#!/usr/bin/env node
/* Re-encode the halftone figure to the sizes the hero actually serves.
   Kept next to gen-halftone.py so the two always run together:

     python3 scripts/gen-halftone.py && node scripts/encode-halftone.mjs
*/
import sharp from 'sharp';
import { statSync } from 'node:fs';

const SRC = 'public/img/portrait-halftone.png';
const SIZES = [560];

for (const w of SIZES) {
  const base = sharp(SRC).resize({ width: w });
  await base.clone().avif({ quality: 30, effort: 4 }).toFile(`public/img/portrait-halftone-${w}.avif`);
  await base.clone().webp({ quality: 82, effort: 6 }).toFile(`public/img/portrait-halftone-${w}.webp`);
}

const kb = (p) => (statSync(p).size / 1024).toFixed(1).padStart(5) + ' KB';
for (const f of ['png', ...SIZES.flatMap((w) => [`${w}.avif`, `${w}.webp`])]) {
  const p = `public/img/portrait-halftone${f.includes('.') ? '-' + f : '.' + f}`;
  try {
    console.log(kb(p), p);
  } catch {
    /* ignore */
  }
}
