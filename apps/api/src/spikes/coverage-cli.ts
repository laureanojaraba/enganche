import fs from 'node:fs';
import path from 'node:path';
import { COMPETITIONS } from './competitions';
import { plannedCalls, renderReport, runCoverageSpike } from './coverage';

// Usage: npm run spike:coverage -w apps/api [-- --dry-run]
const REPORT = path.resolve(import.meta.dirname, '../../../../jelt/spikes/api-football-cobertura.md');

if (process.argv.includes('--dry-run')) {
  console.log('Llamadas planificadas (sin red, sin clave):');
  for (const call of plannedCalls(COMPETITIONS)) console.log(`  ${call}`);
  console.log(`\nInforme: ${path.relative(process.cwd(), REPORT)}`);
  process.exit(0);
}

try {
  process.loadEnvFile();
} catch {
  // Sin .env: se usa la variable del entorno.
}
const apiKey = process.env.API_FOOTBALL_KEY;
if (!apiKey) {
  console.error('Falta API_FOOTBALL_KEY en apps/api/.env');
  process.exit(1);
}

console.log('Ejecutando spike (≈4 min por el límite de peticiones por minuto)…');
const report = await runCoverageSpike(COMPETITIONS, { fetch, apiKey });
fs.mkdirSync(path.dirname(REPORT), { recursive: true });
fs.writeFileSync(REPORT, renderReport(report));
console.log(
  `Peticiones usadas: ${report.requestsUsed} · cuota: ${report.quotaAfter?.current}/${report.quotaAfter?.limit}`,
);
console.log(`Informe escrito en ${path.relative(process.cwd(), REPORT)}`);
