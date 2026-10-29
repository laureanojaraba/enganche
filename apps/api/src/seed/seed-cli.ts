import path from 'node:path';
import { CATALOG } from '../catalog/competitions';
import { loadConfig } from '../config';
import { CachedSource } from '../providers/cached-source';
import { HttpSource, QuotaCounter } from '../providers/http-source';
import { ProviderUnavailableError } from '../providers/source';
import { runSeed } from './seed';

// Usage: npm run seed -w apps/api   (re-run on following days to resume)
try {
  process.loadEnvFile();
} catch {
  // Sin .env: se usan las variables del entorno.
}
const config = loadConfig();
if (!config.apiFootballKey) {
  console.error('Falta API_FOOTBALL_KEY en apps/api/.env');
  process.exit(1);
}

const dir = path.resolve(config.cacheDir);
const quota = new QuotaCounter({ file: path.join(dir, 'quota.json') });
const http = new HttpSource({ apiKey: config.apiFootballKey, quota });
const cache = new CachedSource({
  upstream: http,
  mode: 'snapshot',
  dir,
  isQuotaLow: () => http.isQuotaLow(),
});

const budget = Math.min(Number(process.env.SEED_DAILY_BUDGET ?? 90), quota.remaining());
const windowDays = Number(process.env.SEED_WINDOW_DAYS ?? 1);
console.log(
  `Precarga en ${dir} · presupuesto ${budget} · ventana ${config.simAnchor} ± ${windowDays} día(s)`,
);

try {
  const r = await runSeed(cache, { catalog: CATALOG, anchor: config.simAnchor, windowDays, budget });
  console.log(`\nPeticiones hechas: ${r.requested} · cuota restante hoy: ${quota.remaining()}`);
  if (r.complete) console.log(`✔ Precarga completa (${r.detailsInWindow} fichas de partido en la ventana).`);
  else
    console.log(`⏸ Faltan al menos ${r.remaining} peticiones. Vuelve a ejecutar después de las 00:00 UTC.`);
} catch (err) {
  if (!(err instanceof ProviderUnavailableError)) throw err;
  console.log(
    `\n⏸ Cuota diaria casi agotada (${quota.remaining()} restantes). Vuelve a ejecutar después de las 00:00 UTC.`,
  );
}
