import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { findCompetition } from '../catalog/competitions';
import type { CompetitionService } from '../services/competition-service';
import type { MatchService } from '../services/match-service';

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

export function competitionRoutes(
  app: FastifyInstance,
  deps: { competitions: CompetitionService; matches: MatchService },
) {
  app.get('/api/competitions', () => deps.competitions.catalog());

  app.get('/api/competitions/:id/matches', async (req, reply) => {
    const params = Params.safeParse(req.params);
    const query = Query.safeParse(req.query);
    if (!params.success || !query.success) {
      return reply.code(400).send({ error: { code: 'BAD_REQUEST', message: 'Parámetros inválidos' } });
    }
    const competition = findCompetition(params.data.id);
    if (!competition) {
      return reply.code(404).send({
        error: {
          code: 'COMPETITION_NOT_SUPPORTED',
          message: `La competición ${params.data.id} no está disponible en enganche`,
        },
      });
    }
    return deps.matches.listFixtures({ league: competition.id, season: competition.season, ...query.data });
  });
}
