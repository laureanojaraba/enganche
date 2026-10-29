import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const healthOk = http.get('*/api/health', () =>
  HttpResponse.json({
    data: { status: 'ok', clockMode: 'simulated', version: '0.1.0' },
    meta: { updatedAt: new Date().toISOString(), stale: false, source: 'live' },
  }),
);

export const server = setupServer(healthOk);
