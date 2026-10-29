import { describe, expect, it } from 'vitest';
import { apiResponse, HealthStatus } from '../src/index';

describe('HealthStatus (HU-001 AC2)', () => {
  it('accepts a valid health payload', () => {
    const result = HealthStatus.safeParse({ status: 'ok', clockMode: 'simulated', version: '0.1.0' });
    expect(result.success).toBe(true);
  });

  it('rejects an unknown status or clock mode', () => {
    expect(HealthStatus.safeParse({ status: 'meh', clockMode: 'simulated', version: '0.1.0' }).success).toBe(
      false,
    );
    expect(HealthStatus.safeParse({ status: 'ok', clockMode: 'fake', version: '0.1.0' }).success).toBe(false);
  });
});

describe('apiResponse', () => {
  it('wraps data with meta', () => {
    const schema = apiResponse(HealthStatus);
    const parsed = schema.parse({
      data: { status: 'ok', clockMode: 'real', version: '1.0.0' },
      meta: { updatedAt: '2026-10-29T12:00:00.000Z', stale: false, source: 'live' },
    });
    expect(parsed.meta.stale).toBe(false);
  });
});
