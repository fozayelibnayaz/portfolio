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

    /* Anything already on screen stays put. This chunk arrives late (after the
       first interaction), so animating from opacity 0 here would mean the page
       visibly jumps under the visitor's finger — and a control that moves
       while it is being clicked is a control that misses. */
    const pending = items.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.top > window.innerHeight * 0.94 || r.bottom < 0;
    });
    if (!pending.length) return;

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

    pending.forEach((el) => io.observe(el));
  };

  reveal('[data-reveal]');
  reveal('.trace__row', { y: 8, duration: 0.4, stagger: 0.05 });

  /* --------------------------------------------------- the paged gallery */
  /* Cards lift in as a page arrives, and a page that is off-screen is inert to
     the pointer. Both are presentation only: with this chunk missing, the deck
     still scrolls, still swipes and still announces its page. */
  const deck = $<HTMLElement>('[data-pager-track]');
  if (deck) {
    const pages = $$<HTMLElement>('[data-page]', deck);
    const viewport = $<HTMLElement>('[data-pager-viewport]');

    /* The page the visitor is already looking at never fades: this chunk can
       land seconds after first paint, and re-animating visible cards both
       jumps the layout and drops their contrast to whatever opacity the fade
       happens to be at. */
    let painted = false;

    const animateIn = (page: Element) => {
      const cards = $$<HTMLElement>('.rtile', page);
      if (!cards.length) return;
      if (!painted) {
        painted = true;
        return;
      }
      gsap.fromTo(
        cards,
        { y: 12 },
        {
          y: 0,
          duration: 0.55,
          ease: 'power2.out',
          stagger: { each: 0.045, from: 'start' },
          overwrite: true,
          clearProps: 'transform',
        },
      );
    };

    /* Watch the deck itself, not the page: the strip scrolls horizontally, so
       a vertical IntersectionObserver only fires when the section arrives. */
    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          const page = entry.target;
          if (entry.isIntersecting) {
            page.removeAttribute('inert');
            animateIn(page);
            obs.unobserve(page);
          }
        }
      },
      { root: viewport, threshold: 0.35 },
    );

    /* `inert` rather than aria-hidden: a page that is off-screen holds real
       links, and aria-hidden alone would hide them from a screen reader while
       leaving them in the tab order — a keyboard trap. inert handles both. */
    const paint = (active: number) => {
      pages.forEach((page, i) => {
        if (i === active) page.removeAttribute('inert');
        else page.setAttribute('inert', '');
      });
    };

    pages.forEach((page, i) => {
      if (i === 0) animateIn(page);
      else io.observe(page);
    });

    /* The component's own script owns the scroll position; this only mirrors
       it into aria state so a screen reader is not read fifty cards at once. */
    viewport?.addEventListener(
      'scroll',
      () => {
        const w = viewport.clientWidth || 1;
        const max = viewport.scrollWidth - viewport.clientWidth;
        const atEnd = max > 0 && viewport.scrollLeft >= max - 2;
        paint(atEnd ? pages.length - 1 : Math.round(viewport.scrollLeft / w));
      },
      { passive: true },
    );
    paint(0);
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
