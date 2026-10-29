---
id: PLAN-005
title: Reloj simulado y partidos en vivo simulados
story: HU-005
status: done
updated: 2026-10-29
---
# PLAN-005 — Plan para HU-005: Reloj simulado y partidos en vivo simulados

## Decisión previa: nueva fecha simulada (opción 2 aprobada por el usuario)
La analicé sobre los calendarios precargados (3.190 partidos), sin gastar cuota. Nuevo valor por defecto:
**`SIM_ANCHOR=2024-10-24T19:30:00Z`** (jueves) y **`SEED_WINDOW_DAYS=2`**.

| Ventana 22–26 oct 2024 | Contenido |
|---|---|
| Mar 22 / Mié 23 | Champions (fase de liga, jornada 3), semifinal de Libertadores |
| **Jue 24 ("hoy")** | Europa League jornada 3: **9 partidos en vivo a las 19:30 UTC** (Fenerbahçe–Man United, Tottenham–AZ, Lazio en Twente…), semifinal de Sudamericana, Liga BetPlay |
| Vie 25 / Sáb 26 | Jornadas de las 6 ligas |

- Cubre **10 de 10 competiciones** con unas 72 fichas, que caben en un día de cuota.
- Antes (9 de noviembre) solo cubría las 6 ligas.
- Las 30 fichas ya guardadas del 9 de noviembre se conservan, pero dejan de ser la prioridad.

## Enfoque
- **`Clock`** (`apps/api/src/clock/clock.ts`) con dos implementaciones:
  - `RealClock`: `dataNow()` = ahora real y `project(t)` = `t`.
  - `SimulatedClock(anchor, startedAt)`:
    - `dataNow()` = `anchor + (ahora real − startedAt)`: el "ahora" de la temporada 2024, que avanza en tiempo real.
    - `project(t)` = `t + (startedAt − anchor)`: convierte una fecha de 2024 en una fecha actual (AC1).
- **Línea temporal del partido** a partir de `fixture.periods` (inicio de cada parte) que da API-Football. Si falta, se asume segunda parte = inicio + 60 min.

  | Tiempo de datos | Estado | Minuto |
  |---|---|---|
  | < inicio | `scheduled` (marcador `null`) | — |
  | 1.ª parte | `live` | 1–45 (el descuento se muestra como 45) |
  | Descanso | `halftime` | — |
  | 2.ª parte | `live` | 46–90 |
  | > fin estimado de la 2.ª parte (+50 min) | `finished` | — |

  Partidos aplazados o cancelados conservan su estado real.
- **Eventos hasta el "ahora" (AC3).** Cada evento se sitúa en la línea temporal: los del primer tiempo (`elapsed ≤ 45`, más el descuento) cuentan desde el inicio y los del segundo desde el comienzo de la 2.ª parte. Solo se muestran los ocurridos y **el marcador se recalcula** con los goles visibles:
  - Los goles (normal, penalti, autogol) suman al `team` del evento. Lo comprobé con datos reales: en los autogoles `team` es el equipo beneficiado.
  - No suman los penaltis fallados ni los goles anulados por el VAR.
- **`MatchEvent`** en el dominio compartido y su mapper. También `ApiFootballProvider.getMatch(id)` → `{ match, events }`, que usará la ficha (HU-015).
- **`MatchService`** aplica el reloj a lo que devuelve el proveedor: `listFixtures` y `getMatch`, reproyectados y con estado derivado. En modo `real` no toca nada (AC4).

## Archivos a crear / modificar
| Archivo | Cambio |
|---|---|
| `packages/shared/src/domain.ts` | `MatchEvent`, `MatchDetail` |
| `apps/api/src/clock/clock.ts` | `Clock`, `RealClock`, `SimulatedClock`, `createClock(config)` |
| `apps/api/src/clock/simulate.ts` | `matchTimeline`, `simulateMatch`, `simulateEvents` (funciones puras) |
| `apps/api/src/providers/api-football.mapper.ts` | `ApiFixture.periods`, `ApiEvent`, `mapEvent` |
| `apps/api/src/providers/api-football.provider.ts` | `getMatch(id)` |
| `apps/api/src/services/match-service.ts` | Aplica el reloj a partidos y fichas |
| `apps/api/src/config.ts`, `.env.example`, `README.md`, `jelt/trd.md` §4 | Nuevo `SIM_ANCHOR` por defecto |
| `apps/api/src/seed/seed-cli.ts`, `.env.example` | `SEED_WINDOW_DAYS` por defecto = 2 |
| `apps/api/test/fixtures/api-football/fixture-1223705-atalanta-udinese.json` | Ficha real (sin estadísticas de jugadores): gol en 45+3, gol en 56 y autogol en 60 |
| `apps/api/test/clock.test.ts` | AC1–AC4 |

## Pasos (TDD)
1. **AC1 rojo:** con el ancla `2024-11-09T18:00Z` y el servidor arrancado a una hora real dada, un partido de 2024-11-09 a las 20:00 se proyecta a esa hora real + 2 h.
2. **AC2 rojo:** con la ficha de Atalanta–Udinese, antes del inicio → `scheduled`; en el minuto 30 → `live` con minuto 30; en el descanso → `halftime`; en el minuto 70 → `live`, minuto 70; después → `finished`.
3. **AC3 rojo:** en el minuto 55 solo se ve el gol de Kamara (45+3) y el marcador es 0-1. En el minuto 61 se ven los tres goles y el marcador es 2-1.
4. **AC4 rojo:** con `RealClock`, el partido y los eventos salen tal cual del proveedor.
5. Implementar el dominio y el mapper de eventos, `Clock`, `simulate` y `MatchService`.
6. Nuevo ancla y ventana por defecto. Documentación (README, TRD §4).
7. Mañana (con cuota): `npm run seed -w apps/api` para guardar las unas 72 fichas de la nueva ventana.

## Riesgos
- La duración del descuento es una estimación (+50 min desde el inicio de la 2.ª parte). Basta para la demo.
- Sin fichas guardadas, un partido simulado en vivo se ve sin eventos. La interfaz ya debe ocultar las secciones vacías (R3).
