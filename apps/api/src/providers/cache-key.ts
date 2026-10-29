import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Params } from './source';

/** Canonical form of a request: path + params sorted by name, values as strings (as the provider echoes them). */
function canonical(p: string, params: Params): string {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => [k, String(v)] as const)
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify([p, entries]);
}

/**
 * Stable, filesystem-safe and collision-free key (BUG-001): a readable prefix for humans plus a hash
 * of the canonical request, so two different requests never share a cache entry.
 */
export function cacheKey(p: string, params: Params = {}): string {
  const readable = (
    p.replace(/^\//, '').replace(/\//g, '_') +
    '__' +
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}-${v}`)
      .join('_')
  )
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .slice(0, 80);
  const hash = crypto.createHash('sha1').update(canonical(p, params)).digest('hex').slice(0, 16);
  return `${readable}-${hash}`;
}

/**
 * Renames cache files written with the old (collision-prone) key format to the new keys, using the
 * request that API-Football echoes in every body (`get` + `parameters`). No network. Returns how many moved.
 */
export function migrateCacheDir(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  let moved = 0;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json') || file === 'quota.json') continue;
    const full = path.join(dir, file);
    let entry: { body?: { get?: unknown; parameters?: unknown } };
    try {
      entry = JSON.parse(fs.readFileSync(full, 'utf8'));
    } catch {
      continue;
    }
    const { get, parameters } = entry.body ?? {};
    if (typeof get !== 'string' || !parameters || typeof parameters !== 'object') continue;
    const target = `${cacheKey(`/${get}`, parameters as Params)}.json`;
    if (target === file) continue;
    fs.renameSync(full, path.join(dir, target));
    moved++;
  }
  return moved;
}
