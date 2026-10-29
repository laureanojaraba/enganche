import { describe, expect, it } from 'vitest';
import { apiResponse, RoundsSchedule } from '@enganche/shared';
import { buildApp } from '../src/app';
import { SimulatedClock } from '../src/clock/clock';
import { loadConfig } from '../src/config';
import type { ApiFixture } from '../src/providers/api-football.mapper';
import type { Source } from '../src/providers/source';

let nextId = 1;
const fx = (round: string, date: string, home: number, away: number, short = 'FT'): ApiFixture => ({
  fixture: { id: nextId++, date, status: { short, long: short, elapsed: 90 } },
  league: { id: 13, season: 2024, round },
  teams: { home: { id: home, name: `T${home}` }, away: { id: away, name: `T${away}` } },
  goals: { home: 1, away: 0 },
});

// Provider order is not chronological on purpose: rounds must be sorted by their first kickoff.
const calendar = [
  fx('Group Stage - 2', '2024-04-10T22:00:00Z', 3, 4),
  fx('Group Stage - 1', '2024-04-03T22:00:00Z', 1, 2),
  fx('Group Stage - 1', '2024-04-03T23:00:00Z', 3, 4),
  fx('Group Stage - 2', '2024-04-10T23:00:00Z', 1, 2, 'PST'), // postponed: must not keep round 2 "open"
  fx('Round of 16', '2024-08-13T22:00:00Z', 1, 3),
  fx('Round of 16', '2024-08-14T22:00:00Z', 2, 4),
  fx('Round of 16', '2024-08-20T22:00:00Z', 3, 1),
  fx('Round of 16', '2024-08-21T22:00:00Z', 4, 2),
  fx('Final', '2024-11-30T20:00:00Z', 1, 2),
  // A group match rescheduled months later (like several Brasileirão 2024 games): it must not drag the
  // current round back to the group stage.
  fx('Group Stage - 1', '2024-08-15T22:00:00Z', 5, 6),
];

const source: Source = {
  // Match details (params.id) are not cached here: live matches fall back to "no score".
  async get<T>(_p: string, params: Record<string, unknown> = {}) {
    return {
      body: { response: params.id ? [] : calendar } as T,
      meta: { updatedAt: '2026-10-29T12:00:00.000Z', stale: false, source: 'snapshot' },
    };
  },
};

function appAt(dataNow: string) {
  const realStart = Date.parse('2026-10-29T15:00:00Z');
  const clock = new SimulatedClock({ anchor: dataNow, startedAt: realStart, realNow: () => realStart });
  return buildApp(loadConfig({ CLOCK_MODE: 'simulated' }), { source, clock });
}

async function rounds(dataNow: string, id = 13) {
  const app = appAt(dataNow);
  await app.ready();
  const res = await app.inject({ method: 'GET', url: `/api/competitions/${id}/rounds` });
  await app.close();
  return res;
}

describe('GET /api/competitions/:id/rounds', () => {
  it('orders rounds by first kickoff and splits two-legged knockouts', async () => {
    const res = await rounds('2024-05-01T00:00:00Z');
    expect(res.statusCode).toBe(200);
    const { data } = apiResponse(RoundsSchedule).parse(res.json());
    expect(data.rounds.map((r) => [r.name, r.leg ?? null, r.matches.length])).toEqual([
      ['Group Stage - 1', null, 3],
      ['Group Stage - 2', null, 2],
      ['Round of 16', 1, 2],
      ['Round of 16', 2, 2],
      ['Final', null, 1],
    ]);
  });

  it('HU-013 AC1 points to the round being played or the next one, by the simulated clock', async () => {
    const parse = async (now: string) => apiResponse(RoundsSchedule).parse((await rounds(now)).json()).data;
    // Group Stage 2 is over except a postponed match → next is the round of 16, first leg.
    expect((await parse('2024-05-01T00:00:00Z')).current).toBe(2);
    // Between the legs of the round of 16 → second leg.
    expect((await parse('2024-08-16T00:00:00Z')).current).toBe(3);
    // The rescheduled group match is the next kickoff, but its round is long gone → second leg.
    expect((await parse('2024-08-15T00:00:00Z')).current).toBe(3);
    // During the final.
    expect((await parse('2024-11-30T20:30:00Z')).current).toBe(4);
    // Season over → last round.
    expect((await parse('2024-12-31T00:00:00Z')).current).toBe(4);
  });

  it('answers 404 outside the catalog', async () => {
    expect((await rounds('2024-05-01T00:00:00Z', 242)).statusCode).toBe(404);
  });
});
