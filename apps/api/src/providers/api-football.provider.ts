import type { ApiResponse, Match } from '@enganche/shared';
import { mapEvent, mapFixture, type ApiEvent, type ApiFixture } from './api-football.mapper';
import { ProviderUnavailableError, type Source } from './source';

export type FixtureQuery = { league: number; season: number; from?: string; to?: string; round?: string };

/** Match plus what the simulated clock needs to replay it (half start times). */
export type RawMatchDetail = {
  match: Match;
  events: ReturnType<typeof mapEvent>[];
  periods: { first?: number; second?: number };
};

/** Domain-level access to API-Football: returns our types with provider metadata. */
export class ApiFootballProvider {
  constructor(private readonly source: Source) {}

  async listFixtures(q: FixtureQuery): Promise<ApiResponse<Match[]>> {
    const { body, meta } = await this.source.get<{ response: ApiFixture[] }>('/fixtures', q);
    return { data: body.response.map(mapFixture), meta };
  }

  /** Full match (events included) — one request per match on the free plan. */
  async getMatch(id: number): Promise<ApiResponse<RawMatchDetail>> {
    const { body, meta } = await this.source.get<{ response: ApiFixture[] }>('/fixtures', { id });
    const f = body.response[0];
    if (!f) throw new ProviderUnavailableError(`Match ${id} not found`);
    const p = f.fixture.periods;
    return {
      data: {
        match: mapFixture(f),
        events: (f.events ?? []).map((e: ApiEvent) => mapEvent(e)),
        periods: {
          ...(p?.first ? { first: p.first * 1000 } : {}),
          ...(p?.second ? { second: p.second * 1000 } : {}),
        },
      },
      meta,
    };
  }
}
