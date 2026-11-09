import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/* The browser restores the last scroll position between navigations, so a
   test that assumes it starts at the hero is a coin flip. Every test starts
   at the top, exactly as a first-time visitor would. */
async function gotoHome(page: Page) {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, 0));
}

/** Audit the resting design, not a frame of an animation. */
async function settle(page: Page) {
  await page.addStyleTag({
    content: `*,*::before,*::after{
      animation-duration:0s !important;
      animation-delay:0s !important;
      transition-duration:0s !important;
      transition-delay:0s !important;
      caret-color:transparent !important;
    }`,
  });
  await page.evaluate(() => {
    const gsap = (window as unknown as { gsap?: any }).gsap;
    if (!gsap?.globalTimeline) return;
    for (const tween of gsap.globalTimeline.getChildren(true, true, false)) {
      try {
        tween.progress(1);
      } catch {
        /* infinite or already done */
      }
    }
  });
  await page.waitForTimeout(320);
}

async function audit(page: Page, scope?: string) {
  const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);
  const results = scope ? await builder.include(scope).analyze() : await builder.analyze();

  const blockers = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );

  if (blockers.length) {
    console.log(
      blockers
        .map((v) => {
          const nodes = v.nodes
            .slice(0, 5)
            .map((n) => `   ${n.target.join(' ')} — ${(n.any[0]?.message ?? '').replace(/\s+/g, ' ').slice(0, 140)}`)
            .join('\n');
          return `${v.id} (${v.impact}) — ${v.nodes.length} node(s): ${v.help}\n${nodes}`;
        })
        .join('\n'),
    );
  }
  expect(blockers).toEqual([]);
}

test.describe('accessibility (axe)', () => {
  /* Audit with motion off: every reveal ends at opacity 1, so this is the same
     design a visitor settles on — but deterministic, instead of sampling a
     half-faded frame and reporting phantom contrast failures. */
  test.use({ reducedMotion: 'reduce' });

  test('no serious or critical violations on load', async ({ page }) => {
    await gotoHome(page);
    await settle(page);
    await audit(page);
  });

  test('the open palette is accessible', async ({ page }) => {
    await gotoHome(page);
    await settle(page);
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(600);
    await audit(page);
  });

  test('a case study sheet is accessible', async ({ page }) => {
    await gotoHome(page);
    await settle(page);
    await page.locator('[data-open]').first().click();
    await page.waitForTimeout(600);
    await audit(page);
  });

  test('the open mobile menu is accessible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoHome(page);
    await settle(page);
    await page.locator('[data-burger]').click();
    await page.waitForTimeout(800);
    await audit(page);
  });

  test('the query lab and contact form are accessible', async ({ page }) => {
    await gotoHome(page);
    await settle(page);
    await page.locator('#lab').scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await audit(page, '#lab');
    await audit(page, '#contact');
  });

  test('the repositories section is accessible', async ({ page }) => {
    await gotoHome(page);
    await settle(page);
    await page.locator('#repos').scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await audit(page, '#repos');
  });

  test('the dark theme passes the same audit', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', colorScheme: 'dark' });
    const page = await ctx.newPage();
    await gotoHome(page);
    await settle(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await audit(page);
    await ctx.close();
  });
});
