---
id: BUG-002
title: Cuota de API-Football agotable desde fuera y sin protecciones de seguridad
status: triaged
severity: high
story: HU-003
jira: LDZ-34
updated: 2026-10-29
jira_hash: 03b987e644f4
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
<!-- Se rellena al corregir. -->

## Test de regresión
- Verify: `npm test -w apps/api -- security -t "BUG-002"`
