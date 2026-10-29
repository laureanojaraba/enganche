import fs from 'node:fs';
import path from 'node:path';
import { cacheKey } from './cache-key';
import { ProviderUnavailableError, type Params, type Source, type SourceResult } from './source';

const MIN = 60_000;
const HOUR = 60 * MIN;

export type CacheMode = 'snapshot' | 'ttl';

/** TTL per data type (TRD §4). */
export function ttlFor(path: string, params: Params = {}): number {
  if (path.startsWith('/fixtures')) return params.live !== undefined ? 15_000 : 5 * MIN;
  if (path === '/standings') return HOUR;
  if (path === '/teams' || path === '/leagues') return 24 * HOUR;
  return 5 * MIN;
}

type Entry = { storedAt: number; body: unknown };

export type CachedSourceOptions = {
  upstream: Source;
  /** snapshot: keep the first answer forever (dev, past seasons). ttl: refresh by data type (prod). */
  mode: CacheMode;
  dir: string;
  now?: () => number;
  /** When true, the provider is not called and cached data is served as stale. */
  isQuotaLow?: () => boolean;
};

/** Memory + disk cache in front of the provider, with stale fallback when it fails or quota is low. */
export class CachedSource implements Source {
  private readonly memory = new Map<string, Entry>();
  private readonly inflight = new Map<string, Promise<SourceResult>>();
  private readonly now: () => number;

  constructor(private readonly opts: CachedSourceOptions) {
    this.now = opts.now ?? Date.now;
  }

  /** True when the request is already cached (any age); never touches the network. */
  has(path: string, params: Params = {}): boolean {
    return this.read(cacheKey(path, params)) !== undefined;
  }

  get<T>(path: string, params: Params = {}): Promise<SourceResult<T>> {
    const key = cacheKey(path, params);
    const pending = this.inflight.get(key);
    if (pending) return pending as Promise<SourceResult<T>>;
    const run = this.resolve(key, path, params).finally(() => this.inflight.delete(key));
    this.inflight.set(key, run);
    return run as Promise<SourceResult<T>>;
  }

  private async resolve(key: string, path: string, params: Params): Promise<SourceResult> {
    const entry = this.read(key);
    if (entry && this.opts.mode === 'snapshot') return this.serve(entry, 'snapshot', false);
    if (entry && this.now() - entry.storedAt < ttlFor(path, params)) return this.serve(entry, 'cache', false);

    if (this.opts.isQuotaLow?.()) {
      if (entry) return this.serve(entry, 'cache', true);
      throw new ProviderUnavailableError(`Daily quota almost exhausted and no cached data for ${path}`);
    }
    try {
      const fresh = await this.opts.upstream.get(path, params);
      this.write(key, { storedAt: this.now(), body: fresh.body });
      return fresh;
    } catch (err) {
      if (entry) return this.serve(entry, 'cache', true);
      throw new ProviderUnavailableError(
        `Provider failed and no cached data for ${path}: ${(err as Error).message}`,
      );
    }
  }

  private serve(entry: Entry, source: 'cache' | 'snapshot', stale: boolean): SourceResult {
    return { body: entry.body, meta: { updatedAt: new Date(entry.storedAt).toISOString(), stale, source } };
  }

  private file(key: string) {
    return path.join(this.opts.dir, `${key}.json`);
  }

  private read(key: string): Entry | undefined {
    const hit = this.memory.get(key);
    if (hit) return hit;
    try {
      const entry = JSON.parse(fs.readFileSync(this.file(key), 'utf8')) as Entry;
      this.memory.set(key, entry);
      return entry;
    } catch {
      return undefined;
    }
  }

  private write(key: string, entry: Entry) {
    this.memory.set(key, entry);
    fs.mkdirSync(this.opts.dir, { recursive: true });
    fs.writeFileSync(this.file(key), JSON.stringify(entry));
  }
}
