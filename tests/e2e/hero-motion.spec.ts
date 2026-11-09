import { test, expect } from '@playwright/test';

test.describe('hero loom sequence', () => {
  test('unweaves as you scroll down and restores the portrait when you scroll back', async ({page}, info) => {
    test.skip(info.project.name !== 'desktop');
    await page.goto('/');
    await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
    const hero = page.locator('.hero');
    await page.evaluate(() => window.scrollTo({top:300,behavior:'instant'}));
    await expect(hero).toHaveClass(/is-unweaving/);
    const ink = await page.locator('.hero__unweave').evaluate((c: HTMLCanvasElement) => {
      const pixels = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
      let opaque = 0, empty = 0;
      for (let i = 3; i < pixels.length; i += 4) pixels[i] ? opaque++ : empty++;
      return {opaque,empty};
    });
    expect(ink.opaque).toBeGreaterThan(1000);
    expect(ink.empty).toBeGreaterThan(1000);
    await page.evaluate(() => window.scrollTo({top:1200,behavior:'instant'}));
    await expect(hero).toHaveClass(/is-unwoven/);
    await expect(page.locator('.hero__intro-copy')).toBeVisible();
    await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
    await expect(hero).not.toHaveClass(/is-unweav/);
    await expect(hero).not.toHaveClass(/is-unwoven/);
    await expect(page.locator('.hero__portrait img')).toBeVisible();
  });
  for (const width of [320, 768, 1023]) {
    test(`natural flow fits ${width}px without locking the scroll`, async ({page}) => {
      await page.setViewportSize({width,height:844});
      await page.goto('/');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.locator('.hero__stage').evaluate(el=>getComputedStyle(el).position)).toBe('relative');
      await page.evaluate(() => scrollTo({top:450,behavior:'instant'}));
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
      expect(await page.evaluate(() => location.hash)).not.toBe('#repos');
    });
  }
  test('reduced motion shows the static portrait and intro', async ({page}) => {
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/');
    await expect(page.locator('.hero__portrait img')).toBeVisible();
    await expect(page.locator('.hero__intro-copy')).toBeVisible();
    await expect(page.locator('.hero__unweave')).toBeHidden();
  });
});
