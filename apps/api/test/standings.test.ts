import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { apiResponse, StandingGroup } from '@enganche/shared';
import { z } from 'zod';
import { buildApp } from '../src/app';
import { RealClock } from '../src/clock/clock';
import { loadConfig } from '../src/config';
import type { Params, Source } from '../src/providers/source';

const load = (name: string) =>
  JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'fixtures/api-football', name), 'utf8'));
const laliga = load('standings-140-2024.json');
const libertadores = load('standings-13-2024-grupos-ab.json');

const source: Source = {
  async get<T>(_p: string, params: Params = {}) {
    const body = Number(params.league) === 13 ? libertadores : laliga;
    return {
      body: body as T,
      meta: { updatedAt: '2026-10-29T12:00:00.000Z', stale: false, source: 'snapshot' },
    };
  },
};

describe('GET /api/competitions/:id/standings', () => {
  const app = buildApp(loadConfig({ CLOCK_MODE: 'real' }), { source, clock: new RealClock() });
  beforeAll(() => app.ready());
  afterAll(() => app.close());
  const parse = (json: unknown) => apiResponse(z.array(StandingGroup)).parse(json).data;

  it('maps a league table with every column (real LaLiga 2024/25 data)', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/competitions/140/standings' });
    expect(res.statusCode).toBe(200);
    const groups = parse(res.json());
    expect(groups).toHaveLength(1);
    expect(groups[0]!.rows).toHaveLength(20);
    expect(groups[0]!.rows[0]).toMatchObject({
      rank: 1,
      team: { id: 529, name: 'Barcelona' },
      played: 38,
      won: 28,
      drawn: 4,
      lost: 6,
      goalsFor: 102,
      goalsAgainst: 39,
      goalDiff: 63,
      points: 88,
      // API-Football sends the streak newest first ("WLWWW"); we expose it oldest → newest.
      form: ['W', 'W', 'W', 'L', 'W'],
      description: 'Champions League',
    });
  });

  it('keeps cup groups with their names', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/competitions/13/standings' });
    const groups = parse(res.json());
    expect(groups.map((g) => g.name)).toEqual(['Group A', 'Group B']);
    expect(groups.every((g) => g.rows.length === 4)).toBe(true);
  });

  it('answers 404 outside the catalog', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/competitions/242/standings' });
    expect(res.statusCode).toBe(404);
  });
});
