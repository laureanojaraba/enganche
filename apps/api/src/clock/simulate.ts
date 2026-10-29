import type { Match, MatchEvent } from '@enganche/shared';

const MIN = 60_000;
/** Assumed gap between kickoff and second-half start when the provider gives no periods. */
const DEFAULT_SECOND_HALF = 60 * MIN;
/** First half lasts 45' + stoppage; we treat the break as starting at 45' + 3'. */
const FIRST_HALF_PLAYED = 48 * MIN;
/** Second half 45' + an estimated stoppage before the match is considered finished. */
const SECOND_HALF_PLAYED = 50 * MIN;

export type Periods = { first?: number; second?: number };

export function matchTimeline(match: Match, periods: Periods) {
  const first = periods.first ?? Date.parse(match.kickoffUtc);
  const second = periods.second ?? first + DEFAULT_SECOND_HALF;
  return { first, second };
}

/** Data-time instant at which an event happened (stoppage time included). */
function eventAt(e: MatchEvent, t: { first: number; second: number }) {
  const extra = e.extra ?? 0;
  return e.minute <= 45 ? t.first + (e.minute - 1 + extra) * MIN : t.second + (e.minute - 46 + extra) * MIN;
}

const SCORING = new Set<MatchEvent['type']>(['goal', 'penalty', 'own_goal']);

/** Replays a past match at data time `now`: status, minute, visible events and the score they add up to. */
export function simulateMatch(match: Match, events: MatchEvent[], periods: Periods, now: number) {
  if (match.status === 'postponed' || match.status === 'cancelled') return { match, events };
  const t = matchTimeline(match, periods);
  // The provider's minute belongs to the real match; the simulated one is computed below.
  const base = { ...match };
  delete base.minute;

  if (now < t.first) return { match: { ...base, status: 'scheduled' as const, score: null }, events: [] };

  const visible = events.filter((e) => eventAt(e, t) <= now);
  const score = { home: 0, away: 0 };
  for (const e of visible) {
    if (!SCORING.has(e.type)) continue;
    if (e.teamId === match.home.id) score.home++;
    else if (e.teamId === match.away.id) score.away++;
  }
  // Without events we cannot rebuild the score; keep the provider's when the match is over.
  const finished = now >= t.second + SECOND_HALF_PLAYED;
  const finalScore = finished && events.length === 0 ? match.score : score;

  let state: Pick<Match, 'status' | 'minute'>;
  if (finished) state = { status: 'finished' };
  else if (now < t.first + FIRST_HALF_PLAYED)
    state = { status: 'live', minute: Math.min(45, Math.floor((now - t.first) / MIN) + 1) };
  else if (now < t.second) state = { status: 'halftime' };
  else state = { status: 'live', minute: Math.min(90, 46 + Math.floor((now - t.second) / MIN)) };

  return { match: { ...base, ...state, score: finalScore }, events: visible };
}
