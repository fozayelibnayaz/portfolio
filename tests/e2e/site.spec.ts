import { expect, test, type Page } from '@playwright/test';

/* =============================================================================
   E2E — what a visitor can actually do, on desktop and on a phone.
   Every test starts from a fresh load so no state leaks between them.
   ========================================================================== */

/** The palette is the fastest path to any project. */
async function openAsk(page: Page) {
  await page.keyboard.press('Control+k');
  await expect(page.locator('[data-ask]')).toHaveClass(/is-open/);
}

async function typeAsk(page: Page, query: string) {
  await page.locator('[data-ask-input]').fill(query);
  await expect(page.locator('.ask__item').first()).toBeVisible();
}

test.beforeEach(async ({ context }) => {
  // Every run starts on the light theme, whatever the OS says.
  await context.addInitScript(() => {
    try {
      if (!localStorage.getItem('fia:theme')) localStorage.setItem('fia:theme', 'light');
    } catch {
      /* storage blocked — the site defaults to light anyway */
    }
  });
});

test.describe('load & structure', () => {
  test('renders with no page errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Fozayel');
    expect(errors).toEqual([]);
  });

  test('every section is on the page and painted', async ({ page }) => {
    await page.goto('/');
    const sections = await page.evaluate(() =>
      ['work', 'stack', 'lab', 'repos', 'about', 'experience', 'contact'].map((id) => {
        const el = document.getElementById(id);
        return {
          id,
          text: el ? (el as HTMLElement).innerText.trim().length : 0,
          height: el ? Math.round(el.getBoundingClientRect().height) : 0,
        };
      }),
    );
    for (const s of sections) {
      expect(s.text, `#${s.id} rendered no text`).toBeGreaterThan(40);
      expect(s.height, `#${s.id} has no height`).toBeGreaterThan(200);
    }
  });

  test('nothing overflows horizontally at any width', async ({ page }) => {
    await page.goto('/');
    for (const width of [320, 375, 414, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(220);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(1);
    }
  });

  test('the hero clock shows Dhaka time', async ({ page }) => {
    await page.goto('/');
    const clock = page.locator('[data-clock]');
    await expect(clock).toHaveText(/^\d{2}:\d{2}$/);
    const shown = await clock.innerText();
    const expected = await page.evaluate(() => {
      const now = new Date();
      const dhaka = new Date(now.getTime() + (now.getTimezoneOffset() + 360) * 60000);
      return dhaka.toISOString().slice(11, 16);
    });
    expect(shown).toBe(expected);
  });

  test('the dial places five stack layers around the portrait', async ({ page }) => {
    await page.goto('/');
    const nodes = page.locator('[data-dial-node]');
    await expect(nodes).toHaveCount(5);
    const positions = await nodes.evaluateAll((els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
      }),
    );
    // All five sit on one ring: equal distance from their own centroid.
    const cx = positions.reduce((n, p) => n + p.x, 0) / positions.length;
    const cy = positions.reduce((n, p) => n + p.y, 0) / positions.length;
    const radii = positions.map((p) => Math.hypot(p.x - cx, p.y - cy));
    const spread = Math.max(...radii) - Math.min(...radii);
    expect(spread).toBeLessThan(30);
  });
});

test.describe('presence around the page', () => {
  test('the header sticks and reports progress', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(400);
    await expect(page.locator('[data-header]')).toHaveClass(/is-stuck/);

    const scale = await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>('[data-progress]');
      return el ? el.style.transform : '';
    });
    expect(scale).toMatch(/scaleX\(0\.\d+/);
  });

  test('the nav thumb follows the section you are reading', async ({ page }) => {
    await page.goto('/');
    await page.locator('#lab').scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    const active = await page.locator('.nav__link.is-active').innerText();
    expect(active.toLowerCase()).toContain('lab');
  });

  test('a section link scrolls and updates the hash', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hero__actions a[href="#work"]').click();
    await page.waitForTimeout(1200);
    expect(page.url()).toContain('#work');
  });
});

test.describe('gallery deck', () => {
  test('the deck advances as you scroll', async ({ page }) => {
    await page.goto('/');
    /* Below 960px the deck deliberately becomes a plain stack of cards. */
    test.skip((page.viewportSize()?.width ?? 0) < 960, 'static stack on narrow screens');
    const deckTop = await page.evaluate(() => {
      const el = document.querySelector('[data-deck]')!;
      return el.getBoundingClientRect().top + window.scrollY;
    });
    const before = await page.locator('[data-card]').first().evaluate((e) => (e as HTMLElement).style.transform);

    await page.evaluate((y) => window.scrollTo(0, y + 1400), deckTop);
    await page.waitForTimeout(500);

    const after = await page.locator('[data-card]').first().evaluate((e) => (e as HTMLElement).style.transform);
    expect(after).not.toBe(before);
    const pos = Number(await page.locator('[data-deck-pos]').innerText());
    expect(pos).toBeGreaterThan(1);
  });

  test('the filters narrow the deck', async ({ page }) => {
    await page.goto('/');
    const all = await page.locator('[data-card]').count();
    await page.locator('[data-filter="store"]').click();
    await page.waitForTimeout(400);
    const visible = await page.locator('[data-card]:visible').count();
    expect(visible).toBeLessThan(all);
    expect(visible).toBeGreaterThan(0);
    await expect(page.locator('[data-filter="store"]')).toHaveAttribute('aria-pressed', 'true');

    await page.locator('[data-filter="all"]').click();
    await page.waitForTimeout(400);
    expect(await page.locator('[data-card]:visible').count()).toBe(all);
  });

  test('a card opens its case study and Escape closes it', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-open]').first().click();
    await expect(page.locator('[data-dialog]')).toHaveClass(/is-open/);
    await expect(page.locator('[data-dlg-title]')).not.toBeEmpty();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-dialog]')).not.toHaveClass(/is-open/);
    await expect(page.locator('[data-dialog]')).toHaveAttribute('inert', '');
  });

  test('every live link is a real https URL', async ({ page }) => {
    await page.goto('/');
    const hrefs = await page.locator('.links__a').evaluateAll((els) =>
      els.map((e) => (e as HTMLAnchorElement).href),
    );
    expect(hrefs.length).toBeGreaterThan(5);
    for (const h of hrefs) expect(h.startsWith('https://')).toBe(true);
  });
});

test.describe('system map', () => {
  test('clicking a layer opens exactly one panel', async ({ page }) => {
    await page.goto('/');
    const panels = page.locator('[data-panel]');
    await expect(panels).toHaveCount(5);
    await expect(page.locator('[data-panel]:visible')).toHaveCount(1);

    await page.locator('[role="tab"]', { hasText: 'Infra' }).click();
    await page.waitForTimeout(200);
    await expect(page.locator('[data-panel]:visible')).toHaveCount(1);
    await expect(page.locator('[data-panel="infra"]')).toBeVisible();
    await expect(page.locator('#layer-tab-infra')).toHaveAttribute('aria-selected', 'true');
  });

  test('arrow keys move between layers', async ({ page }) => {
    await page.goto('/');
    await page.locator('#layer-tab-interface').focus();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(150);
    await expect(page.locator('#layer-tab-logic')).toBeFocused();
    await expect(page.locator('[data-panel="logic"]')).toBeVisible();
  });
});

test.describe('query lab', () => {
  test('ships its first result, then runs the query in the tab', async ({ page }) => {
    await page.goto('/');
    /* The first table is computed at build time by the same engine, so it is
       already there before any JavaScript runs. */
    await expect(page.locator('[data-lab-table] tbody tr')).toHaveCount(8);
    await expect(page.locator('[data-lab-timing]')).toHaveText(/build · 8 rows/);

    await page.locator('[data-lab-run]').click();
    await expect(page.locator('[data-lab-timing]')).toHaveText(/\d+\.\d{2} ms · 8 rows/);
    await expect(page.locator('[data-lab-status]')).toContainText(/returned in \d+\.\d{2} ms/);
  });

  test('an example chip replaces the query and runs it', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-lab-example="1"]').click();
    await page.waitForTimeout(250);
    await expect(page.locator('#lab-sql')).toHaveValue(/GROUP BY category/);
    const rows = page.locator('[data-lab-table] tbody tr');
    await expect(rows).toHaveCount(4);
    await expect(page.locator('[data-lab-table] thead th').first()).toHaveText('category');
  });

  test('bad SQL is rejected with a readable message', async ({ page }) => {
    await page.goto('/');
    await page.locator('#lab-sql').fill('DELETE FROM projects');
    await page.locator('[data-lab-run]').click();
    await expect(page.locator('[data-lab-error]')).toBeVisible();
    await expect(page.locator('[data-lab-error]')).toContainText('Only SELECT');
  });

  test('keyboard shortcut runs the query', async ({ page }) => {
    await page.goto('/');
    await page.locator('#lab-sql').fill('SELECT title FROM projects LIMIT 2');
    await page.locator('#lab-sql').press('Control+Enter');
    await expect(page.locator('[data-lab-table] tbody tr')).toHaveCount(2);
  });
});

test.describe('theme switch', () => {
  test('flips the theme, reports state and persists', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const toggle = page.locator('[data-theme-toggle]');

    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await toggle.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme');

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  test('the dark theme really changes the palette', async ({ page }) => {
    await page.goto('/');
    const read = () =>
      page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const light = await read();
    await page.locator('[data-theme-toggle]').click();
    await page.waitForTimeout(300);
    const dark = await read();
    expect(dark).not.toBe(light);
  });
});

test.describe('contact form', () => {
  test('refuses to send an empty form and says which field', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-contact-form] button[type="submit"]').click();
    await expect(page.locator('[data-err="name"]')).toBeVisible();
    await expect(page.locator('[data-err="email"]')).toBeVisible();
    await expect(page.locator('[data-err="message"]')).toBeVisible();
    await expect(page.locator('#cf-name')).toHaveAttribute('aria-invalid', 'true');
  });

  test('accepts a filled form and composes a mailto', async ({ page }) => {
    await page.goto('/');
    await page.locator('#cf-name').fill('Rina');
    await page.locator('#cf-email').fill('rina@studio.test');
    await page.locator('#cf-msg').fill('We need a store for our ceramics, launching in March.');
    await expect(page.locator('[data-count-for="msg"]')).toHaveText(/\d+ \/ 800/);

    const navigated = page.waitForEvent('framenavigated', { timeout: 3000 }).catch(() => null);
    await page.locator('[data-contact-form] button[type="submit"]').click();
    await expect(page.locator('[data-form-status]')).toContainText(/mail app/i);
    await navigated;

    const url = page.url();
    if (url.startsWith('mailto:')) {
      expect(decodeURIComponent(url)).toContain('rina@studio.test');
    }
  });

  test('the contact section carries a real form, not just an address', async ({ page }) => {
    await page.goto('/');
    const form = page.locator('#contact form');
    await expect(form).toBeVisible();
    await expect(form.locator('input[type="email"]')).toBeVisible();
    await expect(form.locator('textarea')).toBeVisible();
  });
});

test.describe('repositories', () => {
  test('every public repo is on the page, dealt into pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-repo]')).toHaveCount(50);

    // pages partition the set: every repo is in exactly one page
    const partition = await page.evaluate(() => {
      const pages = Array.from(document.querySelectorAll('[data-page]'));
      const sizes = pages.map((p) => p.querySelectorAll('[data-repo]').length);
      return { pages: pages.length, sizes, total: sizes.reduce((a, b) => a + b, 0) };
    });
    expect(partition.total).toBe(50);
    expect(partition.pages).toBeGreaterThan(1);
    // no page is empty, and every repo is numbered straight through 01..50
    expect(Math.min(...partition.sizes)).toBeGreaterThan(0);

    const idx = await page
      .locator('.rtile__idx')
      .evaluateAll((els) => els.map((e) => Number(e.textContent)));
    expect(idx).toHaveLength(50);
    expect(Math.min(...idx)).toBe(1);
    expect(Math.max(...idx)).toBe(50);
    expect(new Set(idx).size).toBe(50);
  });

  test('every repo links to its own GitHub page', async ({ page }) => {
    await page.goto('/');
    const links = await page.locator('.rtile__link').evaluateAll((els) =>
      els.map((e) => (e as HTMLAnchorElement).href),
    );
    expect(links).toHaveLength(50);
    for (const href of links) {
      expect(href.startsWith('https://github.com/fozayelibnayaz/')).toBe(true);
    }
    // and they are all distinct
    expect(new Set(links).size).toBe(50);
  });

  test('the gallery is paged, and every frame is inside a page', async ({ page }) => {
    await page.goto('/');
    const viewport = page.locator('[data-pager-viewport]');
    await expect(viewport).toHaveCount(1);
    // reachable by keyboard, which is what axe looks for in a scroller
    await expect(viewport).toHaveAttribute('tabindex', '0');

    const pages = await page.locator('[data-page]').count();
    expect(pages).toBeGreaterThan(1);

    const inside = await page.evaluate(() => {
      const v = document.querySelector('[data-pager-viewport]') as HTMLElement;
      return Array.from(document.querySelectorAll('[data-repo]')).every((f) => v.contains(f));
    });
    expect(inside).toBe(true);

    // every repo appears exactly once, across all pages
    const names = await page.locator('[data-repo]').evaluateAll((els) =>
      els.map((e) => (e as HTMLElement).dataset.repo),
    );
    expect(new Set(names).size).toBe(50);
  });

  test('page buttons, arrows and keyboard all move the deck', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/');
    await page.locator('#repos').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    const now = page.locator('[data-page-now]');
    const left = () => page.evaluate(() => (document.querySelector('[data-pager-viewport]') as HTMLElement).scrollLeft);

    await expect(now).toHaveText('01');

    await page.locator('[data-page-next]').click();
    await page.waitForTimeout(800);
    await expect(now).toHaveText('02');
    expect(await left()).toBeGreaterThan(100);

    await page.locator('[data-page-go="4"]').click();
    await page.waitForTimeout(900);
    await expect(now).toHaveText('04');
    await expect(page.locator('.pager__num[aria-current="page"]')).toHaveText('04');

    await page.locator('[data-page-prev]').click();
    await page.waitForTimeout(800);
    await expect(now).toHaveText('03');

    await page.locator('[data-pager-viewport]').focus();
    await page.keyboard.press('End');
    await page.waitForTimeout(900);
    const total = String(await page.locator('[data-page]').count()).padStart(2, '0');
    await expect(now).toHaveText(total);
  });

  test('the deck never widens the page', async ({ page }) => {
    /* Four full page loads, so this one needs more than the default budget. */
    test.setTimeout(90_000);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await page.waitForTimeout(300);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `page overflow at ${width}px`).toBeLessThanOrEqual(0);
    }
  });

  test('live badges sit inside their own tile', async ({ page }) => {
    await page.goto('/');
    const outside = await page.evaluate(() => {
      let bad = 0;
      document.querySelectorAll('.rtile').forEach((tile) => {
        const live = tile.querySelector('.rtile__live');
        if (!live) return;
        const a = tile.getBoundingClientRect();
        const b = live.getBoundingClientRect();
        // horizontal position is what a scroller can break; vertical is what
        // an absolute badge can escape
        if (b.top < a.top - 1 || b.bottom > a.bottom + 1) bad++;
        if (b.left < a.left - 1 || b.right > a.right + 1) bad++;
      });
      return bad;
    });
    expect(outside).toBe(0);
    expect(await page.locator('.rtile__live').count()).toBeGreaterThan(10);
  });

  test('the language bar counts add up to the repo total', async ({ page }) => {
    await page.goto('/');
    const sum = await page.locator('.lang__count').evaluateAll((els) =>
      els.reduce((n, e) => n + Number(e.textContent ?? 0), 0),
    );
    expect(sum).toBe(50);
  });
});

test.describe('hero', () => {
  test('the portrait is not cropped through the head', async ({ page }) => {
    await page.goto('/');
    const info = await page.evaluate(() => {
      const img = document.querySelector<HTMLImageElement>('.dial__portrait img')!;
      const r = img.getBoundingClientRect();
      return {
        natural: [img.naturalWidth, img.naturalHeight],
        box: [Math.round(r.width), Math.round(r.height)],
      };
    });
    // square source into a square frame: the crop cannot cut the top off
    expect(info.natural[0]).toBe(info.natural[1]);
    expect(Math.abs(info.box[0] - info.box[1])).toBeLessThanOrEqual(2);
  });

  test('the blueprint background is present and decorative', async ({ page }) => {
    await page.goto('/');
    const bg = page.locator('.hero__bg');
    await expect(bg).toHaveCount(1);
    await expect(bg).toHaveAttribute('aria-hidden', 'true');
    const url = await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>('.hero__bg')!;
      return getComputedStyle(el, '::after').backgroundImage;
    });
    expect(url).toContain('hero-dev');
  });
});

test.describe('ask palette', () => {
  test('opens with the keyboard and with the button', async ({ page }) => {
    await page.goto('/');
    await openAsk(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-ask]')).not.toHaveClass(/is-open/);

    await page.locator('[data-ask-open]').click();
    await expect(page.locator('[data-ask]')).toHaveClass(/is-open/);
  });

  test('finds a real project by a technology', async ({ page }) => {
    await page.goto('/');
    await openAsk(page);
    await typeAsk(page, 'wordpress');
    const names = await page.locator('.ask__name').allInnerTexts();
    expect(names.join(' ').toLowerCase()).toContain('blondeau');
  });

  test('does not return every skill for one skill query', async ({ page }) => {
    await page.goto('/');
    await openAsk(page);
    await typeAsk(page, 'python');
    const names = await page.locator('.ask__name').allInnerTexts();
    expect(names[0]).toBe('Python');
    expect(names).not.toContain('Java');
  });

  test('highlights the matched run', async ({ page }) => {
    await page.goto('/');
    await openAsk(page);
    await typeAsk(page, 'blondeau');
    await expect(page.locator('.ask__name mark').first()).toBeVisible();
  });

  test('every suggestion chip returns something', async ({ page }) => {
    await page.goto('/');
    await openAsk(page);
    const chips = page.locator('[data-ask-try]');
    const count = await chips.count();
    expect(count).toBeGreaterThan(2);
    for (let i = 0; i < count; i++) {
      await chips.nth(i).click();
      await page.waitForTimeout(250);
      expect(await page.locator('.ask__item').count(), `chip ${i}`).toBeGreaterThan(0);
    }
  });

  test('arrow keys move the active row', async ({ page }) => {
    await page.goto('/');
    await openAsk(page);
    await typeAsk(page, 'wordpress');

    const input = page.locator('[data-ask-input]');
    const first = await input.getAttribute('aria-activedescendant');
    await input.press('ArrowDown');
    await page.waitForTimeout(150);
    const second = await input.getAttribute('aria-activedescendant');
    expect(second).not.toBe(first);

    await input.press('ArrowUp');
    await page.waitForTimeout(150);
    expect(await input.getAttribute('aria-activedescendant')).toBe(first);
  });

  test('Enter on a project result opens its case study', async ({ page }) => {
    await page.goto('/');
    await openAsk(page);
    await typeAsk(page, 'eagle analytics');
    await page.locator('[data-ask-input]').press('Enter');
    await expect(page.locator('[data-dialog]')).toHaveClass(/is-open/);
    await expect(page.locator('[data-dlg-title]')).toContainText('Eagle');
  });

  test('a section result navigates', async ({ page }) => {
    await page.goto('/');
    await openAsk(page);
    await typeAsk(page, 'hire');
    await page.locator('[data-ask-input]').press('Enter');
    await page.waitForTimeout(1400);
    expect(page.url()).toContain('#contact');
  });

  test('says so plainly when nothing matches', async ({ page }) => {
    await page.goto('/');
    await openAsk(page);
    await page.locator('[data-ask-input]').fill('zzzzqqq');
    await page.waitForTimeout(300);
    await expect(page.locator('[data-ask-empty]')).toBeVisible();
  });
});

test.describe('responsive navigation', () => {
  test('nav collapses to the menu button on a narrow screen', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1200, height: 900 });
    await expect(page.locator('[data-nav]')).toBeVisible();
    await expect(page.locator('[data-burger]')).toBeHidden();

    await page.setViewportSize({ width: 1000, height: 900 });
    await expect(page.locator('[data-nav]')).toBeHidden();
    await expect(page.locator('[data-burger]')).toBeVisible();
  });

  test('the open menu keeps a visible close control', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const burger = page.locator('[data-burger]');
    await burger.click();
    await page.waitForTimeout(800);
    await expect(burger).toBeVisible();

    const contrast = await page.evaluate(() => {
      const lum = (c: number[]) => {
        const [r, g, b] = c.map((v) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const rgb = (s: string) => s.match(/\d+/g)!.slice(0, 3).map(Number);
      const panel = lum(rgb(getComputedStyle(document.querySelector('.mobile-nav')!).backgroundColor));
      const line = lum(rgb(getComputedStyle(document.querySelector('[data-burger] span')!).backgroundColor));
      const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      return ratio(line, panel);
    });
    expect(contrast).toBeGreaterThan(4.5);

    await burger.click();
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
  });

  test('a menu link closes the menu and lands on the section', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.locator('[data-burger]').click();
    await page.waitForTimeout(700);
    await page.locator('[data-mobile-nav] a[href="#about"]').click();
    await page.waitForTimeout(1300);
    await expect(page.locator('body')).not.toHaveClass(/nav-open/);
    expect(page.url()).toContain('#about');
  });
});

test.describe('accessibility & motion', () => {
  test('reduced motion leaves everything visible', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    await page.waitForTimeout(1200);
    const opacities = await page.evaluate(() =>
      ['.hero__title', '.hero__statement', '.hero__actions'].map(
        (s) => getComputedStyle(document.querySelector(s)!).opacity,
      ),
    );
    for (const o of opacities) expect(Number(o)).toBeGreaterThan(0.9);
    await ctx.close();
  });

  test('all images have alt text', async ({ page }) => {
    await page.goto('/');
    const missing = await page.locator('img').evaluateAll(
      (els) => els.filter((e) => e.getAttribute('alt') === null).length,
    );
    expect(missing).toBe(0);
  });

  test('the palette is reachable and closable by keyboard alone', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Control+k');
    await expect(page.locator('[data-ask-input]')).toBeFocused();
    await page.keyboard.type('python');
    await expect(page.locator('.ask__item').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-ask]')).not.toHaveClass(/is-open/);
  });
});
