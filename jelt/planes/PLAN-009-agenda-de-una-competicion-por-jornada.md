---
id: PLAN-009
title: Agenda de una competición por jornada
story: HU-013
status: done
updated: 2026-10-29
---
# PLAN-009 — Plan para HU-013: Agenda de una competición por jornada

## Enfoque
**API:** `GET /api/competitions/:id/rounds` → `{ current, rounds: [{ name, leg?, matches: Match[] }] }`.
- Sale del calendario completo de la temporada (precargado; **sin cuota**), pasado por `MatchService`, así que las fechas están reproyectadas y los estados simulados.
- **Orden:** por el primer partido de cada ronda.
- **Jornada actual (AC1):** la primera ronda con algún partido no terminado (en vivo, descanso o programado). Se ignoran los aplazados y cancelados, que si no dejarían una jornada vieja "abierta" para siempre. Si todo terminó, es la última.
- **Ida y vuelta (AC3):** en las rondas eliminatorias (sin número), si cada cruce aparece exactamente dos veces, la ronda se divide en `leg: 1` (ida) y `leg: 2` (vuelta). La Final de partido único no se divide.
- Una sola respuesta con toda la temporada (unos 380 partidos como máximo). La web navega entre jornadas sin más peticiones.

**Web:** pestaña **Partidos** de `/competicion/:id`.
- Abre en `current`. Botones **Anterior** y **Siguiente**, desactivados en los extremos (AC2), y el nombre de la jornada como título en vivo (`aria-live="polite"`).
- **Nombres en español** (`roundLabel`), en el cliente para que i18n (HU-021) los traduzca después:

  | Proveedor | Se muestra |
  |---|---|
  | `Regular Season - 9` | Jornada 9 |
  | `League Stage - 4` | Fase de liga – Jornada 4 |
  | `Group Stage - 2` | Fase de grupos – Jornada 2 |
  | `Apertura - 5` / `Clausura - 8` | Apertura – Jornada 5 / Clausura – Jornada 8 |
  | `Clausura - Quadrangular - 3` | Clausura – Cuadrangulares – Jornada 3 |
  | `2nd Phase - 19` | Segunda fase – Jornada 19 |
  | `Round of 16` (+ ida/vuelta) | Octavos – Ida / Octavos – Vuelta |
  | `Quarter-finals`, `Semi-finals`, `Final`, `Clausura - Final` | Cuartos, Semifinales, Final, Clausura – Final |
  | `1st Qualifying Round`, `Play-offs`, `Knockout Round Play-offs`, `1st Round`… | 1.ª ronda previa, Playoffs, Playoffs de eliminatoria, 1.ª ronda… |
  | Desconocido | El nombre tal cual |
- **Lista de partidos agrupada por día:** hora local, equipos con escudo y marcador o estado (EN VIVO con minuto, Descanso, Final, Aplazado). Es una fila simple; la tarjeta completa llega con HU-011.

## Archivos
| Archivo | Cambio |
|---|---|
| `packages/shared/src/domain.ts` | `Round`, `RoundsSchedule` |
| `apps/api/src/services/round-service.ts` | Agrupar, ordenar, actual, ida/vuelta |
| `apps/api/src/routes/competitions.ts`, `app.ts` | Ruta `/rounds` |
| `apps/api/test/rounds.test.ts` | Orden, jornada actual (reloj simulado), ida/vuelta, 404 |
| `apps/web/src/rounds.ts` | `roundLabel` |
| `apps/web/src/components/RoundSchedule.tsx`, `MatchRow.tsx` | Agenda y fila de partido |
| `apps/web/src/pages/CompetitionPage.tsx`, `queries.ts` | Pestaña Partidos |
| `apps/web/test/rounds.test.tsx` | AC1, AC2, AC3 |

## Pasos (TDD)
1. API: test rojo con un calendario sintético (3 jornadas + octavos con ida y vuelta + final) y un reloj simulado. Implementar.
2. Web: test rojo de `roundLabel` y de la pestaña (abre en la actual, navega, extremos desactivados). Implementar.
3. Calidad completa, Playwright y prueba con datos reales (Europa League "hoy", Libertadores en semifinales).
