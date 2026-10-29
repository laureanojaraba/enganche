---
id: BUG-001
title: "Claves de caché no únicas: datos guardados corruptibles"
status: closed
severity: high
story: HU-003
jira: LDZ-33
updated: 2026-10-29
jira_hash: c0fa853d48e0
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
La clave se construía saneando `ruta + k-v_k-v`: el saneado (`[^a-zA-Z0-9._-]` → `-`) y el separador no eran reversibles. **Corrección:** clave = prefijo legible + SHA-1 (16 hex) de la petición canónica (JSON de ruta y parámetros ordenados, valores como texto). `migrateCacheDir` renombra al vuelo los archivos con el formato antiguo usando el `get` y los `parameters` que API-Football incluye en cada respuesta. Los 70 archivos guardados se migraron **sin gastar cuota**; la migración también se ejecuta sola al arrancar.

## Test de regresión
- Verify: `npm test -w apps/api -- cache -t "BUG-001"`
