import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { createClock, type Clock } from './clock/clock';
import type { Config } from './config';
import { createSource } from './providers';
import { ApiFootballProvider } from './providers/api-football.provider';
import { ProviderUnavailableError, type Source } from './providers/source';
import { competitionRoutes } from './routes/competitions';
import { healthRoutes } from './routes/health';
import { CompetitionService } from './services/competition-service';
import { MatchService } from './services/match-service';

export type AppDeps = { source?: Source; clock?: Clock };

/** Builds the Fastify app without listening, so tests can use `app.inject` with injected dependencies. */
export function buildApp(config: Config, deps: AppDeps = {}, opts: { logger?: boolean } = {}) {
  const app = Fastify({ logger: opts.logger ?? false });
  const source = deps.source ?? createSource(config);
  const clock = deps.clock ?? createClock(config);
  const provider = new ApiFootballProvider(source);
  const matches = new MatchService(provider, clock);

  // TRD §6: security headers, a single allowed origin and a per-client rate limit.
  app.register(helmet);
  // A list (not a string) makes the plugin answer only to that origin instead of always echoing it.
  app.register(cors, { origin: [config.corsOrigin] });
  app.register(rateLimit, { max: config.rateLimitMax, timeWindow: '1 minute' });

  app.setErrorHandler((err, req, reply) => {
    if (err instanceof ProviderUnavailableError) {
      req.log.warn({ err }, 'data unavailable');
      return reply.code(503).send({
        error: { code: 'DATA_UNAVAILABLE', message: 'Los datos no están disponibles en este momento' },
      });
    }
    const status = (err as { statusCode?: number }).statusCode;
    if (status && status < 500) return reply.code(status).send(err);
    req.log.error({ err }, 'unexpected error');
    return reply.code(500).send({ error: { code: 'INTERNAL', message: 'Error interno' } });
  });

  // Routes go in a child context registered after the plugins, so the rate limit applies to them.
  app.register(async (api) => {
    healthRoutes(api, config);
    competitionRoutes(api, { competitions: new CompetitionService(source), matches, provider });
  });
  return app;
}
