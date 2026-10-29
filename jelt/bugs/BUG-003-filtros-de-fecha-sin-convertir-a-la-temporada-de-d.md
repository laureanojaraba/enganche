---
id: BUG-003
title: Filtros de fecha sin convertir a la temporada de datos en modo simulado
status: fixed
severity: medium
story: HU-005
jira: LDZ-35
updated: 2026-10-29
jira_hash: ff9110d00f9e
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
En modo simulado, `MatchService.listFixtures` pasaba al proveedor las fechas de pantalla (2026). **Corrección:** en modo simulado se lee el calendario completo de la temporada (ya precargado, sin claves nuevas ni red) y se filtra localmente por días de pantalla (comparando la fecha proyectada de cada partido) y por jornada. Con el reloj real, los filtros se pasan al proveedor tal cual.

## Test de regresión
- Verify: `npm test -w apps/api -- clock -t "BUG-003"`
