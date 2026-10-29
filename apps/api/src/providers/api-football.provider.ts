import type { ApiResponse, Match } from '@enganche/shared';
import { mapFixture, type ApiFixture } from './api-football.mapper';
import type { Source } from './source';

export type FixtureQuery = { league: number; season: number; from?: string; to?: string; round?: string };

/** Domain-level access to API-Football: returns our types with provider metadata. */
export class ApiFootballProvider {
  constructor(private readonly source: Source) {}

  async listFixtures(q: FixtureQuery): Promise<ApiResponse<Match[]>> {
    const { body, meta } = await this.source.get<{ response: ApiFixture[] }>('/fixtures', q);
    return { data: body.response.map(mapFixture), meta };
  }
}
