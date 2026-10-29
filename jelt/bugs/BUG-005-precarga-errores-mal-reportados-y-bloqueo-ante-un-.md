---
id: BUG-005
title: "Precarga: errores mal reportados y bloqueo ante un fallo permanente"
status: open
severity: medium
story: HU-004
jira: LDZ-37
updated: 2026-10-29
jira_hash: 0450ec6174c2
---
# BUG-005 — Precarga: errores mal reportados y bloqueo ante un fallo permanente

## Pasos para reproducir
1. Ejecutar `npm run seed` con una petición del plan que falle siempre (por ejemplo, por una restricción del plan).
2. Ejecutar con `SEED_DAILY_BUDGET=abc`.

## Resultado esperado
El CLI distingue "cuota agotada" de "error del proveedor", registra la petición fallida, la salta y sigue con el resto del plan. Las variables numéricas inválidas se rechazan con un mensaje claro.

## Resultado actual
Cualquier error se anuncia como "Cuota diaria casi agotada". La petición que falla se reintenta primero cada día y la precarga nunca avanza. `SEED_DAILY_BUDGET` no numérico desactiva el presupuesto (NaN), y `SEED_WINDOW_DAYS` no numérico da 0 fichas.

## Entorno
`apps/api/src/seed/seed-cli.ts`, `seed/seed.ts`, `providers/cached-source.ts`.

## Origen
REV-001 hallazgos #5 y #7.

## Causa raíz
<!-- Se rellena al corregir. -->

## Test de regresión
- Verify: `npm test -w apps/api -- seed -t "BUG-005"`
