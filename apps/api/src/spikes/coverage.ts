import type { CandidateCompetition } from './competitions';

// HU-002 spike: confirms which competitions, seasons and data the API-Football key can access,
// spending as few daily-quota requests as possible.

export type FetchLike = (
  url: string,
  init?: { headers?: Record<string, string> },
) => Promise<{ status: number; headers: { get(name: string): string | null }; json(): Promise<unknown> }>;

export type SpikeOptions = {
  fetch: FetchLike;
  apiKey: string;
  /** Max requests that count against the daily quota (/status is free). */
  budget?: number;
  /** Pause between counted requests, to respect the per-minute rate limit. */
  delayMs?: number;
  sleep?: (ms: number) => Promise<void>;
  /** Development season to probe besides the current one (TRD: 2024). */
  devSeason?: number;
  baseUrl?: string;
};

type Coverage = { events: boolean; lineups: boolean; statistics: boolean; standings: boolean };
export type SeasonProbe = {
  season: number;
  access: 'allowed' | 'blocked' | 'error';
  standingsRows?: number;
  detail?: string;
};

export type CompetitionResult = {
  id: number;
  expectedName: string;
  found: boolean;
  name?: string;
  country?: string;
  type?: string;
  currentSeason?: number;
  seasons: number[];
  coverage: Record<number, Coverage>;
  probes: SeasonProbe[];
  recommendedSeason?: number;
};

export type Quota = { current: number; limit: number };

export type SpikeReport = {
  startedAt: string;
  budget: number;
  requestsUsed: number;
  complete: boolean;
  quotaBefore?: Quota;
  quotaAfter?: Quota;
  results: CompetitionResult[];
};

type ApiEnvelope = { errors?: unknown; results?: number; response?: unknown };
type LeagueEntry = {
  league: { id: number; name: string; type: string };
  country: { name: string };
  seasons: Array<{
    year: number;
    current: boolean;
    coverage: {
      fixtures: { events: boolean; lineups: boolean; statistics_fixtures: boolean };
      standings: boolean;
    };
  }>;
};

class BudgetExceeded extends Error {}

const DEFAULT_BASE = 'https://v3.football.api-sports.io';

export function plannedCalls(competitions: CandidateCompetition[], devSeason = 2024): string[] {
  return [
    'GET /status',
    ...competitions.map((c) => `GET /leagues?id=${c.id}`),
    ...competitions.map(
      (c) =>
        `GET /standings?league=${c.id}&season=<actual>  y  season=${devSeason} (si es distinta; ${devSeason - 1} si ${devSeason} está bloqueada)`,
    ),
    'GET /status',
  ];
}

/** API errors come as [] or as an object such as { plan: "..." } / { rateLimit: "..." }. */
function errorsOf(body: ApiEnvelope): Record<string, string> {
  const e = body.errors;
  return e && typeof e === 'object' && !Array.isArray(e) ? (e as Record<string, string>) : {};
}

export async function runCoverageSpike(
  competitions: CandidateCompetition[],
  opts: SpikeOptions,
): Promise<SpikeReport> {
  const budget = opts.budget ?? 40;
  const delayMs = opts.delayMs ?? 7000;
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const devSeason = opts.devSeason ?? 2024;
  const base = opts.baseUrl ?? DEFAULT_BASE;
  const report: SpikeReport = {
    startedAt: new Date().toISOString(),
    budget,
    requestsUsed: 0,
    complete: true,
    results: [],
  };

  const raw = async (path: string): Promise<ApiEnvelope> => {
    const res = await opts.fetch(base + path, { headers: { 'x-apisports-key': opts.apiKey } });
    return (await res.json()) as ApiEnvelope;
  };
  const counted = async (path: string) => {
    if (report.requestsUsed >= budget) throw new BudgetExceeded();
    if (report.requestsUsed > 0) await sleep(delayMs);
    report.requestsUsed++;
    return raw(path);
  };
  const quota = async (): Promise<Quota | undefined> => {
    const body = await raw('/status');
    const req = (body.response as { requests?: { current: number; limit_day: number } } | undefined)
      ?.requests;
    return req ? { current: req.current, limit: req.limit_day } : undefined;
  };
  const probe = async (id: number, season: number): Promise<SeasonProbe> => {
    const body = await counted(`/standings?league=${id}&season=${season}`);
    const errors = errorsOf(body);
    if (errors.plan) return { season, access: 'blocked', detail: errors.plan };
    const keys = Object.keys(errors);
    if (keys.length)
      return { season, access: 'error', detail: keys.map((k) => `${k}: ${errors[k]}`).join('; ') };
    return { season, access: 'allowed', standingsRows: body.results ?? 0 };
  };

  report.quotaBefore = await quota();
  const results = competitions.map<CompetitionResult>((c) => ({
    id: c.id,
    expectedName: c.name,
    found: false,
    seasons: [],
    coverage: {},
    probes: [],
  }));
  report.results = results;

  try {
    // Pass 1: one /leagues call per competition (id, seasons, coverage flags).
    for (const r of results) {
      const body = await counted(`/leagues?id=${r.id}`);
      const entry = (body.response as LeagueEntry[] | undefined)?.[0];
      if (!entry) continue;
      r.found = true;
      r.name = entry.league.name;
      r.type = entry.league.type;
      r.country = entry.country.name;
      r.seasons = entry.seasons.map((s) => s.year).sort();
      r.currentSeason = entry.seasons.find((s) => s.current)?.year;
      for (const s of entry.seasons) {
        r.coverage[s.year] = {
          events: s.coverage.fixtures.events,
          lineups: s.coverage.fixtures.lineups,
          statistics: s.coverage.fixtures.statistics_fixtures,
          standings: s.coverage.standings,
        };
      }
    }
    // Pass 2: probe access to the current season and the development season.
    for (const r of results.filter((x) => x.found)) {
      const targets = [...new Set([r.currentSeason, devSeason].filter((s): s is number => s !== undefined))];
      for (const season of targets) r.probes.push(await probe(r.id, season));
      const dev = r.probes.find((p) => p.season === devSeason);
      if (dev?.access === 'blocked' && r.seasons.includes(devSeason - 1))
        r.probes.push(await probe(r.id, devSeason - 1));
    }
  } catch (err) {
    if (!(err instanceof BudgetExceeded)) throw err;
    report.complete = false;
  }

  for (const r of results) {
    const allowed = r.probes.filter((p) => p.access === 'allowed').map((p) => p.season);
    r.recommendedSeason = allowed.length ? Math.max(...allowed) : undefined;
  }
  report.quotaAfter = await quota();
  return report;
}

const flag = (v: boolean | undefined) => (v === undefined ? '—' : v ? '✔' : '✘');

export function renderReport(report: SpikeReport): string {
  const lines: string[] = [];
  lines.push('# Spike HU-002 — Cobertura de API-Football con la clave gratuita', '');
  lines.push(`- Fecha: ${report.startedAt}`);
  lines.push(`- Peticiones usadas: ${report.requestsUsed} de un presupuesto de ${report.budget}`);
  if (report.quotaBefore)
    lines.push(`- Cuota antes: ${report.quotaBefore.current}/${report.quotaBefore.limit}`);
  if (report.quotaAfter)
    lines.push(`- Cuota después: ${report.quotaAfter.current}/${report.quotaAfter.limit}`);
  if (!report.complete)
    lines.push('', '> ⚠ **Informe incompleto:** se alcanzó el presupuesto de peticiones antes de terminar.');
  lines.push('', '## Resumen', '');
  lines.push(
    '| ID | Competición (API) | País | Temporada actual | Acceso por temporada | Recomendada | Eventos | Alineaciones | Estadísticas | Clasificación |',
  );
  lines.push('|---|---|---|---|---|---|---|---|---|---|');
  for (const r of report.results) {
    if (!r.found) {
      lines.push(`| ${r.id} | ✘ no encontrada (${r.expectedName}) | — | — | — | — | — | — | — | — |`);
      continue;
    }
    const access = r.probes
      .map(
        (p) => `${p.season} ${p.access === 'allowed' ? '✔' : p.access === 'blocked' ? '✘ plan' : '⚠ error'}`,
      )
      .join(', ');
    const cov = r.recommendedSeason !== undefined ? r.coverage[r.recommendedSeason] : undefined;
    lines.push(
      `| ${r.id} | ${r.name} | ${r.country} | ${r.currentSeason ?? '—'} | ${access || '—'} | ${r.recommendedSeason ?? '—'} | ${flag(cov?.events)} | ${flag(cov?.lineups)} | ${flag(cov?.statistics)} | ${flag(cov?.standings)} |`,
    );
  }
  lines.push('', '## Detalle de errores y temporadas', '');
  for (const r of report.results.filter((x) => x.found)) {
    const issues = r.probes.filter((p) => p.detail).map((p) => `${p.season}: ${p.detail}`);
    lines.push(
      `- **${r.id} ${r.name}**: temporadas en la API ${r.seasons.join(', ') || '—'}${issues.length ? ` · ${issues.join(' · ')}` : ''}`,
    );
  }
  lines.push('');
  return lines.join('\n');
}
