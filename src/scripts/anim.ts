/* =============================================================================
   MOTION — GSAP + ScrollTrigger + Lenis.
   All animation is additive: with reduced motion (or no JS) everything is
   already visible and readable. Nothing is hidden behind a tween.
   ========================================================================== */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const $ = <T extends Element = Element>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel);
const $$ = <T extends Element = Element>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

const body = document.body;
const header = $<HTMLElement>('[data-header]');
const progress = $<HTMLElement>('[data-progress]');
const preloader = $<HTMLElement>('[data-preloader]');

/* -------------------------------------------------------------- hero intro */
/* Defined as a function and placed ABOVE the preloader block so the
   reduced-motion path can call it before later `const`s exist (no TDZ). */
function intro() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('[data-hero-line]', { yPercent: 62, opacity: 0, duration: 1.15, stagger: 0.09 }, 0)
    .from('[data-hero-figure]', { yPercent: 10, opacity: 0, scale: 0.95, duration: 1.3 }, 0.18)
    .from('[data-hero-plate]', { y: 26, opacity: 0, duration: 0.9 }, 0.55)
    .from('[data-hero-line2]', { y: 18, opacity: 0, duration: 0.8 }, 0.5)
    .from('[data-hero-actions] > *', { y: 16, opacity: 0, duration: 0.7, stagger: 0.08 }, 0.62)
    .from('.hero__scroll', { opacity: 0, duration: 0.7 }, 0.8)
    .from('.site-header__bar', { y: -16, opacity: 0, duration: 0.8 }, 0.5);
  return tl;
}

function finishLoad() {
  body.classList.remove('is-loading');
  ScrollTrigger.refresh();
}

/* ------------------------------------------------------------------- Lenis */
let lenis: Lenis | null = null;

if (!reduce) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.6, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* --------------------------------------------------------- anchor scrolling */
$$<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    closeNav();
    const top = (target as HTMLElement).getBoundingClientRect().top + window.scrollY - 64;
    if (lenis) lenis.scrollTo(top, { duration: 1.15 });
    else window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ------------------------------------------------------------ header + nav */
const mobileNav = $<HTMLElement>('.mobile-nav');
const burger = $<HTMLButtonElement>('[data-burger]');

function openNav() {
  if (!mobileNav) return;
  body.classList.add('nav-open');
  mobileNav.setAttribute('aria-hidden', 'false');
  burger?.setAttribute('aria-expanded', 'true');
  burger?.setAttribute('aria-label', 'Close menu');
  lenis?.stop();
}
function closeNav() {
  if (!mobileNav || !body.classList.contains('nav-open')) return;
  body.classList.remove('nav-open');
  mobileNav.setAttribute('aria-hidden', 'true');
  burger?.setAttribute('aria-expanded', 'false');
  burger?.setAttribute('aria-label', 'Open menu');
  lenis?.start();
}
burger?.addEventListener('click', () => {
  body.classList.contains('nav-open') ? closeNav() : openNav();
});
$$('.mobile-nav a').forEach((a) => a.addEventListener('click', closeNav));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeNav();
});

let lastY = 0;
function onScroll(y: number) {
  header?.classList.toggle('is-stuck', y > 24);
  const down = y > lastY;
  header?.classList.toggle('is-hidden', down && y > 420 && !body.classList.contains('nav-open'));
  lastY = y;
  if (progress) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
  }
}
window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
onScroll(window.scrollY);

$$('main [id]').forEach((section) => {
  const link = $(`[data-nav-link][href="#${section.id}"]`);
  if (!link) return;
  ScrollTrigger.create({
    trigger: section,
    start: 'top 55%',
    end: 'bottom 45%',
    onToggle: (self) => link.classList.toggle('is-active', self.isActive),
  });
});

/* ------------------------------------------------------------------ cursor */
if (fine && !reduce) {
  const cursor = $<HTMLElement>('[data-cursor]');
  if (cursor) {
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
    window.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); });
    const hoverSel = 'a, button, [data-open], .card, .mcard, .chip, .ctile';
    document.addEventListener('pointerover', (e) => {
      const t = e.target as Element | null;
      cursor.classList.toggle('is-hover', !!t?.closest?.(hoverSel));
    });
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
  }
}

/* spotlight follow */
if (fine && !reduce) {
  const spot = $<HTMLElement>('[data-spot]');
  if (spot) {
    let raf = 0;
    window.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        spot.style.setProperty('--sx', `${e.clientX}px`);
        spot.style.setProperty('--sy', `${e.clientY}px`);
        raf = 0;
      });
    });
  }
}

/* ---------------------------------------------------------- magnetic buttons */
if (fine && !reduce) {
  $$<HTMLElement>('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ---------------------------------------------------------- scroll reveals */
function reveal(sel: string, opts: gsap.TweenVars = {}) {
  const items = $$(sel);
  if (!items.length || reduce) return;
  items.forEach((el) => {
    gsap.from(el, {
      y: 26, opacity: 0, duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      ...opts,
    });
  });
}

reveal('.sec-head');
reveal('.cap', { y: 34 });
reveal('.work__title', { y: 40 });
reveal('.work__lead', { y: 20 });
reveal('.card', { y: 30, duration: 0.7 });
reveal('.live', { y: 18 });
reveal('.about__title', { y: 30 });
reveal('.about__lead, .about__bio, .about__facts', { y: 18 });
reveal('.about__figure', { y: 40, duration: 1 });
reveal('.xp__row', { y: 16, duration: 0.6 });
reveal('.xp__edu li', { y: 12, duration: 0.5 });
reveal('.toolkit__head > *', { y: 26 });
reveal('.tx', { y: 30, duration: 0.9 });
reveal('.tk', { y: 18 });
reveal('.contact__title', { y: 34 });
reveal('.ctile', { y: 20 });
reveal('.footer__inner > *', { y: 14 });
reveal('.marquee', { y: 18 });

/* parallax */
if (!reduce) {
  const fig = $<HTMLElement>('[data-hero-figure]');
  if (fig) {
    gsap.to(fig, {
      yPercent: -8, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }
  const aura = $<HTMLElement>('[data-hero-aura]');
  if (aura) {
    gsap.to(aura, {
      yPercent: 14, opacity: 0.5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }
}

/* ---------------------------------------------------------------- marquee */
(() => {
  const track = $<HTMLElement>('[data-marquee]');
  const viewport = track?.parentElement;
  if (!track || !viewport) return;

  let tween: gsap.core.Tween | null = null;

  const start = () => {
    tween?.kill();
    gsap.set(track, { x: 0 });
    const half = track.scrollWidth / 2;
    if (half < 20 || reduce) return;
    tween = gsap.to(track, {
      x: -half,
      duration: half / 60,
      ease: 'none',
      repeat: -1,
      modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % half) },
    });
  };

  start();

  const slow = () => tween && gsap.to(tween, { timeScale: 0.15, duration: 0.5 });
  const fast = () => tween && gsap.to(tween, { timeScale: 1, duration: 0.5 });
  viewport.addEventListener('pointerenter', slow);
  viewport.addEventListener('pointerleave', fast);

  let rt = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = window.setTimeout(start, 200);
  });
})();

/* --------------------------------------------------------------- counters */
$$<HTMLElement>('[data-count]').forEach((el) => {
  const end = Number(el.dataset.count ?? '0');
  if (!Number.isFinite(end)) return;
  const plus = el.querySelector('i');
  if (reduce) {
    el.textContent = String(end);
    if (plus) el.append(plus);
    return;
  }
  const obj = { v: 0 };
  ScrollTrigger.create({
    trigger: el,
    start: 'top 92%',
    once: true,
    onEnter: () => {
      gsap.to(obj, {
        v: end, duration: 1.4, ease: 'power2.out',
        onUpdate: () => {
          el.textContent = String(Math.round(obj.v));
          if (plus) el.append(plus);
        },
      });
    },
  });
});

/* -------------------------------------------------------------- card tilt */
if (fine && !reduce) {
  $$<HTMLElement>('[data-card]').forEach((card) => {
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' });
    const img = card.querySelector('img');
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * 7);
      rx(-py * 7);
      if (img) (img as HTMLElement).style.transform = `scale(1.06) translate(${px * -10}px, ${py * -10}px)`;
    });
    card.addEventListener('pointerleave', () => {
      rx(0); ry(0);
      if (img) (img as HTMLElement).style.transform = '';
    });
  });
}

/* ----------------------------------------------------------------- filters */
(() => {
  const deck = $<HTMLElement>('[data-deck]');
  const chips = $$<HTMLButtonElement>('[data-filter]');
  if (!deck || !chips.length) return;

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.filter ?? 'all';
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      $$<HTMLElement>('[data-card]', deck).forEach((card) => {
        const show = key === 'all' || card.dataset.cat === key;
        if (show) {
          card.hidden = false;
          if (reduce) return;
          gsap.fromTo(card,
            { opacity: 0, y: 18, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out', overwrite: true });
        } else {
          card.hidden = true;
        }
      });
      ScrollTrigger.refresh();
    });
  });
})();

/* ------------------------------------------------------------ transmission */
(() => {
  const root = $<HTMLElement>('[data-tx]');
  if (!root) return;

  const slides = $$<HTMLElement>('[data-tx-slide]', root);
  const idxEl = $<HTMLElement>('[data-tx-idx]', root);
  const bar = $<HTMLElement>('[data-tx-bar]', root);
  const playBtn = $<HTMLButtonElement>('[data-tx-play]', root);
  const prevBtn = $<HTMLButtonElement>('[data-tx-prev]', root);
  const nextBtn = $<HTMLButtonElement>('[data-tx-next]', root);
  const rows = $$<HTMLElement>('[data-tx-row]', root);
  if (!slides.length) return;

  const DURATION = 3.6;
  let index = 0;
  let playing = !reduce;
  let barTween: gsap.core.Tween | null = null;

  const rowTweens = rows.map((row, i) =>
    gsap.to(row, {
      xPercent: i % 2 === 0 ? -18 : -8,
      duration: 18 + i * 4,
      ease: 'none', repeat: -1, yoyo: true,
    }),
  );
  if (reduce) rowTweens.forEach((t) => t.pause());

  function restartBar() {
    if (!bar) return;
    barTween?.kill();
    gsap.set(bar, { width: '0%' });
    if (!playing || reduce) return;
    barTween = gsap.to(bar, {
      width: '100%', duration: DURATION, ease: 'none',
      onComplete: () => paint(index + 1, 1),
    });
  }

  const paint = (next: number, dir = 1) => {
    const prev = slides[index];
    index = (next + slides.length) % slides.length;
    const slide = slides[index];

    if (reduce) {
      slides.forEach((s) => s.classList.remove('is-active'));
      slide.classList.add('is-active');
    } else {
      prev.classList.remove('is-active');
      slide.classList.add('is-active');
      const name = slide.querySelector('[data-tx-name]');
      gsap.fromTo(slide,
        { opacity: 0, y: 18 * dir },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', overwrite: true });
      if (name) {
        gsap.fromTo(name,
          { yPercent: 42, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
          { yPercent: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'power4.out' });
      }
    }
    if (idxEl) idxEl.textContent = String(index + 1).padStart(2, '0');
    restartBar();
  };

  const toggle = (force?: boolean) => {
    playing = force ?? !playing;
    playBtn?.setAttribute('aria-pressed', playing ? 'false' : 'true');
    playBtn?.setAttribute('aria-label', playing ? 'Pause autoplay' : 'Play autoplay');
    if (playing) restartBar();
    else {
      barTween?.kill();
      gsap.to(bar, { width: '0%', duration: 0.3 });
    }
  };

  prevBtn?.addEventListener('click', () => paint(index - 1, -1));
  nextBtn?.addEventListener('click', () => paint(index + 1, 1));
  playBtn?.addEventListener('click', () => toggle());

  root.addEventListener('pointerenter', () => playing && barTween?.pause());
  root.addEventListener('pointerleave', () => playing && barTween?.resume());

  ScrollTrigger.create({ trigger: root, start: 'top 85%', once: true, onEnter: () => restartBar() });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) barTween?.pause();
    else if (playing) barTween?.resume();
  });
})();

/* ------------------------------------------------------------ project dialog */
(() => {
  const dialog = $<HTMLElement>('[data-dialog]');
  if (!dialog) return;

  const dataEl = document.getElementById('project-data');
  type Entry = {
    key: string; title: string; catLabel: string; image: string; tags: string[]; link: string | null;
    caseStudy: {
      sub: string; problem: string; did: string[]; changed: string;
      role: string; timeline: string; status: string; client: string;
    };
  };
  let data: Entry[] = [];
  try { data = JSON.parse(dataEl?.textContent ?? '[]') as Entry[]; } catch { data = []; }

  const panel = $<HTMLElement>('.dialog__panel', dialog);
  const f = {
    img: $<HTMLImageElement>('[data-dlg-img]', dialog),
    cat: $<HTMLElement>('[data-dlg-cat]', dialog),
    title: $<HTMLElement>('[data-dlg-title]', dialog),
    sub: $<HTMLElement>('[data-dlg-sub]', dialog),
    role: $<HTMLElement>('[data-dlg-role]', dialog),
    client: $<HTMLElement>('[data-dlg-client]', dialog),
    time: $<HTMLElement>('[data-dlg-time]', dialog),
    status: $<HTMLElement>('[data-dlg-status]', dialog),
    problem: $<HTMLElement>('[data-dlg-problem]', dialog),
    changed: $<HTMLElement>('[data-dlg-changed]', dialog),
    did: $<HTMLElement>('[data-dlg-did]', dialog),
    tags: $<HTMLElement>('[data-dlg-tags]', dialog),
    link: $<HTMLAnchorElement>('[data-dlg-link]', dialog),
  };

  let lastFocus: HTMLElement | null = null;

  const open = (key: string) => {
    const p = data.find((d) => d.key === key);
    if (!p) return;
    lastFocus = document.activeElement as HTMLElement;

    if (f.img) { f.img.src = p.image; f.img.alt = `${p.title} — case study preview`; }
    if (f.cat) f.cat.textContent = p.catLabel;
    if (f.title) f.title.textContent = p.title;
    if (f.sub) f.sub.textContent = p.caseStudy.sub;
    if (f.role) f.role.textContent = p.caseStudy.role;
    if (f.client) f.client.textContent = p.caseStudy.client;
    if (f.time) f.time.textContent = p.caseStudy.timeline;
    if (f.status) f.status.textContent = p.caseStudy.status;
    if (f.problem) f.problem.textContent = p.caseStudy.problem;
    if (f.changed) f.changed.textContent = p.caseStudy.changed;
    if (f.did) f.did.innerHTML = p.caseStudy.did.map((d) => `<li>${d}</li>`).join('');
    if (f.tags) f.tags.innerHTML = p.tags.map((t) => `<span>${t}</span>`).join('');

    if (f.link) {
      if (p.link) { f.link.href = p.link; f.link.hidden = false; }
      else { f.link.hidden = true; }
    }

    dialog.classList.add('is-open');
    dialog.setAttribute('aria-hidden', 'false');
    body.classList.add('is-locked');
    lenis?.stop();
    panel?.scrollTo({ top: 0 });
    if (!reduce) gsap.fromTo(panel, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' });
    window.setTimeout(() => $<HTMLElement>('.dialog__close', dialog)?.focus(), 60);
  };

  const close = () => {
    if (!dialog.classList.contains('is-open')) return;
    dialog.classList.remove('is-open');
    dialog.setAttribute('aria-hidden', 'true');
    body.classList.remove('is-locked');
    if (!body.classList.contains('nav-open')) lenis?.start();
    lastFocus?.focus?.();
  };

  $$<HTMLElement>('[data-open]').forEach((btn) =>
    btn.addEventListener('click', () => open(btn.dataset.open ?? '')));
  $$<HTMLElement>('[data-dialog-close]', dialog).forEach((el) =>
    el.addEventListener('click', close));

  document.addEventListener('keydown', (e) => {
    if (!dialog.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab' && panel) {
      const focusable = $$<HTMLElement>('a[href], button:not([hidden]), [tabindex]:not([tabindex="-1"])', panel)
        .filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();

ScrollTrigger.refresh();

/* ------------------------------------------------------- preloader sequence */
if (preloader) {
  if (reduce) {
    preloader.classList.add('is-done');
    finishLoad();
    intro().progress(1).kill();
  } else {
    const count = $<HTMLElement>('[data-preloader-count]', preloader);
    const bar = $<HTMLElement>('[data-preloader-bar]', preloader);
    const state = { v: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        preloader.classList.add('is-done');
        finishLoad();
        intro();
      },
    });

    tl.to(state, {
      v: 100, duration: 1.15, ease: 'power2.inOut',
      onUpdate: () => { if (count) count.textContent = String(Math.round(state.v)).padStart(2, '0'); },
    })
      .to(bar, { width: '100%', duration: 1.15, ease: 'power2.inOut' }, 0)
      .to('.preloader__name', { y: -18, opacity: 0, duration: 0.5, ease: 'power2.in' }, 1.05)
      .to('.preloader__meta, .preloader__bar', { opacity: 0, duration: 0.3 }, 1.05)
      .to(preloader, { yPercent: -101, duration: 0.85, ease: 'power4.inOut' }, 1.15)
      .add(() => { body.classList.remove('is-loading'); ScrollTrigger.refresh(); }, 1.3);
  }
} else {
  finishLoad();
  if (!reduce) intro();
}
