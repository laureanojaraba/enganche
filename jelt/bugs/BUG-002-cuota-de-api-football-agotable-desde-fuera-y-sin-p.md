---
id: BUG-002
title: Cuota de API-Football agotable desde fuera y sin protecciones de seguridad
status: closed
severity: high
story: HU-003
jira: LDZ-34
updated: 2026-10-29
jira_hash: 9d78c05b417e
---
# BUG-002 — Cuota de API-Football agotable desde fuera y sin protecciones de seguridad

## Pasos para reproducir
1. Arrancar la API con `API_FOOTBALL_KEY` configurada.
2. Pedir `/api/competitions/39/matches?round=<valor distinto>` en bucle.

## Resultado esperado
La API no permite que un cliente agote la cuota diaria. Tiene las protecciones del TRD §6: límite de peticiones por IP, helmet y CORS restringido. Las entradas se validan.

## Resultado actual
Cada valor nuevo es un fallo de caché que va a la red y gasta cuota. No hay rate limit, helmet ni CORS. La caché en memoria, el directorio `.cache/` y la cola de `HttpSource` crecen sin tope. En modo simulado, los listados en vivo llaman a la red por cada partido (#6). Los errores del proveedor salen como 500 con el mensaje interno (#8).

## Entorno
`providers/index.ts`, `cached-source.ts`, `http-source.ts`, `routes/competitions.ts`, `app.ts`.

## Origen
REV-001 hallazgos #2, #6 y #8.

## Causa raíz
El servidor podía llamar a la red ante cualquier fallo de caché, con entradas libres y sin límites. **Corrección:** (1) con el reloj simulado, o sin clave, el servidor **solo lee los datos guardados** (`SnapshotSource`): la cuota solo la gasta `npm run seed`; (2) validación estricta de `round` (regex, hasta 40 caracteres) y de `from`/`to` (from ≤ to, rango de 31 días como máximo); (3) `@fastify/rate-limit` (120 peticiones por minuto e IP, `RATE_LIMIT_MAX`), `@fastify/helmet` y `@fastify/cors` limitado a `CORS_ORIGIN`; (4) cola de `HttpSource` acotada (20) y caché en memoria LRU (500 entradas); (5) manejador de errores: `ProviderUnavailableError` → `503 DATA_UNAVAILABLE` con mensaje genérico y el resto → `500 INTERNAL`.

## Test de regresión
- Verify: `npm test -w apps/api -- security -t "BUG-002"`
