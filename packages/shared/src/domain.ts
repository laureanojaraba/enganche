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

export const MatchEventType = z.enum([
  'goal',
  'penalty',
  'own_goal',
  'missed_penalty',
  'card_yellow',
  'card_red',
  'sub',
  'var',
]);
export type MatchEventType = z.infer<typeof MatchEventType>;

export const MatchEvent = z.object({
  /** Regular-time minute (1–90, or 91–120 in extra time). */
  minute: z.number().int(),
  /** Stoppage minutes on top of `minute` (45+3 → minute 45, extra 3). */
  extra: z.number().int().optional(),
  type: MatchEventType,
  /** Provider wording, e.g. "Goal cancelled" for VAR events. */
  detail: z.string().optional(),
  /** Team credited with the event; for own goals, the team that benefits. */
  teamId: z.number().int(),
  player: z.string(),
  /** Assist for goals; for substitutions, the other player of the change. */
  assist: z.string().optional(),
});
export type MatchEvent = z.infer<typeof MatchEvent>;

export const MatchDetail = z.object({ match: Match, events: z.array(MatchEvent) });
export type MatchDetail = z.infer<typeof MatchDetail>;
