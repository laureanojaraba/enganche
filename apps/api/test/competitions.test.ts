import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { apiResponse, CompetitionCatalog } from '@enganche/shared';
import { buildApp } from '../src/app';
import { RealClock } from '../src/clock/clock';
import { loadConfig } from '../src/config';
import type { Params, Source } from '../src/providers/source';

const fixtures = JSON.parse(
  fs.readFileSync(
    path.join(import.meta.dirname, 'fixtures/api-football/fixtures-league-239-2024-11.json'),
    'utf8',
  ),
);

/** Offline source: /leagues answers with a logo per league; /fixtures with the recorded Liga BetPlay round. */
const source: Source = {
  async get<T>(p: string, params: Params = {}) {
    const body =
      p === '/leagues'
        ? {
            response: [
              {
                league: {
                  id: Number(params.id),
                  name: `API ${params.id}`,
                  type: [13, 11, 2, 3].includes(Number(params.id)) ? 'Cup' : 'League',
                  logo: `https://media.api-sports.io/football/leagues/${params.id}.png`,
                },
                country: { name: 'X' },
                seasons: [],
              },
            ],
          }
        : fixtures;
    return {
      body: body as T,
      meta: { updatedAt: '2026-10-29T12:00:00.000Z', stale: false, source: 'snapshot' },
    };
  },
};

describe('competitions API', () => {
  const app = buildApp(loadConfig({ CLOCK_MODE: 'real' }), { source, clock: new RealClock() });
  beforeAll(() => app.ready());
  afterAll(() => app.close());

  it('lists the 10 supported competitions grouped by section', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/competitions' });
    expect(res.statusCode).toBe(200);
    const { data } = apiResponse(CompetitionCatalog).parse(res.json());
    expect(data.leagues.map((c) => c.name)).toEqual([
      'Liga BetPlay',
      'Liga Profesional Argentina',
      'Serie A',
      'Premier League',
      'LaLiga',
      'Brasileirão Série A',
    ]);
    expect(data.international.map((c) => c.name)).toEqual([
      'Copa Libertadores',
      'Copa Sudamericana',
      'UEFA Champions League',
      'UEFA Europa League',
    ]);
    expect(data.leagues[0]).toMatchObject({
      id: 239,
      region: 'Colombia',
      type: 'league',
      logo: 'https://media.api-sports.io/football/leagues/239.png',
    });
    expect(data.international[0]).toMatchObject({ region: 'Sudamérica', type: 'cup' });
  });

  it('HU-006 AC2 answers 404 for a competition outside the catalog', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/competitions/242/matches' });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ error: { code: 'COMPETITION_NOT_SUPPORTED' } });
  });

  it('returns matches for a supported competition', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/competitions/239/matches' });
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toHaveLength(3);
  });

  it('rejects a non-numeric id with 400', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/competitions/abc/matches' });
    expect(res.statusCode).toBe(400);
  });
});
