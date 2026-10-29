---
id: PLAN-008
title: Clasificación de una competición
story: HU-007
status: done
updated: 2026-10-29
---
# PLAN-008 — Plan para HU-007: Clasificación de una competición

## Enfoque
**API:** `GET /api/competitions/:id/standings` → `StandingGroup[]` = `{ name, rows: StandingRow[] }`.
- Sale de `/standings` (ya precargado para las 10 competiciones), así que **no gasta cuota**.
- `StandingRow`: posición, equipo (id, nombre, escudo), PJ, G, E, P, GF, GC, DG, Pts, racha (de la más antigua a la más reciente, como `W`/`D`/`L`) y la descripción del puesto (por ejemplo "Champions League").
- Los grupos respetan el orden y el nombre del proveedor: LaLiga tiene 1 tabla; Libertadores, 8 grupos (A–H); Champions, 1 tabla de 36. La Liga BetPlay trae Apertura y Clausura con sus cuadrangulares, cuyos nombres se repiten ("Group A"); se muestran tal cual y queda como mejora para después.
- **Limitación conocida:** con el reloj simulado, la tabla es la **final de la temporada 2024**. El proveedor no da clasificaciones históricas por fecha. Queda documentado.
- Competición fuera del catálogo → 404, igual que en los partidos.

**Web:** pestaña **Clasificación** de `/competicion/:id`.
- Una `<table>` por grupo con `<caption>` (el nombre del grupo) y cabeceras con `scope` y `abbr`/`title` para los lectores de pantalla (PJ = Partidos jugados…).
- **Racha:** 5 marcas de color **con letra** (G/E/P), así que no depende solo del color.
- **Favoritos (AC3):** se leen de `localStorage["enganche:favorites"]` con un módulo `favorites.ts` de **solo lectura** y formato versionado (TRD §3). Escribir favoritos llega con HU-009. La fila favorita se resalta con fondo y además con **★ y texto oculto "favorito"**.
- **Móvil (AC4):** la tabla vive en un contenedor con scroll horizontal propio. Las columnas posición y equipo son `sticky` a la izquierda, y el orden de columnas es Pos · Equipo · PJ · DG · Pts · G · E · P · GF · GC · Racha, para que a 390 px se vean Pos, Equipo, PJ, DG y Pts sin desplazar.

## Archivos
| Archivo | Cambio |
|---|---|
| `packages/shared/src/domain.ts` | `StandingRow`, `StandingGroup` |
| `apps/api/src/providers/api-football.mapper.ts` | `mapStanding` |
| `apps/api/src/providers/api-football.provider.ts` | `getStandings(league, season)` |
| `apps/api/src/routes/competitions.ts` | `GET /api/competitions/:id/standings` |
| `apps/api/test/standings.test.ts` | Mapeo (LaLiga real, grupos de Libertadores) y endpoint |
| `apps/web/src/favorites.ts` | Lectura versionada de favoritos (solo lectura) |
| `apps/web/src/components/StandingsTable.tsx` | Tabla accesible y responsive |
| `apps/web/src/pages/CompetitionPage.tsx`, `queries.ts` | Pestaña Clasificación |
| `apps/web/test/standings.test.tsx` | AC1, AC2, AC3 |
| `apps/web/e2e/standings.spec.ts` | AC4 (móvil 390 px) |

## Pasos (TDD)
1. API: test rojo del mapeo y del endpoint, con las fixtures reales de LaLiga y de los grupos A y B de Libertadores. Implementar.
2. Web: AC1 (columnas y valores), AC2 (una tabla por grupo con su nombre) y AC3 (fila favorita con ★). Implementar.
3. E2E AC4. Calidad completa.
