import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildApp } from '../src/app';
import { RealClock } from '../src/clock/clock';
import { loadConfig } from '../src/config';
import { createSource } from '../src/providers';
import { CachedSource } from '../src/providers/cached-source';
import { HttpSource, QuotaCounter } from '../src/providers/http-source';
import { SnapshotSource } from '../src/providers/snapshot-source';
import { ProviderUnavailableError, type Source } from '../src/providers/source';

const ok: Source = {
  async get<T>() {
    return {
      body: { response: [] } as T,
      meta: { updatedAt: '2026-10-29T12:00:00.000Z', stale: false, source: 'snapshot' as const },
    };
  },
};

let dir: string;
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'enganche-sec-'));
});
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

const app = (env: Record<string, string> = {}, source: Source = ok) =>
  buildApp(loadConfig({ CLOCK_MODE: 'real', ...env }), { source, clock: new RealClock() });

describe('BUG-002 input validation', () => {
  it.each([
    ['round with symbols', '?round=Regular%3FSeason%20-%2012'],
    ['round too long', `?round=${'a'.repeat(41)}`],
    ['from after to', '?from=2024-10-25&to=2024-10-20'],
    ['range over 31 days', '?from=2024-08-01&to=2024-10-01'],
    ['invalid date', '?from=2024-13-01'],
  ])('BUG-002 rejects %s with 400', async (_label, query) => {
    const a = app();
    const res = await a.inject({ method: 'GET', url: `/api/competitions/39/matches${query}` });
    expect(res.statusCode).toBe(400);
    await a.close();
  });

  it('accepts a normal round', async () => {
    const a = app();
    const res = await a.inject({
      method: 'GET',
      url: '/api/competitions/39/matches?round=Regular%20Season%20-%209',
    });
    expect(res.statusCode).toBe(200);
    await a.close();
  });
});

describe('BUG-002 HTTP protections', () => {
  it('BUG-002 rate-limits each client', async () => {
    const a = app({ RATE_LIMIT_MAX: '3' });
    const codes = [];
    for (let i = 0; i < 4; i++)
      codes.push((await a.inject({ method: 'GET', url: '/api/health' })).statusCode);
    expect(codes).toEqual([200, 200, 200, 429]);
    await a.close();
  });

  it('BUG-002 sends security headers and only allows the configured origin', async () => {
    const a = app({ CORS_ORIGIN: 'http://localhost:5173' });
    const allowed = await a.inject({
      method: 'GET',
      url: '/api/health',
      headers: { origin: 'http://localhost:5173' },
    });
    expect(allowed.headers['x-content-type-options']).toBe('nosniff');
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    const other = await a.inject({
      method: 'GET',
      url: '/api/health',
      headers: { origin: 'https://evil.example' },
    });
    expect(other.headers['access-control-allow-origin']).toBeUndefined();
    await a.close();
  });

  it('BUG-002 answers 503 without internal details when data is unavailable', async () => {
    const failing: Source = {
      get: () =>
        Promise.reject(new ProviderUnavailableError('Provider failed: API-Football 403 on /fixtures (plan)')),
    };
    const a = app({}, failing);
    const res = await a.inject({ method: 'GET', url: '/api/competitions/39/matches' });
    expect(res.statusCode).toBe(503);
    expect(res.json()).toMatchObject({ error: { code: 'DATA_UNAVAILABLE' } });
    expect(res.body).not.toContain('API-Football');
    await a.close();
  });
});

describe('BUG-002 quota protection', () => {
  it('BUG-002 never calls the provider from the server in simulated mode', () => {
    const config = loadConfig({ CLOCK_MODE: 'simulated', API_FOOTBALL_KEY: 'k', CACHE_DIR: dir });
    expect(createSource(config)).toBeInstanceOf(SnapshotSource);
  });

  it('uses the provider with cache in real mode', () => {
    const config = loadConfig({ CLOCK_MODE: 'real', API_FOOTBALL_KEY: 'k', CACHE_DIR: dir });
    expect(createSource(config)).toBeInstanceOf(CachedSource);
  });

  it('BUG-002 bounds the HTTP queue', async () => {
    const slowFetch = (() => new Promise<Response>(() => {})) as unknown as typeof fetch;
    const http = new HttpSource({
      apiKey: 'k',
      fetch: slowFetch,
      quota: new QuotaCounter({ file: path.join(dir, 'quota.json') }),
      minIntervalMs: 0,
      maxQueue: 2,
    });
    void http.get('/a');
    void http.get('/b');
    await expect(http.get('/c')).rejects.toBeInstanceOf(ProviderUnavailableError);
  });

  it('BUG-002 bounds the in-memory cache', async () => {
    const cache = new CachedSource({ upstream: ok, mode: 'ttl', dir, maxMemoryEntries: 2 });
    for (const id of [1, 2, 3, 4]) await cache.get('/teams', { id });
    expect(cache.memorySize()).toBe(2);
    expect(cache.has('/teams', { id: 1 })).toBe(true); // still on disk
  });
});
