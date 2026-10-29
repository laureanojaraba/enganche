---
id: HU-004
title: Precarga de datos con presupuesto de cuota
epic: EP-001
status: approved
priority: high
points: 3
jira: LDZ-11
updated: 2026-10-29
jira_hash: fa751395e866
---
# HU-004 — Precarga de datos con presupuesto de cuota

**Como** desarrollador, **quiero** un script que descargue los datos de la temporada de desarrollo respetando un presupuesto diario, **para** tener las 10 competiciones disponibles sin superar 100 peticiones al día.

## Criterios de aceptación
### AC1 — Presupuesto respetado
- **Dado** `SEED_DAILY_BUDGET=90`
- **Cuando** ejecuto `npm run seed -w apps/api`
- **Entonces** el script se detiene al llegar a 90 peticiones e informa de cuántas faltan
- Verify: `npm test -w apps/api -- seed -t "HU-004 AC1"`

### AC2 — Reanudable
- **Dado** una precarga interrumpida
- **Cuando** la ejecuto de nuevo otro día
- **Entonces** continúa donde se quedó, sin repetir peticiones ya guardadas
- Verify: `npm test -w apps/api -- seed -t "HU-004 AC2"`

### AC3 — Prioridad
- **Dado** el plan de precarga
- **Cuando** se ejecuta
- **Entonces** descarga primero competiciones, equipos, calendarios y clasificaciones de las 10 competiciones, y después fichas completas (eventos, alineaciones, estadísticas) de las jornadas alrededor de `SIM_ANCHOR`
- Verify: `npm test -w apps/api -- seed -t "HU-004 AC3"`

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
