---
id: EP-006
title: Dónde ver
status: ba-review
priority: medium
jira: LDZ-7
updated: 2026-10-29
jira_hash: b7ea0f95782a
---
# EP-006 — Dónde ver

## Objetivo
Decir en qué canal o plataforma se puede ver cada partido según el país del usuario (CO, AR, MX, CL, PE, EC, US).

## Alcance
- Archivo `broadcasts.json` con reglas por competición y país, y excepciones por partido
- Adaptador `BroadcastProvider` (archivo ahora, API después)
- Selector de país con Colombia por defecto, guardado en el dispositivo
- Sección "Dónde ver" en la ficha y un icono en las tarjetas de partido

## Fuera de alcance
- Panel de administración (decisión Q2 del PRD)
- Proveedor de canales por API (objetivo futuro)

## Criterios de aceptación de la épica
- [ ] Hay canales para Colombia en al menos el 90 % de los partidos de las competiciones soportadas
- [ ] Si no hay datos, se muestra "Sin información de transmisión"

## Referencias
- PRD F7, Q2, R2 · TRD §3, §4, ADR-8
