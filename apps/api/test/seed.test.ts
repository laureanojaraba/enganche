import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { CATALOG } from '../src/catalog/competitions';
import { CachedSource } from '../src/providers/cached-source';
import { cacheKey } from '../src/providers/cache-key';
import type { Params, Source } from '../src/providers/source';
import { buildBasePlan, runSeed } from '../src/seed/seed';

const ANCHOR = '2024-11-09T18:00:00Z';

/** Fake provider: each league has 4 fixtures, two of them inside the ±1 day window around ANCHOR. */
function fakeProvider() {
  const calls: string[] = [];
  const fixture = (id: number, league: number, date: string) => ({
    fixture: { id, date, status: { short: 'FT', long: 'Match Finished', elapsed: 90 } },
    league: { id: league, season: 2024, round: 'R' },
    teams: { home: { id: 1, name: 'A' }, away: { id: 2, name: 'B' } },
    goals: { home: 1, away: 0 },
  });
  const source: Source = {
    async get<T>(p: string, params: Params = {}) {
      calls.push(cacheKey(p, params));
      let body: unknown = { errors: [], response: [] };
      if (p === '/fixtures' && params.league) {
        const l = Number(params.league);
        body = {
          errors: [],
          response: [
            fixture(l * 100 + 1, l, '2024-11-01T20:00:00+00:00'),
            fixture(l * 100 + 2, l, '2024-11-09T15:00:00+00:00'),
            fixture(l * 100 + 3, l, '2024-11-10T19:00:00+00:00'),
            fixture(l * 100 + 4, l, '2024-11-20T20:00:00+00:00'),
          ],
        };
      }
      return {
        body: body as T,
        meta: { updatedAt: new Date().toISOString(), stale: false, source: 'live' as const },
      };
    },
  };
  return { source, calls };
}

let dir: string;
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'enganche-seed-'));
});
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

const setup = () => {
  const up = fakeProvider();
  const cache = new CachedSource({ upstream: up.source, mode: 'snapshot', dir });
  return { up, cache };
};
const seedOpts = (budget: number) => ({
  catalog: CATALOG,
  anchor: ANCHOR,
  windowDays: 1,
  budget,
  log: () => {},
});

describe('seed', () => {
  it('HU-004 AC3 fetches base data for the 10 competitions first, then match details inside the window', async () => {
    const { up, cache } = setup();
    const result = await runSeed(cache, seedOpts(500));
    expect(result.complete).toBe(true);

    const base = up.calls.slice(0, 40);
    expect(base.filter((k) => k.startsWith('leagues__'))).toHaveLength(10);
    expect(base.filter((k) => k.startsWith('teams__'))).toHaveLength(10);
    expect(base.filter((k) => k.startsWith('fixtures__league'))).toHaveLength(10);
    expect(base.filter((k) => k.startsWith('standings__'))).toHaveLength(10);

    const details = up.calls.slice(40);
    expect(details).toHaveLength(20); // 2 fixtures in the window × 10 competitions
    expect(details.every((k) => /^fixtures__id-\d+$/.test(k))).toBe(true);
    expect(details).toContain(cacheKey('/fixtures', { id: 23902 }));
    expect(details).not.toContain(cacheKey('/fixtures', { id: 23901 }));
  });

  it('HU-004 AC1 stops at the daily budget and reports what is left', async () => {
    const { up, cache } = setup();
    const result = await runSeed(cache, seedOpts(5));
    expect(up.calls).toHaveLength(5);
    expect(result).toMatchObject({ complete: false, requested: 5 });
    expect(result.remaining).toBeGreaterThan(0);
  });

  it('HU-004 AC2 resumes an interrupted seed without repeating cached requests', async () => {
    const { up, cache } = setup();
    await runSeed(cache, seedOpts(25));
    const second = await runSeed(cache, seedOpts(500));
    expect(second.complete).toBe(true);
    expect(up.calls).toHaveLength(60);
    expect(new Set(up.calls).size).toBe(60);
  });

  it('builds the base plan from the catalog with the development season', () => {
    const plan = buildBasePlan(CATALOG);
    expect(plan).toHaveLength(40);
    expect(plan[0]).toEqual({ path: '/leagues', params: { id: 239 } });
    expect(plan.find((r) => r.path === '/standings')?.params).toEqual({ league: 239, season: 2024 });
  });
});
