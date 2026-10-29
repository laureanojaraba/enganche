import { CachedSource } from './cached-source';
import { ProviderUnavailableError, type Params, type Source, type SourceResult } from './source';

const offline: Source = {
  get() {
    return Promise.reject(new ProviderUnavailableError('offline'));
  },
};

/** Serves only what is already cached on disk; never calls the network (offline demo, tests). */
export class SnapshotSource implements Source {
  private readonly cache: CachedSource;

  constructor(dir: string) {
    this.cache = new CachedSource({ upstream: offline, mode: 'snapshot', dir });
  }

  get<T>(path: string, params?: Params): Promise<SourceResult<T>> {
    return this.cache.get<T>(path, params);
  }
}
