/* =============================================================================
   SYSTEM MAP — a real tablist: one layer open at a time, arrow keys move
   between them, and the panel that opens is the one the tab points at.
   ========================================================================== */

const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="tab"][data-layer]'));
const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-panel]'));

if (tabs.length && panels.length) {
  const select = (index: number, focus = false) => {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });

    panels.forEach((panel) => {
      const on = panel.dataset.panel === tabs[index].dataset.layer;
      panel.hidden = !on;
      if (on) {
        // Restart the entrance animation on the panel that just opened.
        panel.style.animation = 'none';
        void panel.offsetHeight;
        panel.style.animation = '';
      }
    });

    if (focus) tabs[index].focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
  });

  // Arrow keys, Home and End: the pattern users already expect from tabs.
  tabs[0].parentElement?.addEventListener('keydown', (e) => {
    const active = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (active < 0) return;

    const vertical = (e.currentTarget as HTMLElement).getAttribute('aria-orientation') === 'vertical';
    const next = vertical ? 'ArrowDown' : 'ArrowRight';
    const prev = vertical ? 'ArrowUp' : 'ArrowLeft';

    if (e.key === next) {
      e.preventDefault();
      select((active + 1) % tabs.length, true);
    } else if (e.key === prev) {
      e.preventDefault();
      select((active - 1 + tabs.length) % tabs.length, true);
    } else if (e.key === 'Home') {
      e.preventDefault();
      select(0, true);
    } else if (e.key === 'End') {
      e.preventDefault();
      select(tabs.length - 1, true);
    }
  });
}

/* --------------------------------------------------- the trace runs once */
const trace = document.querySelector<HTMLElement>('[data-trace]');
if (trace) {
  const rows = Array.from(trace.querySelectorAll<HTMLElement>('[data-trace-row]'));
  const dots = rows.map((row) => {
    const dot = document.createElement('span');
    dot.className = 'trace__dot';
    dot.setAttribute('aria-hidden', 'true');
    row.append(dot);
    return dot;
  });

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      dots.forEach((dot, i) => {
        dot.style.animationDelay = `${i * 0.28}s`;
        dot.classList.add('is-live');
      });
    },
    { threshold: 0.35 },
  );
  io.observe(trace);
}
