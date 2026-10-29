import { z } from 'zod';

/** Metadata attached to every response of the ladiez API. */
export const ApiMeta = z.object({
  updatedAt: z.iso.datetime(),
  /** true when served from cache because the provider failed or quota is low. */
  stale: z.boolean(),
  source: z.enum(['live', 'cache', 'snapshot']),
});
export type ApiMeta = z.infer<typeof ApiMeta>;

/** Envelope `{ data, meta }` shared by all endpoints. */
export const apiResponse = <T extends z.ZodType>(data: T) => z.object({ data, meta: ApiMeta });
export type ApiResponse<T> = { data: T; meta: ApiMeta };

export const ClockMode = z.enum(['simulated', 'real']);
export type ClockMode = z.infer<typeof ClockMode>;

export const HealthStatus = z.object({
  status: z.enum(['ok', 'degraded']),
  clockMode: ClockMode,
  version: z.string(),
});
export type HealthStatus = z.infer<typeof HealthStatus>;
