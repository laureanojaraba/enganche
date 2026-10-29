---
id: PLAN-004
title: Precarga de datos con presupuesto de cuota
story: HU-004
status: draft
updated: 2026-10-29
---
# PLAN-004 — Plan para HU-004: Precarga de datos con presupuesto de cuota

## Hechos que condicionan el diseño
- Plan Free: 100 peticiones al día y unas 10 por minuto (HU-002).
- **El parámetro `ids` (hasta 20 partidos por petición) no está disponible en Free.** Lo comprobé el 2026-10-29: *"Free plans do not have access to the Ids parameter"*. Cada ficha completa cuesta 1 petición (`/fixtures?id=N`), que trae eventos, alineaciones, estadísticas y jugadores.
- La cabecera `x-ratelimit-requests-remaining` de cada respuesta da la cuota real al instante. Se usa para sincronizar el `QuotaCounter`, que antes solo contaba lo que pasaba por nuestra API.

## Enfoque
`npm run seed -w apps/api` recorre un **plan de peticiones ordenado** sobre el `CachedSource` en modo `snapshot` de HU-003. Lo que ya está en `.cache/` no se vuelve a pedir, así que **reanudar es simplemente volver a ejecutar** (AC2).

**Fase 1, base** (4 × 10 = 40 peticiones) para cada una de las 10 competiciones, temporada 2024:
1. `/leagues?id=X`
2. `/teams?league=X&season=2024`
3. `/fixtures?league=X&season=2024`: el calendario completo de la temporada en una sola petición
4. `/standings?league=X&season=2024`

**Fase 2, fichas** (1 petición por partido): `/fixtures?id=N` para los partidos que caen en `SIM_ANCHOR ± SEED_WINDOW_DAYS` (1 día por defecto). La lista sale de los calendarios de la fase 1. Estimación: unos 60 partidos el fin de semana del 9 y 10 de noviembre de 2024.

**Presupuesto (AC1):** `SEED_DAILY_BUDGET` (90 por defecto), limitado además por la cuota real restante. Al llegar al límite, el script se detiene y muestra cuántas peticiones del plan faltan y cuándo puede reanudarse (a las 00:00 UTC).

**Total estimado:** unas 100 peticiones, es decir, dos ejecuciones en dos días.

## Archivos a crear / modificar
| Archivo | Cambio |
|---|---|
| `apps/api/src/catalog/competitions.ts` | Catálogo canónico: id, nombre comercial, sección y temporada de desarrollo (TRD §3). El spike lo reutiliza |
| `apps/api/src/spikes/competitions.ts` | Pasa a reexportar el catálogo (sin duplicar datos) |
| `apps/api/src/providers/cached-source.ts` | `has(path, params)`: comprueba la caché sin usar la red |
| `apps/api/src/providers/http-source.ts` | Lee `x-ratelimit-requests-remaining` y sincroniza `QuotaCounter.syncRemaining()` |
| `apps/api/src/seed/seed.ts` | `buildBasePlan`, `fixturesInWindow`, `runSeed` (fuente, presupuesto y logger inyectables) |
| `apps/api/src/seed/seed-cli.ts` | Entrada CLI: `.env`, `SEED_DAILY_BUDGET`, `SEED_WINDOW_DAYS`, resumen final |
| `apps/api/package.json` | Script `seed` |
| `apps/api/test/seed.test.ts` | AC1, AC2, AC3 con fuente falsa en un directorio temporal |
| `README.md`, `.env.example` | Variables nuevas y cómo precargar |

## Pasos (TDD)
1. **AC3 rojo:** el orden de peticiones es leagues → teams → fixtures → standings para las 10 competiciones, y después solo las fichas de los partidos dentro de la ventana.
2. **AC1 rojo:** con un presupuesto de 5, se hacen exactamente 5 peticiones de red y el resultado indica `remaining > 0` y `complete: false`.
3. **AC2 rojo:** una primera ejecución con presupuesto de 5 y una segunda con 200 suman tantas peticiones como el plan completo, sin repetir ninguna clave.
4. Implementar `has`, el catálogo y `seed.ts`.
5. **Sincronización de cuota:** test de `HttpSource` con la cabecera de cuota. Implementar.
6. CLI y ejecución real del día 1 (unas 78 peticiones disponibles hoy). El día 2 la completa.

## Riesgos
- Si la ventana del 9 de noviembre de 2024 tiene pocos partidos en alguna competición (por ejemplo, las copas), la demo de "hoy" mostrará menos partidos. HU-005 (reloj) puede mover `SIM_ANCHOR` a otra fecha; las fichas extra se precargan con otra ejecución.
