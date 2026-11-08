/* =============================================================================
   FX — everything that needs GSAP, kept in its own chunk.

   It is imported after the page has painted (see chrome.ts), so the 25 KB of
   tweening library is never on the critical path. Nothing here is load-bearing:
   with the chunk blocked, delayed or skipped the page is complete — it just
   does not move.
   ========================================================================== */

import gsap from 'gsap';
import { calmOn } from './motion';

const $ = <T extends Element = Element>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel);
const $$ = <T extends Element = Element>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

export function initFx() {
  if (calmOn()) return;

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* --------------------------------------------------- reveal on scroll */
  /* IntersectionObserver, never a scroll trigger: an element that starts hidden
     and waits for a trigger is an element that can stay invisible forever. */
  const reveal = (sel: string, opts: gsap.TweenVars = {}) => {
    const items = $$<HTMLElement>(sel);
    if (!items.length) return;

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          obs.unobserve(entry.target);
          gsap.fromTo(
            entry.target,
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', overwrite: true, ...opts },
          );
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.01 },
    );

    items.forEach((el) => io.observe(el));
  };

  reveal('[data-reveal]');
  reveal('.trace__row', { y: 8, duration: 0.4, stagger: 0.05 });

  /* ------------------------------------------------------- the hero dial */
  const nodes = $$<HTMLElement>('[data-dial-node]');
  const ring = $<HTMLElement>('.dial__ring--outer');
  const dial = $<HTMLElement>('[data-dial]');

  if (fine && dial && nodes.length) {
    /* The dial answers the pointer: 8px of parallax, 3 degrees of rotation. */
    dial.addEventListener('pointermove', (e) => {
      const r = dial.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / r.width;
      const y = (e.clientY - r.top - r.height / 2) / r.height;
      gsap.to(nodes, { x: x * 8, y: y * 8, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
      if (ring) gsap.to(ring, { rotate: x * 3, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
    });
    dial.addEventListener('pointerleave', () => {
      gsap.to(nodes, { x: 0, y: 0, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
      if (ring) gsap.to(ring, { rotate: 0, duration: 0.8, overwrite: 'auto' });
    });
  }

  /* -------------------------------------------------- magnetic buttons */
  if (fine) {
    $$<HTMLElement>('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.12;
        const y = (e.clientY - r.top - r.height / 2) * 0.18;
        gsap.to(el, { x, y, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
      });
    });
  }
}
