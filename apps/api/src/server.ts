import { buildApp } from './app';
import { loadConfig } from './config';

try {
  process.loadEnvFile();
} catch {
  // Sin .env: se usan las variables del entorno y los valores por defecto.
}

const config = loadConfig();
const app = buildApp(config, { logger: true });

app.listen({ port: config.port, host: '0.0.0.0' }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
