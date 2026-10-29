---
id: PLAN-003
title: Adaptador API-Football con caché y snapshots
story: HU-003
status: done
updated: 2026-10-29
---
# PLAN-003 — Plan para HU-003: Adaptador API-Football con caché y snapshots

## Enfoque
La API se organiza en tres capas, cada una con una sola responsabilidad y probable por separado:

```
ApiFootballProvider  ── mapea respuestas → tipos de dominio (Match, …)
        │ usa
CachedSource         ── decide: snapshot / caché TTL / red / dato viejo (stale)
        │ usa
HttpSource           ── HTTP con la clave, espaciado (~10/min) y contador diario propio
```

- **`Source`** es una interfaz mínima: `get(path, params) → { body, meta }`, donde `meta` es el `ApiMeta` compartido (`updatedAt`, `stale`, `source`). Hay tres implementaciones:
  - **`HttpSource`:** llama a `v3.football.api-sports.io`, espera entre llamadas (`minIntervalMs`, 6,5 s por defecto) y cuenta las peticiones del día en `.cache/quota.json`. No depende de `/status`, que llega con retraso (hallazgo de HU-002).
  - **`SnapshotSource`:** solo lee archivos de un directorio y nunca usa la red. Sirve para los tests (fixtures versionadas) y para la demo offline.
  - **`CachedSource`:** envuelve a `HttpSource` con dos modos (`CACHE_MODE`):
    - `snapshot` (desarrollo, por defecto): la primera respuesta se guarda en `apps/api/.cache/<clave>.json` y se reutiliza siempre, porque los datos de 2024 no cambian (AC2).
    - `ttl` (producción): caché en memoria y disco con TTL según el tipo de dato (AC3):

      | Ruta | TTL |
      |---|---|
      | `/fixtures` con `live` | 15 s |
      | `/fixtures` | 5 min |
      | `/standings` | 1 h |
      | `/teams`, `/leagues` | 24 h |

    - **Dato viejo (AC4):** si la red falla o la cuota restante es menor del 10 %, se sirve lo cacheado con `meta.stale: true`. Si no hay nada cacheado, se lanza `ProviderUnavailableError`.
- **`ApiFootballProvider`:** expone métodos de dominio. En esta historia: `listFixtures({ league, season, from?, to?, round? })` → `Match[]`. El mapeo es una función pura (`mapFixture`) en `api-football.mapper.ts` (AC1).
- **Tipos de dominio** (`packages/shared/src/domain.ts`): `TeamRef`, `MatchStatus` y `Match`, con los esquemas Zod del TRD §3. Los estados del proveedor se normalizan:

  | API-Football | Dominio |
  |---|---|
  | `TBD`, `NS` | `scheduled` |
  | `1H`, `2H`, `ET`, `BT`, `P`, `LIVE`, `INT` | `live` |
  | `HT` | `halftime` |
  | `FT`, `AET`, `PEN` | `finished` |
  | `PST`, `SUSP` | `postponed` |
  | `CANC`, `ABD`, `AWD`, `WO` | `cancelled` |

- **Reloj inyectable** (`now()`) en la caché, para probar TTL sin esperar. El reloj simulado completo llega con HU-005.

## Archivos a crear / modificar
| Archivo | Cambio |
|---|---|
| `packages/shared/src/domain.ts` (+ `index.ts`) | `TeamRef`, `MatchStatus`, `Score`, `Match` |
| `apps/api/src/providers/source.ts` | Interfaz `Source`, `SourceResult`, errores |
| `apps/api/src/providers/http-source.ts` | `HttpSource` + `QuotaCounter` (contador diario en disco) |
| `apps/api/src/providers/snapshot-source.ts` | `SnapshotSource` |
| `apps/api/src/providers/cached-source.ts` | `CachedSource` (modos `snapshot`/`ttl`, TTL por ruta, dato viejo) |
| `apps/api/src/providers/cache-key.ts` | Clave de caché estable: ruta + parámetros ordenados → nombre de archivo seguro |
| `apps/api/src/providers/api-football.mapper.ts` | `mapFixture`, `mapStatus` |
| `apps/api/src/providers/api-football.provider.ts` | `ApiFootballProvider.listFixtures` |
| `apps/api/src/config.ts`, `.env.example` | `CACHE_MODE` (`snapshot`/`ttl`) |
| `apps/api/test/fixtures/api-football/fixtures-league-239-2024-11.json` | Respuesta real recortada (3 partidos, Liga BetPlay 2024) |
| `apps/api/test/api-football.mapper.test.ts` | AC1 |
| `apps/api/test/cache.test.ts` | AC2, AC3, AC4 (directorio temporal, red falsa, reloj falso) |

## Pasos (TDD)
1. **AC1 rojo:** con la fixture real, `mapFixture` produce un `Match` válido según el esquema (ids, nombres, logos, `kickoffUtc` en ISO UTC, `round`, marcador 1-2, estado `finished`). Tabla de estados → `mapStatus`. Implementar el dominio y el mapper.
2. **AC2 rojo:** con `CachedSource` en modo `snapshot` y un directorio temporal, la segunda petición igual no llama a la red y devuelve `meta.source = 'snapshot'`. Implementar `cache-key`, `CachedSource` y `SnapshotSource`.
3. **AC3 rojo:** en modo `ttl`, `/standings` pedido a los 59 min viene de la caché; a los 61 min se vuelve a pedir. Implementar el TTL por ruta.
4. **AC4 rojo:** (a) la red falla con dato cacheado → `stale: true`; (b) el contador dice 95/100 → no se llama a la red y se sirve el dato con `stale: true`; (c) sin caché y sin red → `ProviderUnavailableError`. Implementar `QuotaCounter` y la lógica de respaldo.
5. **Integración:** `ApiFootballProvider.listFixtures` sobre `SnapshotSource` con la fixture → 3 `Match`.
6. Calidad: lint, formato, typecheck, tests y build.

## Riesgos y dudas
- **Concurrencia:** dos peticiones iguales a la vez podrían salir ambas a la red. Se deduplican compartiendo la promesa en curso por clave.
- **Tamaño de `.cache/`:** solo para desarrollo, no versionado (ya está en `.gitignore`).
- **Consumo:** esta historia no hace llamadas reales en los tests. La fixture ya grabada consumió 1 petición.
