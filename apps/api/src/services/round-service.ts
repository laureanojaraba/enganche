import type { ApiResponse, Match, Round, RoundsSchedule } from '@enganche/shared';
import type { CatalogCompetition } from '../catalog/competitions';
import type { MatchService } from './match-service';

const byKickoff = (a: Match, b: Match) => a.kickoffUtc.localeCompare(b.kickoffUtc);
/** Numbered rounds ("Regular Season - 9") are single matchdays; the rest are knockouts. */
const isKnockout = (name: string) => !/- \d+$/.test(name);
const pairKey = (m: Match) => [m.home.id, m.away.id].sort((a, b) => a - b).join('-');

/** Splits a knockout round into first and second legs when every tie is played twice. */
function splitLegs(name: string, matches: Match[]): Round[] {
  if (!isKnockout(name)) return [{ name, matches }];
  const ties = new Map<string, Match[]>();
  for (const m of matches) ties.set(pairKey(m), [...(ties.get(pairKey(m)) ?? []), m]);
  if ([...ties.values()].some((t) => t.length !== 2)) return [{ name, matches }];
  const first: Match[] = [];
  const second: Match[] = [];
  for (const [a, b] of ties.values()) {
    first.push(a!);
    second.push(b!);
  }
  return [
    { name, leg: 1, matches: first.sort(byKickoff) },
    { name, leg: 2, matches: second.sort(byKickoff) },
  ];
}

const WEEK = 7 * 86_400_000;
const median = (r: Round) => Date.parse(r.matches[Math.floor(r.matches.length / 2)]!.kickoffUtc);

/**
 * A round is "behind" for a match when the match was rescheduled long after the round was played:
 * fewer than half of its matches are pending and its median kickoff is over a week before the match
 * (e.g. Brasileirão 2024 round 17 had a game left for late October).
 */
function isBehind(r: Round, m: Match) {
  const pending = r.matches.filter((x) => x.status === 'scheduled').length;
  return pending < r.matches.length / 2 && median(r) < Date.parse(m.kickoffUtc) - WEEK;
}

/** Live round first; otherwise the round of the next scheduled match, skipping rescheduled leftovers. */
function currentRound(rounds: Round[]): number {
  const roundOf = new Map(rounds.flatMap((r, i) => r.matches.map((m) => [m.id, i] as const)));
  const all = rounds.flatMap((r) => r.matches).sort(byKickoff);

  const live = all.filter((m) => m.status === 'live' || m.status === 'halftime');
  if (live.length) return roundOf.get(live[0]!.id)!;

  // Postponed/cancelled matches are not "scheduled", so they never keep an old round open.
  const next = all.filter((m) => m.status === 'scheduled');
  const upcoming = next.find((m) => !isBehind(rounds[roundOf.get(m.id)!]!, m)) ?? next[0];
  return upcoming ? roundOf.get(upcoming.id)! : Math.max(0, rounds.length - 1);
}

/** The season calendar grouped by round, in playing order, with the current round (HU-013). */
export class RoundService {
  constructor(private readonly matches: MatchService) {}

  async schedule(c: CatalogCompetition): Promise<ApiResponse<RoundsSchedule>> {
    const { data, meta } = await this.matches.listFixtures({ league: c.id, season: c.season });
    const byRound = new Map<string, Match[]>();
    for (const m of [...data].sort(byKickoff)) byRound.set(m.round, [...(byRound.get(m.round) ?? []), m]);

    // Map insertion order follows the sorted kickoffs, so rounds come out in playing order.
    const rounds = [...byRound].flatMap(([name, matches]) => splitLegs(name, matches));
    rounds.sort((a, b) => byKickoff(a.matches[0]!, b.matches[0]!));

    return { data: { current: currentRound(rounds), rounds }, meta };
  }
}
