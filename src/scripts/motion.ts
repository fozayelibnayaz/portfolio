/* =============================================================================
   MOTION — one question, asked in one place: should this page animate?

   Two ways to say no: the OS setting, or the `data-motion="calm"` attribute on
   <html> (kept for anyone who pins it). Everything that animates asks here
   first, so the answer cannot drift between modules.
   ========================================================================== */

const media = window.matchMedia('(prefers-reduced-motion: reduce)');

export function calmOn(): boolean {
  return media.matches || document.documentElement.dataset.motion === 'calm';
}

export function onMotionChange(cb: (calm: boolean) => void): void {
  media.addEventListener('change', () => cb(calmOn()));
}
