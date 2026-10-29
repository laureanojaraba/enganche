import type { FastifyInstance } from 'fastify';
import type { ApiResponse, HealthStatus } from '@ladiez/shared';
import type { Config } from '../config';

export function healthRoutes(app: FastifyInstance, config: Config) {
  app.get('/api/health', async (): Promise<ApiResponse<HealthStatus>> => ({
    data: { status: 'ok', clockMode: config.clockMode, version: config.version },
    meta: { updatedAt: new Date().toISOString(), stale: false, source: 'live' },
  }));
}
