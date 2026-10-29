import type { Match, MatchEvent, MatchEventType, MatchStatus } from '@enganche/shared';

export type ApiEvent = {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string };
  player: { id: number | null; name: string | null };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
};

// Subset of the API-Football v3 /fixtures payload that we consume.
export type ApiFixture = {
  fixture: {
    id: number;
    date: string;
    /** Unix seconds when each half started (needed by the simulated clock). */
    periods?: { first: number | null; second: number | null };
    venue?: { id: number | null; name: string | null; city: string | null };
    status: { long: string; short: string; elapsed: number | null; extra?: number | null };
  };
  league: { id: number; season: number; round: string };
  teams: {
    home: { id: number; name: string; logo?: string };
    away: { id: number; name: string; logo?: string };
  };
  goals: { home: number | null; away: number | null };
  /** Only present when a single fixture is requested by id. */
  events?: ApiEvent[];
};

function eventType(e: ApiEvent): MatchEventType {
  if (e.type === 'Goal') {
    if (e.detail === 'Own Goal') return 'own_goal';
    if (e.detail === 'Penalty') return 'penalty';
    if (e.detail === 'Missed Penalty') return 'missed_penalty';
    return 'goal';
  }
  if (e.type === 'Card') return e.detail === 'Yellow Card' ? 'card_yellow' : 'card_red';
  if (e.type === 'subst') return 'sub';
  return 'var';
}

export function mapEvent(e: ApiEvent): MatchEvent {
  const type = eventType(e);
  return {
    minute: e.time.elapsed,
    ...(e.time.extra ? { extra: e.time.extra } : {}),
    type,
    ...(type === 'var' ? { detail: e.detail } : {}),
    teamId: e.team.id,
    player: e.player.name ?? '—',
    ...(e.assist.name ? { assist: e.assist.name } : {}),
  };
}

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
