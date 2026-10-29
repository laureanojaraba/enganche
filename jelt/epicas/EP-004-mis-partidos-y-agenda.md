---
id: EP-004
title: Mis partidos y agenda
status: ba-review
priority: high
jira: LDZ-5
updated: 2026-10-29
jira_hash: 092aeff7a830
---
# EP-004 — Mis partidos y agenda

## Objetivo
La portada "Mis partidos" responde en un vistazo a la pregunta *¿cuándo juegan mis equipos?*: en vivo, hoy, próximos 7 días y últimos resultados de mis favoritos. Además, cada competición tiene una agenda navegable por jornada.

## Alcance
- Portada con secciones En vivo / Hoy / Próximos 7 días / Últimos resultados (F3)
- Tarjeta de partido reutilizable (equipos, hora local o marcador con minuto, competición, icono de dónde ver)
- Agenda por competición con navegación entre jornadas (F4)

## Fuera de alcance
- Ficha detallada del partido (EP-005)

## Criterios de aceptación de la épica
- [ ] Un usuario con favoritos ve sus partidos en la portada sin hacer nada más
- [ ] Los partidos en vivo se actualizan sin recargar la página

## Referencias
- PRD F3, F4 · TRD §5 (`/api/my-matches`, `/api/live`)
