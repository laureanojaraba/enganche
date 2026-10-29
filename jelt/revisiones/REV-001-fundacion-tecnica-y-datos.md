---
id: REV-001
title: Fundación técnica y datos
epic: EP-001
status: open
verdict: changes-needed
updated: 2026-10-29
---
# REV-001 — Revisión: Fundación técnica y datos

## Alcance revisado
- **Épica:** EP-001, historias HU-001 a HU-005. Commits `9d8646a`, `d8f816a`, `decef8c`, `8355b23` y `59dd371` en `develop`. También el cableado de `app.ts` y `providers/index.ts` que introdujo HU-006.
- **Revisor:** un subagente independiente que no participó en la implementación. Trabajó en solo lectura y sin llamadas a API-Football. Ejecutó `npm test` (67 tests), `lint` y `typecheck`, todo en verde.
- **Verificación del autor:** reproduje los hallazgos #1 a #3 contra el código. La colisión de claves de caché está confirmada con dos casos. El #4 no se puede verificar porque no hay ninguna ficha guardada con tanda de penaltis.

## Hallazgos
| # | Severidad | Archivo:línea | Descripción | Acción |
|---|---|---|---|---|
| 1 | alta | `providers/cache-key.ts:9-12` | La clave de caché no es inyectiva. El saneado (`[^a-zA-Z0-9._-]` → `-`) y el separador `k-v_k-v` hacen colisionar peticiones distintas, por ejemplo `round="Regular Season - 12"` y `round="Regular?Season - 12"`. Como `round` viene del cliente (HU-006), se puede **envenenar** una entrada legítima de la caché `snapshot`, que no caduca. Confirmado. | BUG-001 |
| 2 | alta | `providers/index.ts`, `cached-source.ts`, `routes/competitions.ts:11` | **La cuota se puede agotar desde fuera.** Con la clave configurada, cada fallo de caché va a la red. `round`, `from` y `to` generan claves sin límite. No hay rate limit, helmet ni CORS, que el TRD §6 exige. La caché en memoria, el directorio `.cache/` y la cola de `HttpSource` crecen sin tope. | BUG-002 |
| 3 | media | `services/match-service.ts:14` | En modo simulado, `from` y `to` llegan al proveedor en fechas de pantalla (2026) sin pasarlas a fechas de datos (2024). Las consultas "de hoy" piden 2026: el plan Free lo bloquea y se gasta cuota. Confirmado. | BUG-003 |
| 4 | media | `clock/simulate.ts`, `api-football.mapper.ts:35` | **Prórroga y penaltis.** La tanda de penaltis (`comments: "Penalty Shootout"`) se suma al marcador: un 1-1 podría verse como 5-4. La prórroga se marca como `finished` a los 50 minutos de la segunda parte. Sin verificar con datos reales de una tanda. | BUG-004 |
| 5 | media | `seed/seed-cli.ts:43-46`, `cached-source.ts` | Cualquier error del proveedor se presenta como "cuota casi agotada". Además, una petición que falla siempre bloquea la precarga para siempre, porque el plan es determinista y la reintenta primero cada día. | BUG-005 |
| 6 | media | `services/match-service.ts:23` | En el listado simulado, cada partido en vivo dispara un `getMatch` que puede ir a la red. Con `CACHE_MODE=ttl` y el reloj simulado, se vuelven a pedir datos de 2024 que no cambian. | BUG-002 (forzar `snapshot` en modo simulado) |
| 7 | baja | `seed/seed-cli.ts:31-32` | Si `SEED_DAILY_BUDGET` o `SEED_WINDOW_DAYS` no son números, quedan como NaN: el presupuesto se desactiva o no se descarga ninguna ficha. | BUG-005 (validar con Zod) |
| 8 | baja | `app.ts` | No hay manejador de errores: `ProviderUnavailableError` sale como 500 con el mensaje interno. | BUG-002 (503 con un código genérico) |
| 9 | baja | `http-source.ts` (QuotaCounter) | Hay una carrera en el contador si la API y la precarga corren a la vez, y las escrituras no son atómicas. | Deuda técnica |
| 10 | baja | `routes/health.ts` | `/api/health` no incluye la cuota restante (TRD §5) y no hay log al pasar a servir solo desde caché (TRD §4). | Deuda técnica |
| 11 | baja | `clock/simulate.ts:20,45` | Los márgenes de 48 y 50 minutos son fijos. El listado (`kickoffUtc`) y la ficha (`periods.first`) pueden diferir 1 o 2 minutos. | Deuda técnica |

## Cobertura de AC
| Historia | AC cumplidos | Parciales y notas |
|---|---|---|
| HU-001 | AC2, AC3 | AC1: el proxy de Vite y los puertos solo se comprobaron a mano |
| HU-002 | AC2, AC3 | AC1: la generación del archivo con las 10 competiciones se ejecutó de verdad, pero no tiene test |
| HU-003 | AC1–AC4 | AC4: no se verifica `meta.stale` en la respuesta HTTP |
| HU-004 | AC2, AC3 | AC1: la lógica está probada; la lectura de `SEED_DAILY_BUDGET` en la CLI no (ver #7) |
| HU-005 | AC1–AC4 | AC2: falta el caso con prórroga (ver #4) |

## Veredicto
**changes-needed.** Antes de construir EP-002 y las siguientes sobre esta capa hay que corregir los hallazgos de seguridad y consumo de cuota (#1 y #2) y la conversión de fechas (#3). Los de severidad media se pueden corregir después, pero antes de la demo en `staging`.
