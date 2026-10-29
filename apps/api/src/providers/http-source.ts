import fs from 'node:fs';
import path from 'node:path';
import { ProviderError, type Params, type Source, type SourceResult } from './source';

const DEFAULT_BASE = 'https://v3.football.api-sports.io';

/**
 * Own daily request counter (API-Football resets at 00:00 UTC). The provider's /status
 * counter lags behind (HU-002 finding), so the quota guard relies on this one.
 */
export class QuotaCounter {
  private readonly file: string;
  private readonly limit: number;
  private readonly now: () => number;

  constructor(opts: { file: string; limit?: number; now?: () => number }) {
    this.file = opts.file;
    this.limit = opts.limit ?? 100;
    this.now = opts.now ?? Date.now;
  }

  private today() {
    return new Date(this.now()).toISOString().slice(0, 10);
  }

  private read(): { day: string; used: number } {
    try {
      const data = JSON.parse(fs.readFileSync(this.file, 'utf8')) as { day: string; used: number };
      return data.day === this.today() ? data : { day: this.today(), used: 0 };
    } catch {
      return { day: this.today(), used: 0 };
    }
  }

  remaining() {
    return Math.max(0, this.limit - this.read().used);
  }

  /** True when less than `threshold` of the daily quota is left (TRD: 10 %). */
  isLow(threshold = 0.1) {
    return this.remaining() < this.limit * threshold;
  }

  increment() {
    this.write(this.read().used + 1);
  }

  /** Aligns with the provider's own count (response header); only ever raises the local count. */
  syncRemaining(remaining: number) {
    const used = this.limit - remaining;
    if (used > this.read().used) this.write(used);
  }

  private write(used: number) {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify({ day: this.today(), used }));
  }
}

export type HttpSourceOptions = {
  apiKey: string;
  quota: QuotaCounter;
  baseUrl?: string;
  fetch?: typeof fetch;
  /** Minimum gap between requests; the free plan allows ~10 per minute. */
  minIntervalMs?: number;
};

/** Direct HTTP access to API-Football v3. */
export class HttpSource implements Source {
  private readonly opts: Required<Omit<HttpSourceOptions, 'fetch'>> & { fetch: typeof fetch };
  private queue: Promise<unknown> = Promise.resolve();
  private lastAt = 0;

  constructor(opts: HttpSourceOptions) {
    this.opts = {
      baseUrl: DEFAULT_BASE,
      minIntervalMs: 6500,
      fetch: globalThis.fetch,
      ...opts,
    };
  }

  isQuotaLow() {
    return this.opts.quota.isLow();
  }

  get<T>(path: string, params: Params = {}): Promise<SourceResult<T>> {
    // Serialize requests so the per-minute spacing holds under concurrency.
    const run = this.queue.then(() => this.request<T>(path, params));
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async request<T>(path: string, params: Params): Promise<SourceResult<T>> {
    const wait = this.lastAt + this.opts.minIntervalMs - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastAt = Date.now();

    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v !== undefined) query.set(k, String(v));
    const url = `${this.opts.baseUrl}${path}${query.size ? `?${query}` : ''}`;

    this.opts.quota.increment();
    const res = await this.opts.fetch(url, { headers: { 'x-apisports-key': this.opts.apiKey } });
    const remaining = Number(res.headers.get('x-ratelimit-requests-remaining'));
    if (res.headers.has('x-ratelimit-requests-remaining') && Number.isFinite(remaining)) {
      this.opts.quota.syncRemaining(remaining);
    }
    if (!res.ok) throw new ProviderError(`API-Football ${res.status} on ${path}`);
    const body = (await res.json()) as T & { errors?: unknown };
    const errors = body.errors;
    if (errors && typeof errors === 'object' && !Array.isArray(errors) && Object.keys(errors).length) {
      throw new ProviderError(
        Object.entries(errors as Record<string, string>)
          .map(([k, v]) => `${k}: ${v}`)
          .join('; '),
      );
    }
    return { body, meta: { updatedAt: new Date().toISOString(), stale: false, source: 'live' } };
  }
}
