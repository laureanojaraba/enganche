# enganche

Tus equipos y competiciones de fútbol en un solo lugar: partidos en vivo, estadísticas, clasificaciones y dónde ver cada partido desde Colombia y LATAM.

> Proyecto desarrollado con el proceso [jelt-sl](jelt/): requisitos en `jelt/` (PRD, TRD, épicas, historias) y revisión del BA en Jira.

## Requisitos

- Node.js 24 (`.nvmrc`)
- npm 11

## Puesta en marcha

```bash
npm install
cp apps/api/.env.example apps/api/.env   # y completa API_FOOTBALL_KEY si la tienes
npm run dev                               # web en http://localhost:5173 · API en http://localhost:3000
```

## Datos de desarrollo

El plan gratuito de API-Football permite unas 100 peticiones al día. `npm run seed -w apps/api` descarga en `apps/api/.cache/` las competiciones, equipos, calendarios y clasificaciones de la temporada 2024, y después las fichas de los partidos alrededor de `SIM_ANCHOR`. Si se queda sin cuota, vuelve a ejecutarlo al día siguiente: continúa donde lo dejó.

## Estructura

| Ruta              | Contenido                                    |
| ----------------- | -------------------------------------------- |
| `apps/web`        | React + Vite (PWA)                           |
| `apps/api`        | Fastify: agrega y cachea datos del proveedor |
| `packages/shared` | Tipos y esquemas Zod compartidos             |
| `jelt/`           | Documentación de producto y proceso          |

## Scripts

| Comando                                 | Qué hace                     |
| --------------------------------------- | ---------------------------- |
| `npm run dev`                           | Web y API en modo desarrollo |
| `npm test`                              | Tests de todos los paquetes  |
| `npm run lint` · `npm run format:check` | Calidad de código            |
| `npm run typecheck`                     | Comprobación de tipos        |
| `npm run build`                         | Build de producción          |

## Variables de entorno (`apps/api/.env`)

| Variable            | Por defecto            | Descripción                                                                                                                   |
| ------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `PORT`              | `3000`                 | Puerto de la API                                                                                                              |
| `API_FOOTBALL_KEY`  | —                      | Clave de [API-Football](https://dashboard.api-football.com)                                                                   |
| `CLOCK_MODE`        | `simulated`            | `simulated` proyecta la temporada de desarrollo a fechas actuales; `real` usa los datos tal cual                              |
| `SIM_ANCHOR`        | `2024-10-24T19:30:00Z` | Fecha de la temporada que se trata como "ahora" en modo simulado                                                              |
| `CACHE_MODE`        | `snapshot`             | `snapshot` guarda la primera respuesta y la reutiliza siempre (desarrollo); `ttl` refresca según el tipo de dato (producción) |
| `CACHE_DIR`         | `.cache`               | Carpeta de snapshots y del contador diario de peticiones (no se versiona)                                                     |
| `SEED_DAILY_BUDGET` | `90`                   | Peticiones máximas por ejecución de `npm run seed`                                                                            |
| `SEED_WINDOW_DAYS`  | `2`                    | Días alrededor de `SIM_ANCHOR` con fichas completas de partido                                                                |

## Ramas y ambientes

| Rama            | Ambiente                                             |
| --------------- | ---------------------------------------------------- |
| `feat/HU-xxx-*` | Local: una rama por historia, creada desde `develop` |
| `develop`       | Desarrollo: integración de historias                 |
| `staging`       | Pruebas con el BA y usuarios externos                |
| `main`          | Producción                                           |

Flujo: `feat/*` → PR a `develop` → PR a `staging` → PR a `main`. El CI se ejecuta en cada PR y push a las tres ramas.
