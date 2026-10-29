---
id: BUG-001
title: "Claves de caché no únicas: datos guardados corruptibles"
status: triaged
severity: high
story: HU-003
jira: LDZ-33
updated: 2026-10-29
jira_hash: a61092605917
---
# BUG-001 — Claves de caché no únicas: datos guardados corruptibles

## Pasos para reproducir
1. `cacheKey('/fixtures', { round: 'Regular Season - 12' })` y `cacheKey('/fixtures', { round: 'Regular?Season - 12' })`.
2. `cacheKey('/x', { a: '1_b-2' })` y `cacheKey('/x', { a: 1, b: 2 })`.

## Resultado esperado
Claves distintas para peticiones distintas.

## Resultado actual
Ambos pares producen la misma clave: el saneado y el separador `k-v_k-v` son ambiguos. Un cliente puede pedir una variante inválida de `round` y su respuesta (vacía) queda guardada en la entrada legítima de la caché `snapshot`, que no caduca.

## Entorno
`apps/api/src/providers/cache-key.ts` (HU-003); explotable desde `GET /api/competitions/:id/matches?round=` (HU-006).

## Origen
REV-001 hallazgo #1 (revisión independiente de EP-001).

## Causa raíz
<!-- Se rellena al corregir. -->

## Test de regresión
- Verify: `npm test -w apps/api -- cache -t "BUG-001"`
