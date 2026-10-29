---
id: EP-005
title: Ficha del partido y en vivo
status: ba-review
priority: high
jira: LDZ-6
updated: 2026-10-29
jira_hash: 2fb67ea96938
---
# EP-005 — Ficha del partido y en vivo

## Objetivo
Una ficha completa de cada partido (marcador, eventos, alineaciones y estadísticas) que se actualiza sola mientras el partido está en juego.

## Alcance
- Cabecera: marcador, estado y minuto, estadio
- Línea de tiempo de eventos (goles, tarjetas, cambios, VAR)
- Alineaciones (formación, titulares, suplentes, entrenador)
- Estadísticas comparadas
- Actualización en vivo por SSE (real o simulada)

## Fuera de alcance
- Estadísticas individuales de jugadores (fase 2)

## Criterios de aceptación de la épica
- [ ] Un partido finalizado de 2024 muestra todas sus secciones con datos reales
- [ ] Un partido "en vivo" simulado avanza su minuto y sus eventos sin recargar
- [ ] Las secciones sin datos (habitual en algunas ligas) se ocultan, sin mostrar errores

## Referencias
- PRD F5, R3 · TRD §4 (reloj simulado), ADR-6
