import { apiResponse } from '@enganche/shared';
import type { z } from 'zod';

/** GETs one of our API endpoints and validates the `{ data, meta }` envelope against `schema`. */
export async function fetchApi<T extends z.ZodType>(url: string, schema: T, signal?: AbortSignal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return apiResponse(schema).parse(await res.json());
}
