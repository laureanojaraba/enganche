import Fastify from 'fastify';
import { createClock, type Clock } from './clock/clock';
import type { Config } from './config';
import { createSource } from './providers';
import { ApiFootballProvider } from './providers/api-football.provider';
import type { Source } from './providers/source';
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
  const matches = new MatchService(new ApiFootballProvider(source), clock);

  healthRoutes(app, config);
  competitionRoutes(app, { competitions: new CompetitionService(source), matches });
  return app;
}
