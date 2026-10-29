import type { ApiResponse, Competition, CompetitionCatalog } from '@enganche/shared';
import { CATALOG } from '../catalog/competitions';
import type { Source } from '../providers/source';

type LeagueBody = { response: Array<{ league: { type: string; logo?: string } }> };

/** Our catalog enriched with provider data (logo, type) from /leagues, which is cached for 24 h. */
export class CompetitionService {
  constructor(private readonly source: Source) {}

  async catalog(): Promise<ApiResponse<CompetitionCatalog>> {
    let updatedAt = new Date(0).toISOString();
    let stale = false;
    const all = await Promise.all(
      CATALOG.map(async (c): Promise<Competition> => {
        const base = { id: c.id, name: c.name, region: c.region, section: c.section, season: c.season };
        try {
          const { body, meta } = await this.source.get<LeagueBody>('/leagues', { id: c.id });
          if (meta.updatedAt > updatedAt) updatedAt = meta.updatedAt;
          stale ||= meta.stale;
          const league = body.response[0]?.league;
          return {
            ...base,
            type: league?.type === 'Cup' ? 'cup' : 'league',
            ...(league?.logo ? { logo: league.logo } : {}),
          };
        } catch {
          // The catalog still renders without provider data (no logo).
          stale = true;
          return { ...base, type: c.section === 'international' ? 'cup' : 'league' };
        }
      }),
    );
    return {
      data: {
        leagues: all.filter((c) => c.section === 'leagues'),
        international: all.filter((c) => c.section === 'international'),
      },
      meta: { updatedAt, stale, source: 'cache' },
    };
  }
}
