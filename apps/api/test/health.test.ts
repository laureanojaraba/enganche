import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { apiResponse, HealthStatus } from '@enganche/shared';
import { buildApp } from '../src/app';
import { loadConfig } from '../src/config';

describe('GET /api/health', () => {
  const app = buildApp(loadConfig({ CLOCK_MODE: 'simulated' }));
  beforeAll(() => app.ready());
  afterAll(() => app.close());

  it('HU-001 AC1 responds 200 with a valid health payload', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
    const body = apiResponse(HealthStatus).parse(res.json());
    expect(body.data).toMatchObject({ status: 'ok', clockMode: 'simulated' });
  });
});

describe('loadConfig', () => {
  it('applies defaults and rejects an invalid clock mode', () => {
    expect(loadConfig({})).toMatchObject({ port: 3000, clockMode: 'simulated', cacheMode: 'snapshot' });
    expect(() => loadConfig({ CLOCK_MODE: 'fake' })).toThrow();
  });
});
