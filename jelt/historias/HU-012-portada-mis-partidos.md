---
id: HU-012
title: Portada Mis partidos
epic: EP-004
status: ba-review
priority: high
points: 5
jira: LDZ-19
updated: 2026-10-29
jira_hash: 45de173dd1a3
---
# HU-012 — Portada Mis partidos

**Como** Andrés, **quiero** ver en la portada los partidos de mis equipos y competiciones favoritas, **para** saber cuándo juegan sin buscar.

## Criterios de aceptación
### AC1 — Secciones en orden
- **Dado** que tengo favoritos
- **Cuando** abro la portada
- **Entonces** veo, en este orden y solo si tienen partidos: **En vivo**, **Hoy**, **Próximos 7 días** y **Últimos resultados**
- Verify: `npm test -w apps/web -- home -t "HU-012 AC1"`

### AC2 — Filtrado por favoritos
- **Dado** que mis favoritos son el equipo Arsenal y la competición Liga BetPlay
- **Cuando** carga la portada
- **Entonces** aparecen todos los partidos de la Liga BetPlay y los del Arsenal en cualquier competición soportada, sin duplicados
- Verify: `npm test -w apps/api -- my-matches -t "HU-012 AC2"`

### AC3 — Agrupación
- **Dado** varios partidos el mismo día
- **Cuando** se muestran
- **Entonces** se agrupan por día y competición, ordenados por hora
- Verify: `npm test -w apps/web -- home -t "HU-012 AC3"`

### AC4 — Rendimiento
- **Dado** un móvil con 4G simulado
- **Cuando** abro la portada
- **Entonces** el LCP es menor de 2,5 s
- Verify: `npx playwright test perf -g "HU-012 AC4"`

### AC5 — Portada sin favoritos (bienvenida omitida)
- **Dado** que omití la bienvenida y no tengo favoritos
- **Cuando** abro la portada
- **Entonces** veo los partidos **En vivo** y de **Hoy** de todas las competiciones soportadas, con el aviso discreto "Elige tus favoritos para personalizar", que lleva a elegir equipos
- Verify: `npm test -w apps/web -- home -t "HU-012 AC5"`

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
| 2026-10-29 | Nuevo AC5: portada sin favoritos tras omitir la bienvenida | CR-001 (LDZ-17) |
