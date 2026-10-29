import type { ApiResponse, Match, MatchDetail } from '@enganche/shared';
import type { Clock } from '../clock/clock';
import { simulateMatch } from '../clock/simulate';
import type { ApiFootballProvider, FixtureQuery } from '../providers/api-football.provider';

/** Applies the clock to provider data: in simulated mode, past matches are replayed as if today. */
export class MatchService {
  constructor(
    private readonly provider: ApiFootballProvider,
    private readonly clock: Clock,
  ) {}

  async listFixtures(q: FixtureQuery): Promise<ApiResponse<Match[]>> {
    if (this.clock.mode === 'real') return this.provider.listFixtures(q);

    // Simulated mode reads the whole season calendar (downloaded by the seed, so no new cache keys
    // or provider calls) and filters it here. from/to are display days, compared after projecting
    // each kickoff to display time (BUG-003).
    const res = await this.provider.listFixtures({ league: q.league, season: q.season });
    const start = q.from && `${q.from}T00:00:00.000Z`;
    const end = q.to && `${q.to}T23:59:59.999Z`;
    const inRange = (m: Match) => {
      const k = this.clock.project(m.kickoffUtc);
      return (!start || k >= start) && (!end || k <= end) && (!q.round || m.round === q.round);
    };

    const now = this.clock.dataNow();
    const data = await Promise.all(
      res.data.filter(inRange).map(async (m) => {
        const sim = simulateMatch(m, [], {}, now).match;
        if (sim.status !== 'live' && sim.status !== 'halftime') return this.display(sim);
        // Listings carry no events: the live score comes from the match detail when it is cached.
        try {
          return (await this.getMatch(m.id)).data.match;
        } catch {
          return this.display({ ...sim, score: null });
        }
      }),
    );
    return { ...res, data };
  }

  async getMatch(id: number): Promise<ApiResponse<MatchDetail>> {
    const { data, meta } = await this.provider.getMatch(id);
    if (this.clock.mode === 'real') return { data: { match: data.match, events: data.events }, meta };
    const sim = simulateMatch(data.match, data.events, data.periods, this.clock.dataNow());
    return { data: { match: this.display(sim.match), events: sim.events }, meta };
  }

  private display(m: Match): Match {
    return { ...m, kickoffUtc: this.clock.project(m.kickoffUtc) };
  }
}
