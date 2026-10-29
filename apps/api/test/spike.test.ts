import { describe, expect, it } from 'vitest';
import { COMPETITIONS } from '../src/spikes/competitions';
import { plannedCalls, renderReport, runCoverageSpike, type FetchLike } from '../src/spikes/coverage';

type Fake = { calls: string[]; fetch: FetchLike };

// Fake API-Football: every league exists with seasons 2022..2025 (2025 current);
// the free plan blocks 2025, so /standings answers with errors.plan for it.
function fakeApi(blocked: number[] = [2025]): Fake {
  const calls: string[] = [];
  const json = (body: unknown) => ({ status: 200, headers: { get: () => null }, json: async () => body });
  const fetch: FetchLike = async (url) => {
    calls.push(url);
    const u = new URL(url);
    if (u.pathname === '/status') {
      return json({ errors: [], response: { requests: { current: calls.length, limit_day: 100 } } });
    }
    if (u.pathname === '/leagues') {
      const id = Number(u.searchParams.get('id'));
      const seasons = [2022, 2023, 2024, 2025].map((year) => ({
        year,
        current: year === 2025,
        coverage: {
          fixtures: {
            events: true,
            lineups: year >= 2023,
            statistics_fixtures: true,
            statistics_players: false,
          },
          standings: true,
        },
      }));
      return json({
        errors: [],
        results: 1,
        response: [{ league: { id, name: `League ${id}`, type: 'League' }, country: { name: 'X' }, seasons }],
      });
    }
    if (u.pathname === '/standings') {
      const season = Number(u.searchParams.get('season'));
      if (blocked.includes(season)) {
        return json({
          errors: { plan: 'Free plans do not have access to this season.' },
          results: 0,
          response: [],
        });
      }
      return json({ errors: [], results: 1, response: [{}] });
    }
    throw new Error(`unexpected ${url}`);
  };
  return { calls, fetch };
}

const counted = (calls: string[]) => calls.filter((c) => !c.includes('/status')).length;
const opts = (fetch: FetchLike, extra = {}) => ({ fetch, apiKey: 'k', sleep: async () => {}, ...extra });

describe('API-Football coverage spike', () => {
  it('HU-002 AC2 uses at most 40 quota requests and reads /status', async () => {
    const api = fakeApi();
    const report = await runCoverageSpike(COMPETITIONS, opts(api.fetch));
    expect(counted(api.calls)).toBeLessThanOrEqual(40);
    expect(report.requestsUsed).toBe(counted(api.calls));
    expect(api.calls.some((c) => c.endsWith('/status'))).toBe(true);
    expect(report.quotaAfter).toBeDefined();
    expect(report.results).toHaveLength(10);
    expect(report.complete).toBe(true);
  });

  it('marks plan-restricted seasons as blocked and recommends the latest allowed one', async () => {
    const report = await runCoverageSpike(COMPETITIONS.slice(0, 1), opts(fakeApi([2025]).fetch));
    const r = report.results[0]!;
    expect(r.currentSeason).toBe(2025);
    expect(r.probes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ season: 2025, access: 'blocked' }),
        expect.objectContaining({ season: 2024, access: 'allowed' }),
      ]),
    );
    expect(r.recommendedSeason).toBe(2024);
  });

  it('falls back to 2023 when 2024 is also blocked', async () => {
    const report = await runCoverageSpike(COMPETITIONS.slice(0, 1), opts(fakeApi([2025, 2024]).fetch));
    expect(report.results[0]!.recommendedSeason).toBe(2023);
  });

  it('stops at the budget and flags the report as incomplete', async () => {
    const api = fakeApi();
    const report = await runCoverageSpike(COMPETITIONS, opts(api.fetch, { budget: 5 }));
    expect(counted(api.calls)).toBe(5);
    expect(report.complete).toBe(false);
    expect(renderReport(report)).toMatch(/incompleto/i);
  });

  it('dry run lists planned calls without network', () => {
    const calls = plannedCalls(COMPETITIONS);
    expect(calls[0]).toBe('GET /status');
    expect(calls.filter((c) => c.startsWith('GET /leagues'))).toHaveLength(10);
  });

  it('renders one row per competition with coverage flags', async () => {
    const report = await runCoverageSpike(COMPETITIONS.slice(0, 2), opts(fakeApi().fetch));
    const md = renderReport(report);
    expect(md).toContain('| 239 |');
    expect(md).toContain('2024 ✔');
    expect(md).toContain('2025 ✘ plan');
  });
});
