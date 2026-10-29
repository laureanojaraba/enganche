---
id: BUG-004
title: Prórroga y tanda de penaltis mal simuladas
status: open
severity: medium
story: HU-005
jira: LDZ-36
updated: 2026-10-29
jira_hash: 8890253356f8
---
# BUG-004 — Prórroga y tanda de penaltis mal simuladas

## Pasos para reproducir
1. Simular un partido de eliminatoria terminado en penaltis (Libertadores, Sudamericana, Champions).

## Resultado esperado
La tanda de penaltis no suma al marcador del partido. La prórroga se muestra como en vivo (minutos 91–120) y no como finalizado. El marcador final coincide con el del proveedor.

## Resultado actual
Los eventos con `comments: "Penalty Shootout"` se mapean como `penalty` y suman goles: un 1-1 puede verse 5-4. El partido pasa a `finished` a los 50 minutos de iniciada la segunda parte, aunque haya prórroga.

## Entorno
`apps/api/src/clock/simulate.ts`, `providers/api-football.mapper.ts`.

## Origen
REV-001 hallazgo #4. Pendiente de verificar con una ficha real con tanda de penaltis (requiere cuota).

## Causa raíz
<!-- Se rellena al corregir. -->

## Test de regresión
- Verify: `npm test -w apps/api -- clock -t "BUG-004"`
