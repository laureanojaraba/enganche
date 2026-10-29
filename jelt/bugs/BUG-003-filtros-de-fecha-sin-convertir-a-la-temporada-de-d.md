---
id: BUG-003
title: Filtros de fecha sin convertir a la temporada de datos en modo simulado
status: triaged
severity: medium
story: HU-005
jira: LDZ-35
updated: 2026-10-29
jira_hash: 062e7f3cb8b3
---
# BUG-003 — Filtros de fecha sin convertir a la temporada de datos en modo simulado

## Pasos para reproducir
1. `CLOCK_MODE=simulated` con el ancla en 2024.
2. Pedir `/api/competitions/3/matches?from=<hoy>&to=<hoy>` (fechas de 2026).

## Resultado esperado
La API convierte `from` y `to` a la temporada de datos (2024) antes de consultar, y devuelve los partidos de "hoy" reproyectados.

## Resultado actual
`MatchService.listFixtures` pasa las fechas de 2026 tal cual al proveedor: el plan Free lo bloquea, la respuesta llega vacía y se gasta cuota.

## Entorno
`apps/api/src/services/match-service.ts:14`, `clock/clock.ts`.

## Origen
REV-001 hallazgo #3.

## Causa raíz
<!-- Se rellena al corregir. -->

## Test de regresión
- Verify: `npm test -w apps/api -- clock -t "BUG-003"`
