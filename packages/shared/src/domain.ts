import { z } from 'zod';

// Domain types (TRD §3). Provider adapters translate their payloads into these shapes,
// so the web never depends on a specific data provider.

export const TeamRef = z.object({
  id: z.number().int(),
  name: z.string(),
  logo: z.url().optional(),
});
export type TeamRef = z.infer<typeof TeamRef>;

export const MatchStatus = z.enum(['scheduled', 'live', 'halftime', 'finished', 'postponed', 'cancelled']);
export type MatchStatus = z.infer<typeof MatchStatus>;

export const Score = z.object({ home: z.number().int(), away: z.number().int() });
export type Score = z.infer<typeof Score>;

export const Match = z.object({
  id: z.number().int(),
  competitionId: z.number().int(),
  season: z.number().int(),
  round: z.string(),
  kickoffUtc: z.iso.datetime(),
  status: MatchStatus,
  /** Elapsed minute, only while the match is in play. */
  minute: z.number().int().optional(),
  home: TeamRef,
  away: TeamRef,
  /** null before kickoff. */
  score: Score.nullable(),
  venue: z.object({ name: z.string(), city: z.string().optional() }).optional(),
});
export type Match = z.infer<typeof Match>;
