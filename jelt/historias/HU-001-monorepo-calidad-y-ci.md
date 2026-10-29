---
id: HU-001
title: Monorepo, calidad y CI
epic: EP-001
status: planned
priority: high
points: 3
jira: LDZ-2
updated: 2026-10-29
jira_hash: d7c035e6572b
---
# HU-001 — Monorepo, calidad y CI

**Como** desarrollador de ladiez, **quiero** un monorepo con web, API y tipos compartidos, y con calidad automatizada, **para** construir el resto de historias sobre una base consistente.

## Criterios de aceptación
### AC1 — Arranque local
- **Dado** el repo recién clonado y `npm install` ejecutado
- **Cuando** ejecuto `npm run dev`
- **Entonces** la web responde en `:5173`, la API en `:3000`, y `GET /api/health` desde la web (vía proxy) devuelve `200`
- Verify: `npm test -w apps/api -- health -t "HU-001 AC1"`

### AC2 — Tipos compartidos
- **Dado** un tipo de dominio definido en `packages/shared`
- **Cuando** lo importo desde `apps/web` y desde `apps/api`
- **Entonces** ambos compilan con `npm run typecheck` sin errores
- Verify: `npm run typecheck`

### AC3 — CI
- **Dado** un pull request a `main`
- **Cuando** se ejecuta el workflow de GitHub Actions
- **Entonces** corre lint, typecheck, test y build, y falla si alguno falla
- Verify: `npm run lint && npm run typecheck && npm test && npm run build`

## Notas técnicas
- npm workspaces: `apps/web` (React + Vite), `apps/api` (Fastify), `packages/shared`. TypeScript estricto, ESLint y Prettier.
- `.env.example` en `apps/api` con `API_FOOTBALL_KEY`, `CLOCK_MODE` y `SIM_ANCHOR`.

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
