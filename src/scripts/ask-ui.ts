/* =============================================================================
   ASK UI — the ⌘K palette. All the ranking lives in src/lib/ask.ts; this file
   only moves focus, renders results and decides where a choice goes.
   ========================================================================== */

import { buildIndex, highlight, search, summarise, type Doc, type Hit } from 'src/lib/ask';

const root = document.querySelector<HTMLElement>('[data-ask]');
const input = document.querySelector<HTMLInputElement>('[data-ask-input]');
const list = document.querySelector<HTMLElement>('[data-ask-list]');
const empty = document.querySelector<HTMLElement>('[data-ask-empty]');
const countEl = document.querySelector<HTMLElement>('[data-ask-count]');
const triggers = Array.from(document.querySelectorAll<HTMLElement>('[data-ask-open]'));

if (root && input && list) {
  /* Bind to non-nullable locals: TypeScript cannot carry the guard's narrowing
     into the closures below, and a `!` on every other line is worse reading. */
  const askRoot: HTMLElement = root;
  const askInput: HTMLInputElement = input;
  const askList: HTMLElement = list;

  const raw = document.getElementById('ask-corpus')?.textContent ?? '[]';
  const docs: Doc[] = JSON.parse(raw);
  const index = buildIndex(docs);

  let hits: Hit[] = [];
  let active = -1;
  let previouslyFocused: HTMLElement | null = null;

  const isOpen = () => askRoot.classList.contains('is-open');

  function open(seed = '') {
    previouslyFocused = document.activeElement as HTMLElement | null;
    askRoot.classList.add('is-open');
    askRoot.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    askInput.value = seed;
    run();
    window.setTimeout(() => {
      askInput.focus();
      askInput.select();
    }, 40);
  }

  function close() {
    askRoot.classList.remove('is-open');
    askRoot.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    previouslyFocused?.focus?.();
  }

  function setActive(i: number) {
    active = i;
    const items = Array.from(askList.querySelectorAll<HTMLElement>('[data-ask-item]'));
    items.forEach((el, n) => {
      const on = n === i;
      el.classList.toggle('is-active', on);
      if (on) {
        askInput.setAttribute('aria-activedescendant', el.id);
        el.scrollIntoView({ block: 'nearest' });
      }
    });
    if (i < 0) askInput.removeAttribute('aria-activedescendant');
  }

  function renderName(title: string, terms: string[]): DocumentFragment {
    const frag = document.createDocumentFragment();
    for (const part of highlight(title, terms)) {
      if (part.hit) {
        const mark = document.createElement('mark');
        mark.textContent = part.text;
        frag.append(mark);
      } else {
        frag.append(document.createTextNode(part.text));
      }
    }
    return frag;
  }

  function go(hit: Hit) {
    const { doc } = hit;

    if (doc.kind === 'project') {
      const key = doc.id.replace('project:', '');
      const opener = document.querySelector<HTMLElement>(`[data-open="${key}"]`);
      close();
      if (opener) {
        opener.click();
      } else {
        location.hash = '#work';
      }
      return;
    }

    if (doc.kind === 'role') {
      close();
      location.hash = '#experience';
      return;
    }

    if (doc.href?.startsWith('#')) {
      close();
      const target = document.querySelector<HTMLElement>(doc.href);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', doc.href);
      return;
    }

    if (doc.href) {
      close();
      window.open(doc.href, '_blank', 'noopener,noreferrer');
      return;
    }

    close();
    location.hash = '#skills';
  }

  function render() {
    askList.replaceChildren();

    hits.forEach((hit, i) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'ask__item';
      el.id = `ask-item-${i}`;
      el.setAttribute('role', 'option');
      el.setAttribute('aria-selected', 'false');
      el.dataset.askItem = '';
      el.tabIndex = -1;

      const kind = document.createElement('span');
      kind.className = 'ask__kind';
      kind.dataset.kind = hit.doc.kind;
      kind.textContent = hit.doc.kind;

      const text = document.createElement('span');
      text.className = 'ask__text';

      const name = document.createElement('span');
      name.className = 'ask__name';
      name.append(renderName(hit.doc.title, hit.matched));

      const why = document.createElement('span');
      why.className = 'ask__why';
      why.textContent = hit.matched.length
        ? `matched ${hit.matched.slice(0, 3).join(', ')}${hit.doc.meta ? ` · ${hit.doc.meta}` : ''}`
        : (hit.doc.meta ?? '');

      text.append(name, why);

      const arrow = document.createElement('span');
      arrow.className = 'ask__go';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↵';

      el.append(kind, text, arrow);
      el.addEventListener('click', () => go(hit));
      el.addEventListener('pointermove', () => setActive(i));

      askList.append(el);
    });

    empty?.toggleAttribute('hidden', hits.length > 0);
    if (countEl) {
      countEl.textContent = hits.length
        ? `${hits.length}${hits.length === 8 ? '+' : ''} · ${summarise(hits)}`
        : 'no matches';
    }
    setActive(hits.length ? 0 : -1);
  }

  function run() {
    const result = search(index, askInput.value, 8);
    hits = result.hits;
    render();
  }

  askInput.addEventListener('input', run);

  askInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(hits.length ? (active + 1) % hits.length : -1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(hits.length ? (active - 1 + hits.length) % hits.length : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = hits[active] ?? hits[0];
      if (hit) go(hit);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      e.preventDefault();
    }
  });

  triggers.forEach((t) => t.addEventListener('click', () => open()));

  document.querySelectorAll<HTMLButtonElement>('[data-ask-try]').forEach((btn) => {
    btn.addEventListener('click', () => {
      askInput.value = btn.dataset.askTry ?? '';
      run();
      askInput.focus();
    });
  });

  document.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if ((e.metaKey || e.ctrlKey) && k === 'k') {
      e.preventDefault();
      isOpen() ? close() : open();
      return;
    }
    if (e.key === 'Escape' && isOpen()) {
      e.preventDefault();
      close();
      return;
    }
    /* "/" is the shortcut people try first. */
    if (k === '/' && !isOpen()) {
      const el = document.activeElement;
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
      if (!typing) {
        e.preventDefault();
        open();
      }
    }
  });

  askRoot.addEventListener('click', (e) => {
    if (e.target === root) close();
  });
}
