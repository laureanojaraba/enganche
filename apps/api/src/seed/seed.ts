import type { CatalogCompetition } from '../catalog/competitions';
import type { ApiFixture } from '../providers/api-football.mapper';
import type { CachedSource } from '../providers/cached-source';
import type { Params } from '../providers/source';

export type PlannedRequest = { path: string; params: Params };

export type SeedOptions = {
  catalog: CatalogCompetition[];
  /** Simulated "now" (SIM_ANCHOR); match details are fetched for fixtures around it. */
  anchor: string;
  windowDays: number;
  /** Max network requests for this run. */
  budget: number;
  log?: (msg: string) => void;
};

export type SeedResult = {
  requested: number;
  /** Uncached requests still known to be pending (details can grow once all calendars are cached). */
  remaining: number;
  complete: boolean;
  detailsInWindow: number;
};

type SeedSource = Pick<CachedSource, 'get' | 'has'>;

const DAY = 86_400_000;

/** Phase 1: per competition, league info, teams, full-season fixtures and standings (AC3 order). */
export function buildBasePlan(catalog: CatalogCompetition[]): PlannedRequest[] {
  return [
    ...catalog.map((c) => ({ path: '/leagues', params: { id: c.id } })),
    ...catalog.map((c) => ({ path: '/teams', params: { league: c.id, season: c.season } })),
    ...catalog.map((c) => ({ path: '/fixtures', params: { league: c.id, season: c.season } })),
    ...catalog.map((c) => ({ path: '/standings', params: { league: c.id, season: c.season } })),
  ];
}

/** Days since epoch of the UTC calendar date: the window counts whole days, not hours. */
const utcDay = (iso: string) => Math.floor(Date.parse(iso) / DAY);

/** Fixture ids within the anchor's UTC date ± windowDays, read from calendars that are already cached. */
async function fixturesInWindow(source: SeedSource, opts: SeedOptions): Promise<number[] | undefined> {
  const anchor = utcDay(opts.anchor);
  const ids: number[] = [];
  for (const c of opts.catalog) {
    const params = { league: c.id, season: c.season };
    if (!source.has('/fixtures', params)) return undefined;
    const { body } = await source.get<{ response: ApiFixture[] }>('/fixtures', params);
    for (const f of body.response) {
      if (Math.abs(utcDay(f.fixture.date) - anchor) <= opts.windowDays) ids.push(f.fixture.id);
    }
  }
  return ids;
}

/** Downloads base data and match details into the snapshot cache, within a request budget. Re-run to resume. */
export async function runSeed(source: SeedSource, opts: SeedOptions): Promise<SeedResult> {
  const log = opts.log ?? console.log;
  let requested = 0;

  const fetchAll = async (plan: PlannedRequest[]) => {
    const pending = plan.filter((r) => !source.has(r.path, r.params));
    for (const [i, r] of pending.entries()) {
      if (requested >= opts.budget) return pending.length - i;
      await source.get(r.path, r.params);
      requested++;
      log(`  ${requested}/${opts.budget} ${r.path} ${JSON.stringify(r.params)}`);
    }
    return 0;
  };

  log('Fase 1: competiciones, equipos, calendarios y clasificaciones');
  const baseLeft = await fetchAll(buildBasePlan(opts.catalog));
  const ids = baseLeft ? undefined : await fixturesInWindow(source, opts);
  if (!ids) return { requested, remaining: baseLeft, complete: false, detailsInWindow: 0 };

  log(`Fase 2: fichas de ${ids.length} partidos en ${opts.anchor} ± ${opts.windowDays} día(s)`);
  const detailsLeft = await fetchAll(ids.map((id) => ({ path: '/fixtures', params: { id } })));
  return { requested, remaining: detailsLeft, complete: detailsLeft === 0, detailsInWindow: ids.length };
}
