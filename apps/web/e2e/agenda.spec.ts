import AxeBuilder from '@axe-core/playwright';
import { expect, hasHorizontalScroll, test } from './fixtures';

test('HU-013 the round schedule fits the screen and is accessible', async ({ app }) => {
  await app.goto('/competicion/3');
  await expect(app.getByRole('heading', { level: 2, name: 'Fase de liga – Jornada 3' })).toBeVisible();
  await expect(app.getByRole('list', { name: /Partidos de/ }).getByRole('listitem')).toHaveCount(3);
  expect(await hasHorizontalScroll(app), 'sin scroll horizontal').toBe(false);

  const { violations } = await new AxeBuilder({ page: app }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);

  await app.getByRole('button', { name: 'Jornada siguiente' }).click();
  await expect(app.getByRole('heading', { level: 2, name: 'Fase de liga – Jornada 4' })).toBeVisible();
  await expect(app.getByRole('button', { name: 'Jornada siguiente' })).toBeDisabled();
});
