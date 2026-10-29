import { test as base, expect, type Page } from '@playwright/test';

const meta = { updatedAt: '2026-10-29T12:00:00.000Z', stale: false, source: 'cache' };
const competition = (id: number, name: string, region: string, section: 'leagues' | 'international') => ({
  id,
  name,
  region,
  section,
  type: section === 'leagues' ? 'league' : 'cup',
  season: 2024,
});

const catalog = {
  leagues: [
    competition(239, 'Liga BetPlay', 'Colombia', 'leagues'),
    competition(128, 'Liga Profesional Argentina', 'Argentina', 'leagues'),
    competition(135, 'Serie A', 'Italia', 'leagues'),
    competition(39, 'Premier League', 'Inglaterra', 'leagues'),
    competition(140, 'LaLiga', 'España', 'leagues'),
    competition(71, 'Brasileirão Série A', 'Brasil', 'leagues'),
  ],
  international: [
    competition(13, 'Copa Libertadores', 'Sudamérica', 'international'),
    competition(11, 'Copa Sudamericana', 'Sudamérica', 'international'),
    competition(2, 'UEFA Champions League', 'Europa', 'international'),
    competition(3, 'UEFA Europa League', 'Europa', 'international'),
  ],
};

/** Stubs our API so E2E tests need neither the backend nor API-Football quota. */
export async function stubApi(page: Page) {
  await page.route('**/api/health', (r) =>
    r.fulfill({ json: { data: { status: 'ok', clockMode: 'simulated', version: '0.1.0' }, meta } }),
  );
  await page.route('**/api/competitions', (r) => r.fulfill({ json: { data: catalog, meta } }));
}

export const ROUTES = ['/', '/competiciones', '/competicion/39', '/favoritos', '/ajustes'];

export const test = base.extend<{ app: Page }>({
  app: async ({ page }, use) => {
    await stubApi(page);
    await use(page);
  },
});

export { expect };

/** True when the page can scroll sideways (layout overflow). */
export function hasHorizontalScroll(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
}
