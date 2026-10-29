import type { ApiMeta } from '@enganche/shared';

export type Params = Record<string, string | number | undefined>;
export type SourceResult<T = unknown> = { body: T; meta: ApiMeta };

/** Raw access to the data provider; layers (HTTP, cache, snapshot) implement and compose it. */
export interface Source {
  get<T = unknown>(path: string, params?: Params): Promise<SourceResult<T>>;
}

/** The provider answered with an error payload (e.g. plan restriction, rate limit). */
export class ProviderError extends Error {}

/** Neither the provider nor the cache can serve the request. */
export class ProviderUnavailableError extends Error {}
