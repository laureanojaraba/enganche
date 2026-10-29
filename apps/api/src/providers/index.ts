import path from 'node:path';
import type { Config } from '../config';
import { CachedSource } from './cached-source';
import { HttpSource, QuotaCounter } from './http-source';
import { SnapshotSource } from './snapshot-source';
import type { Source } from './source';

/** Wires HTTP → cache. Without an API key it runs offline from the snapshots (no quota used). */
export function createSource(config: Config): Source {
  const dir = path.resolve(config.cacheDir);
  if (!config.apiFootballKey) return new SnapshotSource(dir);
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
