/* =============================================================================
   WORK — the deck, the filter chips, and the case-study sheet.

   The deck is a scroll-driven stack: each card waits below the fold, rises as
   its slice of the scroll budget is spent, and recedes behind the one after it.
   On a narrow screen (or with motion off) it is a plain list of cards, so the
   work is never locked behind an effect.
   ========================================================================== */

import { calmOn } from './motion';

type Project = {
  key: string;
  title: string;
  category: string;
  catLabel: string;
  year: string;
  metric: string;
  link: string | null;
  image: string;
  tags: string[];
  caseStudy: {
    sub: string;
    problem: string;
    did: string[];
    changed: string;
    role: string;
    timeline: string;
    status: string;
    client: string;
  };
};

const payload = document.getElementById('project-data');
const projects: Project[] = payload ? JSON.parse(payload.textContent ?? '[]') : [];
const byKey = new Map(projects.map((p) => [p.key, p]));

/* ================================================================== FILTERS */
const chips = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-filter]'));
const deckEl = document.querySelector<HTMLElement>('[data-deck]');
const allCards = Array.from(document.querySelectorAll<HTMLElement>('[data-card]'));
const posEl = document.querySelector<HTMLElement>('[data-deck-pos]');
const totalEl = document.querySelector<HTMLElement>('[data-deck-total]');

let cards: HTMLElement[] = allCards.slice();

/* ==================================================================== DECK */
const wide = window.matchMedia('(min-width: 960px)');

let raf = 0;
let deckTop = 0;
let deckRange = 1;

function isDeckMode(): boolean {
  return wide.matches && !calmOn() && cards.length > 1;
}

function measure() {
  if (!deckEl) return;
  // The scroll budget: one screen to hold the first card, then a slice per card.
  const slice = Math.round(window.innerHeight * 0.62);
  deckEl.style.height = `${window.innerHeight + Math.max(cards.length - 1, 1) * slice}px`;

  const rect = deckEl.getBoundingClientRect();
  deckTop = rect.top + window.scrollY;
  deckRange = Math.max(deckEl.offsetHeight - window.innerHeight, 1);
}

function paint() {
  raf = 0;
  if (!isDeckMode()) return;

  const p = Math.min(Math.max((window.scrollY - deckTop) / deckRange, 0), 1);
  const n = cards.length - 1;
  const pos = p * n;

  cards.forEach((card, i) => {
    const d = i - pos;

    if (d >= 0) {
      // Parked below the frame. Expressed as a percentage of the card's own
      // height, because that is what transform percentages resolve against.
      // Half the viewport + half the card + a margin clears the bottom edge.
      const h = card.offsetHeight || 1;
      const clear = ((window.innerHeight / 2 + h / 2 + 24) / h) * 100;
      card.style.transform = `translate3d(0, ${Math.min(d, 1) * clear}%, 0)`;
      card.style.opacity = '1';
      card.style.filter = 'none';
    } else {
      // Already read: shrink a little and let the next card cover it.
      const back = Math.min(-d, 2.2);
      card.style.transform = `translate3d(0, ${-back * 1.1}%, 0) scale(${1 - back * 0.03})`;
      card.style.opacity = '1';
      card.style.filter = 'none';
    }
  });

  const shown = Math.min(Math.round(pos) + 1, cards.length);
  if (posEl) posEl.textContent = String(shown).padStart(2, '0');
}

function schedule() {
  if (raf) return;
  raf = requestAnimationFrame(paint);
}

function reset() {
  for (const card of allCards) {
    card.style.transform = '';
    card.style.opacity = '';
    card.style.filter = '';
  }
}

function rebuild() {
  cards = allCards.filter((c) => !c.classList.contains('is-filtered'));
  if (totalEl) totalEl.textContent = String(cards.length).padStart(2, '0');
  allCards.forEach((c) => c.classList.toggle('is-hidden-deck', c.classList.contains('is-filtered')));

  // Static mode: hidden cards simply leave the flow.
  allCards.forEach((c) => c.toggleAttribute('hidden', c.classList.contains('is-filtered')));

  if (isDeckMode()) {
    allCards.forEach((c) => c.removeAttribute('hidden'));
    measure();
    paint();
  } else {
    reset();
    cards.forEach((c, i) => c.setAttribute('style', `--i:${i};z-index:${i + 1}`));
  }
}

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const cat = chip.dataset.filter ?? 'all';
    chips.forEach((c) => {
      const on = c === chip;
      c.setAttribute('aria-pressed', String(on));
      c.classList.toggle('is-on', on);
    });
    allCards.forEach((card) => {
      card.classList.toggle('is-filtered', cat !== 'all' && card.dataset.cat !== cat);
    });
    rebuild();
    if (deckEl && isDeckMode()) {
      window.scrollTo({ top: deckTop - 40, behavior: 'smooth' });
    }
  });
});

/* Deferred: the deck is far below the fold, and measuring it during the first
   paint is worth nothing to the visitor. */
const idle = (fn: () => void) =>
  'requestIdleCallback' in window ? window.requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 200);

if (deckEl && wide.matches) idle(() => { measure(); paint(); });

window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', () => {
  if (!isDeckMode()) {
    reset();
    return;
  }
  measure();
  paint();
});

wide.addEventListener('change', () => {
  if (isDeckMode()) {
    allCards.forEach((c) => c.removeAttribute('hidden'));
    measure();
    paint();
  } else {
    reset();
    allCards.forEach((c) => c.toggleAttribute('hidden', c.classList.contains('is-filtered')));
  }
});

/* A late font or image can change the deck's height after first measure. */
if (document.fonts?.ready) void document.fonts.ready.then(() => isDeckMode() && measure());
window.addEventListener('load', () => { if (isDeckMode()) idle(measure); });

/* ============================================================ CASE STUDY */
const sheet = document.querySelector<HTMLElement>('[data-dialog]');
const panel = sheet?.querySelector<HTMLElement>('.sheet__panel');

const setText = (sel: string, value: string) => {
  const el = document.querySelector<HTMLElement>(sel);
  if (el) el.textContent = value;
};

let lastFocused: HTMLElement | null = null;

function openSheet(key: string) {
  const p = byKey.get(key);
  if (!p || !sheet) return;

  lastFocused = document.activeElement as HTMLElement | null;

  const img = document.querySelector<HTMLImageElement>('[data-dlg-img]');
  if (img) {
    img.src = p.image;
    img.alt = `${p.title} — preview`;
  }

  setText('[data-dlg-cat]', p.catLabel);
  setText('[data-dlg-title]', p.title);
  setText('[data-dlg-sub]', p.caseStudy.sub);
  setText('[data-dlg-problem]', p.caseStudy.problem);
  setText('[data-dlg-changed]', p.caseStudy.changed);
  setText('[data-dlg-role]', p.caseStudy.role);
  setText('[data-dlg-client]', p.caseStudy.client);
  setText('[data-dlg-time]', p.caseStudy.timeline);
  setText('[data-dlg-status]', p.caseStudy.status);

  const did = document.querySelector<HTMLElement>('[data-dlg-did]');
  if (did) {
    did.replaceChildren(
      ...p.caseStudy.did.map((line) => {
        const li = document.createElement('li');
        li.textContent = line;
        return li;
      }),
    );
  }

  const link = document.querySelector<HTMLAnchorElement>('[data-dlg-link]');
  if (link) {
    if (p.link) {
      link.href = p.link;
      link.hidden = false;
    } else {
      link.hidden = true;
      link.removeAttribute('href');
    }
  }

  sheet.classList.add('is-open');
  sheet.setAttribute('aria-hidden', 'false');
  sheet.removeAttribute('inert');
  document.body.classList.add('is-locked');
  panel?.scrollTo({ top: 0 });
  sheet.querySelector<HTMLElement>('[data-dialog-close]')?.focus();
}

function closeSheet() {
  if (!sheet) return;
  sheet.classList.remove('is-open');
  sheet.setAttribute('aria-hidden', 'true');
  sheet.setAttribute('inert', '');
  document.body.classList.remove('is-locked');
  lastFocused?.focus?.();
}

document.querySelectorAll<HTMLElement>('[data-open]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.open;
    if (key) openSheet(key);
  });
});

sheet?.querySelectorAll<HTMLElement>('[data-dialog-close]').forEach((btn) => {
  btn.addEventListener('click', closeSheet);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sheet?.classList.contains('is-open')) {
    e.preventDefault();
    closeSheet();
  }
});

/* A small trap, so Tab cannot wander into the page behind the sheet. */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab' || !sheet?.classList.contains('is-open')) return;
  const focusable = sheet.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});
