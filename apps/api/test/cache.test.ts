import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { CachedSource, ttlFor } from '../src/providers/cached-source';
import { cacheKey } from '../src/providers/cache-key';
import { HttpSource, QuotaCounter } from '../src/providers/http-source';
import { ProviderUnavailableError, type Params, type Source } from '../src/providers/source';

const HOUR = 3_600_000;

/** Upstream double that records calls and can be told to fail. */
function upstream() {
  const calls: string[] = [];
  let failing = false;
  const source: Source = {
    async get<T>(p: string, params?: Params) {
      calls.push(cacheKey(p, params));
      if (failing) throw new Error('network down');
      return {
        body: { path: p, n: calls.length } as T,
        meta: { updatedAt: new Date().toISOString(), stale: false, source: 'live' as const },
      };
    },
  };
  return { source, calls, fail: (v = true) => (failing = v) };
}

let dir: string;
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'enganche-cache-'));
});
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

describe('CachedSource', () => {
  it('HU-003 AC2 reuses the disk snapshot without calling the provider again', async () => {
    const up = upstream();
    const cache = new CachedSource({ upstream: up.source, mode: 'snapshot', dir });
    const first = await cache.get('/fixtures', { league: 239, season: 2024 });
    expect(first.meta.source).toBe('live');

    // A new instance (e.g. after a server restart) reads the snapshot from disk.
    const again = await new CachedSource({ upstream: up.source, mode: 'snapshot', dir }).get('/fixtures', {
      season: 2024,
      league: 239,
    });
    expect(up.calls).toHaveLength(1);
    expect(again.meta).toMatchObject({ source: 'snapshot', stale: false });
    expect(again.body).toEqual(first.body);
  });

  it('HU-003 AC3 serves standings from cache within 1 h and refetches after the TTL', async () => {
    const up = upstream();
    let now = Date.parse('2026-10-29T12:00:00Z');
    const cache = new CachedSource({ upstream: up.source, mode: 'ttl', dir, now: () => now });

    await cache.get('/standings', { league: 39, season: 2024 });
    now += 59 * 60_000;
    const cached = await cache.get('/standings', { league: 39, season: 2024 });
    expect(cached.meta.source).toBe('cache');
    expect(up.calls).toHaveLength(1);

    now += 2 * 60_000;
    const fresh = await cache.get('/standings', { league: 39, season: 2024 });
    expect(fresh.meta.source).toBe('live');
    expect(up.calls).toHaveLength(2);
  });

  it('applies a TTL per data type', () => {
    expect(ttlFor('/fixtures', { live: 'all' })).toBe(15_000);
    expect(ttlFor('/fixtures', { date: '2024-11-09' })).toBe(5 * 60_000);
    expect(ttlFor('/standings', {})).toBe(HOUR);
    expect(ttlFor('/teams', {})).toBe(24 * HOUR);
    expect(ttlFor('/leagues', {})).toBe(24 * HOUR);
  });

  it('HU-003 AC4 serves stale data when the provider fails', async () => {
    const up = upstream();
    let now = Date.parse('2026-10-29T12:00:00Z');
    const cache = new CachedSource({ upstream: up.source, mode: 'ttl', dir, now: () => now });
    const first = await cache.get('/standings', { league: 39, season: 2024 });

    now += 2 * HOUR;
    up.fail();
    const stale = await cache.get('/standings', { league: 39, season: 2024 });
    expect(stale.meta).toMatchObject({ stale: true, source: 'cache' });
    expect(stale.body).toEqual(first.body);
  });

  it('HU-003 AC4 serves stale data without calling the provider when quota is below 10 %', async () => {
    const up = upstream();
    let now = Date.parse('2026-10-29T12:00:00Z');
    let quotaLow = false;
    const cache = new CachedSource({
      upstream: up.source,
      mode: 'ttl',
      dir,
      now: () => now,
      isQuotaLow: () => quotaLow,
    });
    await cache.get('/standings', { league: 39, season: 2024 });

    now += 2 * HOUR;
    quotaLow = true;
    const stale = await cache.get('/standings', { league: 39, season: 2024 });
    expect(stale.meta.stale).toBe(true);
    expect(up.calls).toHaveLength(1);
  });

  it('throws ProviderUnavailableError when there is neither cache nor provider', async () => {
    const up = upstream();
    up.fail();
    const cache = new CachedSource({ upstream: up.source, mode: 'ttl', dir });
    await expect(cache.get('/standings', { league: 1 })).rejects.toBeInstanceOf(ProviderUnavailableError);
  });

  it('deduplicates concurrent identical requests', async () => {
    const up = upstream();
    const cache = new CachedSource({ upstream: up.source, mode: 'ttl', dir });
    await Promise.all([cache.get('/teams', { id: 1 }), cache.get('/teams', { id: 1 })]);
    expect(up.calls).toHaveLength(1);
  });
});

describe('QuotaCounter', () => {
  it('counts requests per UTC day, persists them and resets on a new day', () => {
    let now = Date.parse('2026-10-29T23:00:00Z');
    const file = path.join(dir, 'quota.json');
    const q = new QuotaCounter({ file, limit: 100, now: () => now });
    for (let i = 0; i < 95; i++) q.increment();
    expect(new QuotaCounter({ file, limit: 100, now: () => now }).remaining()).toBe(5);
    expect(q.isLow()).toBe(true);

    now = Date.parse('2026-10-30T00:01:00Z');
    expect(q.remaining()).toBe(100);
    expect(q.isLow()).toBe(false);
  });
});

describe('HttpSource', () => {
  it('sends the key, counts the request and turns API errors into exceptions', async () => {
    const seen: Array<{ url: string; key?: string }> = [];
    const quota = new QuotaCounter({ file: path.join(dir, 'quota.json'), limit: 100 });
    const fakeFetch = (async (url: string, init?: { headers?: Record<string, string> }) => {
      seen.push({ url, key: init?.headers?.['x-apisports-key'] });
      const body = url.includes('season=2026')
        ? { errors: { plan: 'Free plans do not have access to this season' }, response: [] }
        : { errors: [], response: [{ ok: 1 }] };
      return new Response(JSON.stringify(body), { status: 200 });
    }) as typeof fetch;
    const http = new HttpSource({ apiKey: 'k', fetch: fakeFetch, quota, minIntervalMs: 0 });

    const ok = await http.get<{ response: unknown[] }>('/standings', { league: 39, season: 2024 });
    expect(ok.body.response).toHaveLength(1);
    expect(seen[0]).toEqual({
      url: 'https://v3.football.api-sports.io/standings?league=39&season=2024',
      key: 'k',
    });
    await expect(http.get('/standings', { league: 39, season: 2026 })).rejects.toThrow(/plan/);
    expect(quota.remaining()).toBe(98);
  });
});
