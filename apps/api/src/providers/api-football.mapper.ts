import type { Match, MatchStatus } from '@enganche/shared';

// Subset of the API-Football v3 /fixtures payload that we consume.
export type ApiFixture = {
  fixture: {
    id: number;
    date: string;
    venue?: { id: number | null; name: string | null; city: string | null };
    status: { long: string; short: string; elapsed: number | null; extra?: number | null };
  };
  league: { id: number; season: number; round: string };
  teams: {
    home: { id: number; name: string; logo?: string };
    away: { id: number; name: string; logo?: string };
  };
  goals: { home: number | null; away: number | null };
};

const STATUS: Record<string, MatchStatus> = {
  TBD: 'scheduled',
  NS: 'scheduled',
  '1H': 'live',
  '2H': 'live',
  ET: 'live',
  BT: 'live',
  P: 'live',
  LIVE: 'live',
  INT: 'live',
  HT: 'halftime',
  FT: 'finished',
  AET: 'finished',
  PEN: 'finished',
  PST: 'postponed',
  SUSP: 'postponed',
  CANC: 'cancelled',
  ABD: 'cancelled',
  AWD: 'cancelled',
  WO: 'cancelled',
};

export function mapStatus(short: string): MatchStatus {
  return STATUS[short] ?? 'scheduled';
}

export function mapFixture(f: ApiFixture): Match {
  const status = mapStatus(f.fixture.status.short);
  const { home, away } = f.goals;
  const venue = f.fixture.venue?.name
    ? { name: f.fixture.venue.name, ...(f.fixture.venue.city ? { city: f.fixture.venue.city } : {}) }
    : undefined;
  return {
    id: f.fixture.id,
    competitionId: f.league.id,
    season: f.league.season,
    round: f.league.round,
    kickoffUtc: new Date(f.fixture.date).toISOString(),
    status,
    ...(status === 'live' && f.fixture.status.elapsed !== null ? { minute: f.fixture.status.elapsed } : {}),
    home: {
      id: f.teams.home.id,
      name: f.teams.home.name,
      ...(f.teams.home.logo ? { logo: f.teams.home.logo } : {}),
    },
    away: {
      id: f.teams.away.id,
      name: f.teams.away.name,
      ...(f.teams.away.logo ? { logo: f.teams.away.logo } : {}),
    },
    score: home === null || away === null ? null : { home, away },
    ...(venue ? { venue } : {}),
  };
}
