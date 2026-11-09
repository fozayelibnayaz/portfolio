/* =============================================================================
   CHROME — the furniture that stays put: smooth scroll, header state, the menu,
   the section ruler, the hero dial, and reveals.

   Motion is additive. With reduced motion on (or with JS off) every element is
   already visible and readable — nothing waits behind a tween that might not
   fire.
   ========================================================================== */

import { calmOn } from './motion';

const $ = <T extends Element = Element>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel);
const $$ = <T extends Element = Element>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

const body = document.body;
const header = $<HTMLElement>('[data-header]');
const progress = $<HTMLElement>('[data-progress]');

/* ------------------------------------------------------------ scrolling */
/* Native smooth scrolling: one line, no rAF loop, and it already respects the
   user's motion preference because we choose the behaviour ourselves. */
const scrollTo = (target: string) => {
  const el = document.querySelector<HTMLElement>(target);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 74;
  window.scrollTo({ top, behavior: calmOn() ? 'auto' : 'smooth' });
};

/* --------------------------------------------------------- anchor handling */
$$<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  const href = a.getAttribute('href');
  if (!href || href === '#' || a.classList.contains('skip-link')) return;

  a.addEventListener('click', (e) => {
    const id = href.slice(1);
    if (!document.getElementById(id)) return;
    e.preventDefault();
    if (body.classList.contains('nav-open')) closeNav();
    scrollTo(href);
    history.replaceState(null, '', href);
  });
});

/* ------------------------------------------------------------ header state */
let lastY = 0;
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;

  header?.classList.toggle('is-stuck', y > 10);
  header?.classList.toggle(
    'is-hidden',
    y > 460 && y > lastY && !body.classList.contains('nav-open'),
  );
  if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;

  lastY = y;
  ticking = false;
}

window.addEventListener(
  'scroll',
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  },
  { passive: true },
);
onScroll();

/* ---------------------------------------------------------------- the menu */
const mobileNav = $<HTMLElement>('[data-mobile-nav]');
const burger = $<HTMLButtonElement>('[data-burger]');

function openNav() {
  if (!mobileNav || !burger) return;
  body.classList.add('nav-open');
  burger.setAttribute('aria-expanded', 'true');
  burger.setAttribute('aria-label', 'Close menu');
  mobileNav.removeAttribute('inert');
  mobileNav.setAttribute('aria-hidden', 'false');
  $<HTMLElement>('[data-nav-item]', mobileNav)?.focus?.({ preventScroll: true });
}

function closeNav() {
  if (!mobileNav || !burger) return;
  body.classList.remove('nav-open');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Open menu');
  mobileNav.setAttribute('inert', '');
  mobileNav.setAttribute('aria-hidden', 'true');
}

burger?.addEventListener('click', () => {
  body.classList.contains('nav-open') ? closeNav() : openNav();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && body.classList.contains('nav-open')) {
    closeNav();
    burger?.focus();
  }
});

/* --------------------------------------------------- the sliding nav thumb */
const navRoot = $<HTMLElement>('[data-nav]');
const thumb = $<HTMLElement>('[data-nav-thumb]');
const navLinks = $$<HTMLAnchorElement>('[data-nav-link]');

function moveThumb(link: HTMLElement | undefined) {
  if (!navRoot || !thumb || !link) return;
  const a = link.getBoundingClientRect();
  const b = navRoot.getBoundingClientRect();
  thumb.style.width = `${a.width}px`;
  thumb.style.transform = `translateX(${a.left - b.left - 4}px)`;
  thumb.classList.add('is-on');
}

function setActive(id: string) {
  let match: HTMLElement | undefined;
  for (const l of navLinks) {
    const on = l.getAttribute('href') === `#${id}`;
    l.classList.toggle('is-active', on);
    if (on) match = l;
  }
  if (match) moveThumb(match);
}

/* The section you are reading, not the one whose top just went past. */
const sections = $$<HTMLElement>('main section[id]');
if (sections.length) {
  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.01, 0.5] },
  );
  sections.forEach((s) => io.observe(s));
}

window.addEventListener('resize', () => {
  const active = $<HTMLElement>('[data-nav-link].is-active');
  if (active) moveThumb(active);
});

/* ---------------------------------------------------------------- the clock */
/* Dhaka is UTC+6 all year, so this needs no timezone database. */
const clock = $<HTMLElement>('[data-clock]');
if (clock) {
  const tick = () => {
    const now = new Date();
    const dhaka = new Date(now.getTime() + (now.getTimezoneOffset() + 360) * 60000);
    clock.textContent = dhaka.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    });
  };
  tick();
  setInterval(tick, 20000);
}


/* --------------------------------------------------------------- GSAP, later */
/* The tweening layer is not needed to read the page, so it arrives after the
   first paint instead of delaying it. */
/* Wait for the visitor to actually do something, or for the page to go quiet
   for a long stretch. On a throttled phone the old idle-with-timeout fired
   while the hero was still painting, and GSAP's 72 KB landed on the main
   thread during the largest-paint window: 2.2s of script for an effect nobody
   had asked for yet. Interaction-first removes that entirely. */
const whenQuiet = (fn: () => void) => {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    for (const ev of EVENTS) window.removeEventListener(ev, run);
    /* Let the gesture finish first: booting on pointerdown means the chunk
       parses and animates while the button is still being pressed. */
    setTimeout(fn, 220);
  };
  const EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'] as const;
  for (const ev of EVENTS) window.addEventListener(ev, run, { once: true, passive: true });
  /* Worst case: still load eventually, just not during the first paint. */
  setTimeout(run, 2200);
};

whenQuiet(() => {
  void import('./fx').then((m) => m.initFx());
});
