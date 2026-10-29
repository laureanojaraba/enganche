import path from 'node:path';
import type { Config } from '../config';
import { CachedSource } from './cached-source';
import { migrateCacheDir } from './cache-key';
import { HttpSource, QuotaCounter } from './http-source';
import { SnapshotSource } from './snapshot-source';
import type { Source } from './source';

/**
 * Wires the data source for the server.
 * - Simulated clock (development/demo) or no key: only the downloaded snapshots, never the network.
 *   Past seasons do not change, and only `npm run seed` spends quota (BUG-002).
 * - Real clock with a key (premium plan): HTTP → cache with TTL and stale fallback.
 */
export function createSource(config: Config): Source {
  const dir = path.resolve(config.cacheDir);
  migrateCacheDir(dir);
  if (config.clockMode === 'simulated' || !config.apiFootballKey) return new SnapshotSource(dir);
  const http = new HttpSource({
    apiKey: config.apiFootballKey,
    quota: new QuotaCounter({ file: path.join(dir, 'quota.json') }),
  });
  return new CachedSource({
    upstream: http,
    mode: config.cacheMode,
    dir,
    isQuotaLow: () => http.isQuotaLow(),
  });
}
