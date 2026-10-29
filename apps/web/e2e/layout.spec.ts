import { expect, hasHorizontalScroll, ROUTES, test } from './fixtures';

const PHONES = [
  { name: 'iPhone', width: 390, height: 844 },
  { name: 'Galaxy S25 Ultra', width: 412, height: 915 },
];
const WIDE = [
  { name: 'iPad', width: 820, height: 1180 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'escritorio', width: 1280, height: 800 },
];
const DESTINATIONS = ['Mis partidos', 'Competiciones', 'Favoritos', 'Ajustes'];

test.describe('HU-023 AC1 mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile project only');

  test('HU-023 AC1 bottom bar with the four destinations and no horizontal scroll', async ({ app }) => {
    for (const vp of PHONES) {
      await app.setViewportSize(vp);
      for (const route of ROUTES) {
        await app.goto(route);
        const nav = app.getByRole('navigation', { name: 'Principal' });
        await expect(nav).toBeVisible();
        await expect(nav.getByRole('link')).toHaveText(DESTINATIONS);
        const box = (await nav.boundingBox())!;
        expect(Math.round(box.y + box.height), `${vp.name} ${route}: barra pegada abajo`).toBe(vp.height);
        expect(box.width, `${vp.name} ${route}: barra a todo el ancho`).toBe(vp.width);
        expect(await hasHorizontalScroll(app), `${vp.name} ${route}: sin scroll horizontal`).toBe(false);
      }
    }
  });

  test('content is not hidden behind the bottom bar', async ({ app }) => {
    await app.setViewportSize(PHONES[0]!);
    await app.goto('/competiciones');
    await app.getByText('UEFA Europa League').scrollIntoViewIfNeeded();
    const last = (await app.getByText('UEFA Europa League').boundingBox())!;
    const nav = (await app.getByRole('navigation', { name: 'Principal' }).boundingBox())!;
    expect(last.y + last.height).toBeLessThanOrEqual(nav.y);
  });
});

test.describe('HU-023 AC2 tablet and desktop', () => {
  test.skip(({ isMobile }) => !!isMobile, 'tablet project only');

  test('HU-023 AC2 side navigation and no horizontal scroll', async ({ app }) => {
    for (const vp of WIDE) {
      await app.setViewportSize(vp);
      for (const route of ROUTES) {
        await app.goto(route);
        const nav = app.getByRole('navigation', { name: 'Principal' });
        await expect(nav.getByRole('link')).toHaveText(DESTINATIONS);
        const box = (await nav.boundingBox())!;
        expect(box.x, `${vp.name} ${route}: a la izquierda`).toBe(0);
        expect(box.height, `${vp.name} ${route}: alto completo`).toBeGreaterThanOrEqual(vp.height - 1);
        expect(box.width, `${vp.name} ${route}: lateral, no barra`).toBeLessThan(vp.width / 3);
        expect(await hasHorizontalScroll(app), `${vp.name} ${route}: sin scroll horizontal`).toBe(false);
      }
    }
  });

  test('HU-023 AC2 the catalog uses the available width', async ({ app }) => {
    await app.setViewportSize(WIDE[2]!);
    await app.goto('/competiciones');
    const cards = app.getByRole('region', { name: 'Ligas' }).getByRole('listitem');
    const first = (await cards.nth(0).boundingBox())!;
    const second = (await cards.nth(1).boundingBox())!;
    expect(second.y, 'tarjetas lado a lado').toBe(first.y);
  });
});
