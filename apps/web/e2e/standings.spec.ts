import AxeBuilder from '@axe-core/playwright';
import { expect, hasHorizontalScroll, test } from './fixtures';

test.describe('standings on a phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile project only');

  test('HU-007 AC4 essential columns fit at 390 px; the rest scroll inside the table', async ({ app }) => {
    await app.goto('/competicion/140');
    await app.getByRole('tab', { name: 'Clasificación' }).click();
    const table = app.getByRole('table', { name: 'LaLiga' });
    await expect(table).toBeVisible();

    for (const title of ['Posición', 'Equipo', 'Partidos jugados', 'Diferencia de goles', 'Puntos']) {
      const box = (await table.locator(`th[title="${title}"]`).boundingBox())!;
      expect(box.x + box.width, `${title} visible sin desplazar`).toBeLessThanOrEqual(390);
    }
    expect(await hasHorizontalScroll(app), 'la página no se desplaza a lo ancho').toBe(false);
    const wrapper = table.locator('xpath=..');
    expect(await wrapper.evaluate((el) => el.scrollWidth > el.clientWidth), 'la tabla sí se desplaza').toBe(
      true,
    );
  });

  test('the standings tab has no serious accessibility violations', async ({ app }) => {
    await app.goto('/competicion/140');
    await app.getByRole('tab', { name: 'Clasificación' }).click();
    await expect(app.getByRole('table', { name: 'LaLiga' })).toBeVisible();
    const { violations } = await new AxeBuilder({ page: app }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
  });
});
