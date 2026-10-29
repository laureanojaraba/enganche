import { z } from 'zod';
import { ClockMode } from '@ladiez/shared';

const Env = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  API_FOOTBALL_KEY: z.string().optional(),
  CLOCK_MODE: ClockMode.default('simulated'),
  SIM_ANCHOR: z.iso.datetime().default('2024-11-09T18:00:00Z'),
});

export type Config = {
  port: number;
  apiFootballKey?: string;
  clockMode: ClockMode;
  simAnchor: string;
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
    version: process.env.npm_package_version ?? '0.1.0',
  };
}
