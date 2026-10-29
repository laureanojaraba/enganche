import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Match } from '@enganche/shared';
import { mapFixture, mapStatus, type ApiFixture } from '../src/providers/api-football.mapper';
import { ApiFootballProvider } from '../src/providers/api-football.provider';
import { cacheKey } from '../src/providers/cache-key';
import { SnapshotSource } from '../src/providers/snapshot-source';
import { ProviderUnavailableError } from '../src/providers/source';

const recorded = JSON.parse(
  fs.readFileSync(
    path.join(import.meta.dirname, 'fixtures/api-football/fixtures-league-239-2024-11.json'),
    'utf8',
  ),
) as { response: ApiFixture[] };

describe('mapFixture', () => {
  it('HU-003 AC1 maps a recorded API-Football fixture to a valid domain Match', () => {
    const match = mapFixture(recorded.response[0]!);
    expect(Match.safeParse(match).success).toBe(true);
    expect(match).toMatchObject({
      id: 1234296,
      competitionId: 239,
      season: 2024,
      round: 'Clausura - 16',
      kickoffUtc: '2024-11-01T22:00:00.000Z',
      status: 'finished',
      home: { id: 1133, name: 'Jaguares' },
      away: { id: 1462, name: 'Deportivo Pereira' },
      score: { home: 1, away: 2 },
      venue: { name: 'Estadio de Fútbol Jaraguay de Montería', city: 'Montería' },
    });
    expect(match.home.logo).toMatch(/^https:\/\//);
  });

  it('maps every recorded fixture', () => {
    const matches = recorded.response.map(mapFixture);
    expect(matches.every((m) => Match.safeParse(m).success)).toBe(true);
  });

  it('keeps the minute for live matches and a null score before kickoff', () => {
    const base = recorded.response[0]!;
    const live = mapFixture({
      ...base,
      fixture: { ...base.fixture, status: { long: 'Second Half', short: '2H', elapsed: 67, extra: null } },
    });
    expect(live).toMatchObject({ status: 'live', minute: 67 });

    const scheduled = mapFixture({
      ...base,
      fixture: { ...base.fixture, status: { long: 'Not Started', short: 'NS', elapsed: null, extra: null } },
      goals: { home: null, away: null },
    });
    expect(scheduled.status).toBe('scheduled');
    expect(scheduled.score).toBeNull();
    expect(scheduled.minute).toBeUndefined();
  });
});

describe('mapStatus', () => {
  it.each([
    ['NS', 'scheduled'],
    ['TBD', 'scheduled'],
    ['1H', 'live'],
    ['ET', 'live'],
    ['P', 'live'],
    ['HT', 'halftime'],
    ['FT', 'finished'],
    ['AET', 'finished'],
    ['PEN', 'finished'],
    ['PST', 'postponed'],
    ['SUSP', 'postponed'],
    ['CANC', 'cancelled'],
    ['AWD', 'cancelled'],
  ])('%s -> %s', (short, expected) => {
    expect(mapStatus(short)).toBe(expected);
  });

  it('treats unknown codes as scheduled', () => {
    expect(mapStatus('???')).toBe('scheduled');
  });
});

describe('ApiFootballProvider', () => {
  it('lists fixtures as domain matches with provider metadata', async () => {
    const source = {
      get: async <T>() => ({
        body: recorded as T,
        meta: { updatedAt: '2026-10-29T12:00:00.000Z', stale: false, source: 'snapshot' as const },
      }),
    };
    const result = await new ApiFootballProvider(source).listFixtures({ league: 239, season: 2024 });
    expect(result.data).toHaveLength(3);
    expect(result.data.map((m) => m.home.name)).toContain('Once Caldas');
    expect(result.meta.source).toBe('snapshot');
  });
});

describe('SnapshotSource', () => {
  it('serves cached entries and fails without touching the network when missing', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'enganche-snap-'));
    fs.writeFileSync(
      path.join(dir, `${cacheKey('/fixtures', { league: 239, season: 2024 })}.json`),
      JSON.stringify({ storedAt: Date.parse('2026-10-29T12:00:00Z'), body: recorded }),
    );
    const snap = new SnapshotSource(dir);
    const hit = await snap.get('/fixtures', { season: 2024, league: 239 });
    expect(hit.meta).toMatchObject({ source: 'snapshot', stale: false });
    await expect(snap.get('/fixtures', { league: 1 })).rejects.toBeInstanceOf(ProviderUnavailableError);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
