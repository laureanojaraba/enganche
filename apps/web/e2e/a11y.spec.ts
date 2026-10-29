import AxeBuilder from '@axe-core/playwright';
import { expect, ROUTES, test } from './fixtures';

test.describe('HU-023 AC3 accessibility', () => {
  for (const route of ROUTES) {
    test(`HU-023 AC3 no serious or critical axe violations on ${route}`, async ({ app }) => {
      await app.goto(route);
      await expect(app.getByRole('navigation', { name: 'Principal' })).toBeVisible();
      await expect(app.getByRole('heading', { level: 1 })).toBeVisible();
      const { violations } = await new AxeBuilder({ page: app }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
    });
  }

  test('HU-023 AC3 the navigation works with the keyboard', async ({ app }) => {
    await app.goto('/competiciones');
    await expect(app.getByRole('heading', { level: 1, name: 'Competiciones' })).toBeVisible();
    const nav = app.getByRole('navigation', { name: 'Principal' });
    const favoritos = nav.getByRole('link', { name: 'Favoritos' });

    for (let i = 0; i < 25 && !(await favoritos.evaluate((el) => el === document.activeElement)); i++) {
      await app.keyboard.press('Tab');
    }
    await expect(favoritos).toBeFocused();
    await app.keyboard.press('Enter');
    await expect(app.getByRole('heading', { level: 1, name: 'Favoritos' })).toBeVisible();
    await expect(favoritos).toHaveAttribute('aria-current', 'page');
  });
});
