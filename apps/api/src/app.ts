import Fastify from 'fastify';
import type { Config } from './config';
import { healthRoutes } from './routes/health';

/** Builds the Fastify app without listening, so tests can use `app.inject`. */
export function buildApp(config: Config, opts: { logger?: boolean } = {}) {
  const app = Fastify({ logger: opts.logger ?? false });
  healthRoutes(app, config);
  return app;
}
