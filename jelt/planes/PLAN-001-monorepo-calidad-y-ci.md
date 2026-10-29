---
id: PLAN-001
title: Monorepo, calidad y CI
story: HU-001
status: draft
updated: 2026-10-29
---
# PLAN-001 — Plan para HU-001: Monorepo, calidad y CI

## Enfoque
Crear un monorepo con **npm workspaces** y sin herramientas extra (ni Turborepo ni Nx). Hay tres paquetes:

- **`packages/shared`:** contiene los tipos y esquemas Zod. Se consume **desde el código fuente TypeScript**, sin compilarlo aparte:
  - Vite y Vitest lo transpilan solos.
  - La API usa `tsx` en desarrollo y `tsup` para el build, que incluye `shared` en el bundle.

  Esto evita un paso de build intermedio y mantiene un feedback inmediato.
- **`apps/api`:** Fastify con una factoría `buildApp()` para poder probar con `inject` sin abrir puertos. Las variables de entorno se cargan con `process.loadEnvFile()` de Node 24, sin dotenv, y se validan con Zod.
- **`apps/web`:** React + Vite, con un proxy de `/api` a `:3000`. En esta historia solo muestra el estado de la API; las pantallas reales llegan con las demás historias.

Calidad: ESLint (flat config + typescript-eslint) y Prettier en la raíz, `tsc --noEmit` por workspace y GitHub Actions.

## Archivos a crear / modificar
| Archivo | Cambio |
|---|---|
| `package.json` | Raíz: `workspaces`, scripts `dev`, `build`, `test`, `lint`, `typecheck`, `format` |
| `tsconfig.base.json` | TS estricto compartido (`strict`, `noUncheckedIndexedAccess`, `moduleResolution: bundler`) |
| `eslint.config.js`, `.prettierrc`, `.editorconfig`, `.nvmrc` (24) | Calidad y versión de Node |
| `.gitignore` | `node_modules`, `dist`, `coverage`, `.env`, `apps/api/.cache` |
| `packages/shared/package.json`, `src/index.ts`, `src/api.ts` | Esquemas `ApiMeta`, `ApiResponse<T>` y `HealthStatus` (Zod + tipos inferidos) |
| `packages/shared/test/api.test.ts` | Test del esquema compartido |
| `apps/api/package.json`, `tsconfig.json`, `tsup.config.ts` | Fastify, tsx, tsup, vitest |
| `apps/api/src/config.ts` | Lectura y validación del entorno: `PORT`, `API_FOOTBALL_KEY` (opcional en esta historia), `CLOCK_MODE`, `SIM_ANCHOR` |
| `apps/api/src/app.ts` | `buildApp(config)`: registra las rutas |
| `apps/api/src/routes/health.ts` | `GET /api/health` → `{ data: { status, clockMode, version }, meta }` |
| `apps/api/src/server.ts` | Arranque y escucha |
| `apps/api/test/health.test.ts` | `HU-001 AC1` con `app.inject` |
| `apps/api/.env.example` | Variables documentadas sin valores secretos |
| `apps/web/` (Vite React TS) | `vite.config.ts` con proxy, `src/App.tsx` que consulta `/api/health` |
| `apps/web/test/App.test.tsx` | Muestra el estado de la API (con MSW) |
| `.github/workflows/ci.yml` | Node 24: `npm ci` → lint → typecheck → test → build |
| `README.md` | Requisitos, instalación, `npm run dev`, variables de entorno |

## Pasos (TDD)
1. **Andamiaje:** crear la raíz del monorepo, las configuraciones y los tres workspaces vacíos. Comprobar que `npm install` funciona.
2. **AC2, tipos compartidos:**
   - Test rojo en `shared`: `HealthStatus` valida un objeto correcto y rechaza uno inválido.
   - Implementar los esquemas.
   - Importar `HealthStatus` desde la API y desde la web.
   - `npm run typecheck` en verde.
3. **AC1, API:**
   - Test rojo `HU-001 AC1`: `GET /api/health` devuelve `200` con un cuerpo que valida contra `HealthStatus`.
   - Implementar `config`, `buildApp` y la ruta.
4. **AC1, web:**
   - Test rojo: `App` muestra "API: ok" cuando `/api/health` responde (MSW).
   - Implementar `App` y el proxy de Vite.
   - Comprobación manual: `npm run dev` y `curl http://localhost:5173/api/health` devuelve `200`.
5. **AC3, calidad y CI:**
   - Configurar ESLint y Prettier.
   - Crear el workflow de CI.
   - Ejecutar localmente `npm run lint && npm run typecheck && npm test && npm run build`, todo en verde.
6. **Documentación:** README con instrucciones y la tabla de variables de entorno.

## Dependencias principales
- **Raíz:** `typescript`, `eslint`, `typescript-eslint`, `eslint-plugin-react-hooks`, `prettier`, `concurrently`
- **shared:** `zod`
- **api:** `fastify`, `zod`; dev: `tsx`, `tsup`, `vitest`
- **web:** `react`, `react-dom`; dev: `vite`, `@vitejs/plugin-react`, `vitest`, `jsdom`, `@testing-library/react`, `msw`

Se instalarán las versiones estables actuales en el momento del andamiaje y quedarán fijadas en `package-lock.json`.

## Fuera de esta historia
Tailwind, React Router, i18n y PWA llegan con sus historias (HU-021 a HU-024 y las pantallas). La caché, el adaptador de datos y el reloj llegan con HU-003 y HU-005.

## Riesgos y dudas
- **Windows:** los scripts deben funcionar en PowerShell y en bash. Por eso se usa `concurrently` en lugar de `&` y no se hace nada específico de un shell.
- **CI en GitHub:** el repo aún no tiene remoto. El workflow queda listo y se validará cuando se suba a GitHub. En local se valida con los mismos comandos.
