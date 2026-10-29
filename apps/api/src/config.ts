import { z } from 'zod';
import { ClockMode } from '@enganche/shared';

const Env = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  API_FOOTBALL_KEY: z.string().optional(),
  CLOCK_MODE: ClockMode.default('simulated'),
  SIM_ANCHOR: z.iso.datetime().default('2024-10-24T19:30:00Z'),
  CACHE_MODE: z.enum(['snapshot', 'ttl']).default('snapshot'),
  CACHE_DIR: z.string().default('.cache'),
  /** Requests per minute and client IP (TRD §6). */
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  /** Only origin allowed by CORS (the web app). */
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

export type Config = {
  port: number;
  apiFootballKey?: string;
  clockMode: ClockMode;
  simAnchor: string;
  cacheMode: 'snapshot' | 'ttl';
  cacheDir: string;
  rateLimitMax: number;
  corsOrigin: string;
  version: string;
};

/** Parses and validates environment variables; throws with a readable message if invalid. */
export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  const parsed = Env.safeParse(env);
  if (!parsed.success) throw new Error(`Invalid environment:\n${z.prettifyError(parsed.error)}`);
  const e = parsed.data;
  return {
    port: e.PORT,
    apiFootballKey: e.API_FOOTBALL_KEY || undefined,
    clockMode: e.CLOCK_MODE,
    simAnchor: e.SIM_ANCHOR,
    cacheMode: e.CACHE_MODE,
    cacheDir: e.CACHE_DIR,
    rateLimitMax: e.RATE_LIMIT_MAX,
    corsOrigin: e.CORS_ORIGIN,
    version: process.env.npm_package_version ?? '0.1.0',
  };
}
