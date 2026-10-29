import path from 'node:path';
import type { Config } from '../config';
import { ApiFootballProvider } from './api-football.provider';
import { CachedSource } from './cached-source';
import { HttpSource, QuotaCounter } from './http-source';
import { SnapshotSource } from './snapshot-source';

/** Wires HTTP → cache → domain provider. Without an API key it runs offline from the snapshots. */
export function createFootballProvider(config: Config) {
  const dir = path.resolve(config.cacheDir);
  if (!config.apiFootballKey) return new ApiFootballProvider(new SnapshotSource(dir));
  const http = new HttpSource({
    apiKey: config.apiFootballKey,
    quota: new QuotaCounter({ file: path.join(dir, 'quota.json') }),
  });
  return new ApiFootballProvider(
    new CachedSource({ upstream: http, mode: config.cacheMode, dir, isQuotaLow: () => http.isQuotaLow() }),
  );
}
