import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { Match, MatchEvent } from '@enganche/shared';
import { RealClock, SimulatedClock } from '../src/clock/clock';
import type { ApiFixture } from '../src/providers/api-football.mapper';
import { ApiFootballProvider } from '../src/providers/api-football.provider';
import { MatchService } from '../src/services/match-service';

const detail = JSON.parse(
  fs.readFileSync(
    path.join(import.meta.dirname, 'fixtures/api-football/fixture-1223705-atalanta-udinese.json'),
    'utf8',
  ),
) as { response: ApiFixture[] };
const fixtures = JSON.parse(
  fs.readFileSync(
    path.join(import.meta.dirname, 'fixtures/api-football/fixtures-league-239-2024-11.json'),
    'utf8',
  ),
) as { response: ApiFixture[] };

// Atalanta–Udinese: kickoff 2024-11-10 11:30 UTC, 2nd half started 12:30 UTC.
const KICKOFF = Date.parse('2024-11-10T11:30:00Z');
const SECOND_HALF = Date.parse('2024-11-10T12:30:00Z');
const MIN = 60_000;

const source = {
  get: async <T>(_path: string, params: Record<string, unknown> = {}) => ({
    body: (params.id ? detail : fixtures) as T,
    meta: { updatedAt: '2026-10-29T12:00:00.000Z', stale: false, source: 'snapshot' as const },
  }),
};
const provider = new ApiFootballProvider(source);

/** Simulated clock frozen at a given data time (season 2024), with the server started at `realStart`. */
function clockAt(dataTime: number, realStart = Date.parse('2026-10-29T15:00:00Z')) {
  const anchor = new Date(dataTime).toISOString();
  return new SimulatedClock({ anchor, startedAt: realStart, realNow: () => realStart });
}
const service = (dataTime: number) => new MatchService(provider, clockAt(dataTime));

describe('SimulatedClock', () => {
  it('HU-005 AC1 reprojects 2024 kickoffs to today, keeping the distance to the anchor', () => {
    const realStart = Date.parse('2026-10-29T15:00:00Z');
    const clock = new SimulatedClock({
      anchor: '2024-11-09T18:00:00Z',
      startedAt: realStart,
      realNow: () => realStart,
    });
    expect(clock.project('2024-11-09T20:00:00.000Z')).toBe('2026-10-29T17:00:00.000Z');
    expect(clock.dataNow()).toBe(Date.parse('2024-11-09T18:00:00Z'));
  });

  it('advances in real time from the server start', () => {
    let real = Date.parse('2026-10-29T15:00:00Z');
    const clock = new SimulatedClock({
      anchor: '2024-11-09T18:00:00Z',
      startedAt: real,
      realNow: () => real,
    });
    real += 10 * MIN;
    expect(clock.dataNow()).toBe(Date.parse('2024-11-09T18:10:00Z'));
  });

  it('HU-005 AC1 serves reprojected matches through the service', async () => {
    const svc = service(Date.parse('2024-11-01T21:00:00Z'));
    const { data } = await svc.listFixtures({ league: 239, season: 2024 });
    // Jaguares–Pereira kicked off 2024-11-01 22:00, i.e. 1 h after the anchor -> 1 h after the real start.
    expect(data[0]!.kickoffUtc).toBe('2026-10-29T16:00:00.000Z');
    expect(data.every((m) => Match.safeParse(m).success)).toBe(true);
  });
});

describe('simulated match state', () => {
  it.each([
    ['before kickoff', KICKOFF - 5 * MIN, 'scheduled', undefined],
    ['first half', KICKOFF + 29.5 * MIN, 'live', 30],
    ['first-half stoppage', KICKOFF + 47.5 * MIN, 'live', 45],
    ['halftime', KICKOFF + 52 * MIN, 'halftime', undefined],
    ['second half', SECOND_HALF + 24.5 * MIN, 'live', 70],
    ['after the match', SECOND_HALF + 60 * MIN, 'finished', undefined],
  ])('HU-005 AC2 %s', async (_label, at, status, minute) => {
    const { data } = await service(at).getMatch(1223705);
    expect(data.match.status).toBe(status);
    expect(data.match.minute).toBe(minute);
  });

  it('HU-005 AC2 hides the score before kickoff', async () => {
    const { data } = await service(KICKOFF - MIN).getMatch(1223705);
    expect(data.match.score).toBeNull();
    expect(data.events).toEqual([]);
  });
});

describe('simulated events', () => {
  it('HU-005 AC3 shows only events up to the current minute and recomputes the score', async () => {
    const at55 = await service(SECOND_HALF + 9.5 * MIN).getMatch(1223705);
    expect(at55.data.match.minute).toBe(55);
    const goals55 = at55.data.events.filter((e) => e.type.startsWith('goal') || e.type === 'own_goal');
    expect(goals55.map((e) => e.player)).toEqual(['H. Kamara']);
    expect(at55.data.match.score).toEqual({ home: 0, away: 1 });
    expect(at55.data.events.every((e) => MatchEvent.safeParse(e).success)).toBe(true);

    const at61 = await service(SECOND_HALF + 15.5 * MIN).getMatch(1223705);
    expect(at61.data.match.score).toEqual({ home: 2, away: 1 });
    expect(at61.data.events.some((e) => e.type === 'own_goal')).toBe(true);
  });
});

describe('real clock', () => {
  it('HU-005 AC4 returns provider dates and states unchanged', async () => {
    const svc = new MatchService(provider, new RealClock());
    const { data } = await svc.getMatch(1223705);
    expect(data.match).toMatchObject({
      status: 'finished',
      kickoffUtc: '2024-11-10T11:30:00.000Z',
      score: { home: 2, away: 1 },
    });
    expect(data.events.length).toBeGreaterThan(10);
  });
});

describe('simulated listings', () => {
  it('uses the match detail to score live matches in listings', async () => {
    const listSource = {
      get: async <T>() => ({
        body: detail as T,
        meta: { updatedAt: '2026-10-29T12:00:00.000Z', stale: false, source: 'snapshot' as const },
      }),
    };
    const svc = new MatchService(new ApiFootballProvider(listSource), clockAt(SECOND_HALF + 15.5 * MIN));
    const { data } = await svc.listFixtures({ league: 135, season: 2024 });
    expect(data[0]).toMatchObject({ status: 'live', minute: 61, score: { home: 2, away: 1 } });
  });

  it('shows a live match without score when its detail is not available', async () => {
    const failing = {
      get: async <T>(_p: string, params: Record<string, unknown> = {}) => {
        if (params.id) throw new Error('not cached');
        return {
          body: detail as T,
          meta: { updatedAt: '2026-10-29T12:00:00.000Z', stale: false, source: 'snapshot' as const },
        };
      },
    };
    const svc = new MatchService(new ApiFootballProvider(failing), clockAt(SECOND_HALF + 15.5 * MIN));
    const { data } = await svc.listFixtures({ league: 135, season: 2024 });
    expect(data[0]).toMatchObject({ status: 'live', minute: 61, score: null });
  });
});
