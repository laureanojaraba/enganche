import crypto from 'node:crypto';
import type { Params } from './source';

/** Stable, filesystem-safe key: path + params sorted by name (order of params does not matter). */
export function cacheKey(path: string, params: Params = {}): string {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}-${v}`)
    .join('_');
  const raw = path.replace(/^\//, '').replace(/\//g, '_') + (query ? `__${query}` : '');
  const safe = raw.replace(/[^a-zA-Z0-9._-]/g, '-');
  return safe.length <= 120
    ? safe
    : `${safe.slice(0, 80)}-${crypto.createHash('sha1').update(raw).digest('hex')}`;
}
