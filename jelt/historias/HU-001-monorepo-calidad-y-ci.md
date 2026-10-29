---
id: HU-001
title: Monorepo, calidad y CI
epic: EP-001
status: done
priority: high
points: 3
jira: LDZ-2
updated: 2026-10-29
jira_hash: 1eec7973038e
---
# HU-001 — Monorepo, calidad y CI

**Como** desarrollador de enganche, **quiero** un monorepo con web, API y tipos compartidos, y con calidad automatizada, **para** construir el resto de historias sobre una base consistente.

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
- [x] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (pendiente: i18n llega en HU-021)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
| 2026-10-29 | Implementada y verificada: AC1, AC2 y AC3 OK | PLAN-001 |
