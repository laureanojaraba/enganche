import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { findCompetition } from '../catalog/competitions';
import type { ApiFootballProvider } from '../providers/api-football.provider';
import type { CompetitionService } from '../services/competition-service';
import type { MatchService } from '../services/match-service';
import type { RoundService } from '../services/round-service';

const Params = z.object({ id: z.coerce.number().int().positive() });

const MAX_RANGE_DAYS = 31;

// Strict input: free-form values would create unbounded cache entries and provider calls (BUG-002).
const Query = z
  .object({
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
    round: z
      .string()
      .regex(/^[\p{L}\p{N} ._-]{1,40}$/u)
      .optional(),
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, { message: 'from must be before to' })
  .refine((q) => !q.from || !q.to || Date.parse(q.to) - Date.parse(q.from) <= MAX_RANGE_DAYS * 86_400_000, {
    message: `range limited to ${MAX_RANGE_DAYS} days`,
  });

const badRequest = (reply: FastifyReply) =>
  reply.code(400).send({ error: { code: 'BAD_REQUEST', message: 'Parámetros inválidos' } });

/** Validates :id and returns the catalog competition, or sends 400/404 and returns undefined. */
function competitionFrom(params: unknown, reply: FastifyReply) {
  const parsed = Params.safeParse(params);
  if (!parsed.success) {
    badRequest(reply);
    return undefined;
  }
  const competition = findCompetition(parsed.data.id);
  if (!competition) {
    reply.code(404).send({
      error: {
        code: 'COMPETITION_NOT_SUPPORTED',
        message: `La competición ${parsed.data.id} no está disponible en enganche`,
      },
    });
  }
  return competition;
}

export function competitionRoutes(
  app: FastifyInstance,
  deps: {
    competitions: CompetitionService;
    matches: MatchService;
    rounds: RoundService;
    provider: ApiFootballProvider;
  },
) {
  app.get('/api/competitions', () => deps.competitions.catalog());

  app.get('/api/competitions/:id/matches', async (req, reply) => {
    const query = Query.safeParse(req.query);
    if (!query.success) return badRequest(reply);
    const competition = competitionFrom(req.params, reply);
    if (!competition) return reply;
    return deps.matches.listFixtures({ league: competition.id, season: competition.season, ...query.data });
  });

  app.get('/api/competitions/:id/rounds', async (req, reply) => {
    const competition = competitionFrom(req.params, reply);
    if (!competition) return reply;
    return deps.rounds.schedule(competition);
  });

  // Season table as provided (final 2024 table in simulated mode: the provider has no historical tables).
  app.get('/api/competitions/:id/standings', async (req, reply) => {
    const competition = competitionFrom(req.params, reply);
    if (!competition) return reply;
    return deps.provider.getStandings(competition.id, competition.season);
  });
}
