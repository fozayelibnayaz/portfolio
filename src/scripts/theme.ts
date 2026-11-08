/* =============================================================================
   THEME — light by default, dark on request, remembered after that.

   The <head> already set the attribute before first paint (see Base.astro);
   this only handles the switch and keeps the button's state honest.
   ========================================================================== */

type Theme = 'light' | 'dark';

const KEY = 'fia:theme';
const root = document.documentElement;
const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');

const current = (): Theme => (root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

function paint(theme: Theme) {
  root.setAttribute('data-theme', theme);
  if (button) {
    const dark = theme === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    button.title = dark ? 'Light theme' : 'Dark theme';
  }
  window.dispatchEvent(new CustomEvent('fia:theme', { detail: theme }));
}

function store(theme: Theme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* Private mode: the choice just will not survive the tab. */
  }
}

paint(current());

button?.addEventListener('click', () => {
  const next: Theme = current() === 'dark' ? 'light' : 'dark';
  paint(next);
  store(next);
});

/* Follow the OS if the visitor has never picked a side. */
const media = window.matchMedia('(prefers-color-scheme: dark)');
media.addEventListener('change', (e) => {
  let hasChoice = false;
  try {
    hasChoice = localStorage.getItem(KEY) !== null;
  } catch {
    /* ignore */
  }
  if (!hasChoice) paint(e.matches ? 'dark' : 'light');
});
