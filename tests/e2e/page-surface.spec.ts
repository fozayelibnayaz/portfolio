import { test, expect } from '@playwright/test';

test('all sections and footer share the hero canvas in light and dark modes', async ({ page }) => {
  await page.goto('/');
  await page.addStyleTag({ content: '* { transition: none !important; }' });
  for (const [theme, color] of [['light', 'rgb(242, 242, 244)'], ['dark', 'rgb(17, 21, 28)']]) {
    await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), theme);
    const surface = await page.evaluate(() => {
      const body = getComputedStyle(document.body);
      const hero = getComputedStyle(document.querySelector('.hero__stage')!);
      const sections = [...document.querySelectorAll('main > section:not(.hero), .site-footer')].map(el => {
        const style = getComputedStyle(el);
        return { color:style.backgroundColor, image:style.backgroundImage };
      });
      return {color:body.backgroundColor, stripes:body.backgroundImage, heroColor:hero.backgroundColor, heroStripes:hero.backgroundImage, sections};
    });
    expect(surface.color).toBe(color);
    expect(surface.heroColor).toBe(color);
    expect(surface.stripes).toContain('repeating-linear-gradient');
    expect(surface.stripes).toBe(surface.heroStripes);
    for (const section of surface.sections) {
      expect(section.color).toBe('rgba(0, 0, 0, 0)');
      expect(section.image).toBe('none');
    }
  }
});
