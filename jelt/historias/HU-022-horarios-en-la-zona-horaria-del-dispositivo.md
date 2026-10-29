---
id: HU-022
title: Horarios en la zona horaria del dispositivo
epic: EP-007
status: ba-review
priority: medium
points: 2
jira: LDZ-29
updated: 2026-10-29
jira_hash: 38ee1582e24f
---
# HU-022 — Horarios en la zona horaria del dispositivo

**Como** Valentina, **quiero** ver la hora de los partidos en mi zona horaria, **para** no tener que hacer cálculos.

## Criterios de aceptación
### AC1 — Conversión
- **Dado** un partido con `kickoffUtc = 2026-11-01T19:00:00Z`
- **Cuando** lo veo con zona `America/Bogota`
- **Entonces** se muestra a las 14:00; con `America/New_York`, a las 14:00 (EST); con `Europe/Madrid`, a las 20:00
- Verify: `npm test -w apps/web -- datetime -t "HU-022 AC1"`

### AC2 — Hoy y mañana en local
- **Dado** un partido que en UTC es "mañana" pero en mi zona es "hoy"
- **Cuando** aparece en la portada
- **Entonces** se agrupa en **Hoy**
- Verify: `npm test -w apps/web -- datetime -t "HU-022 AC2"`

### AC3 — Zona visible
- **Dado** cualquier pantalla con horas
- **Cuando** la veo
- **Entonces** se indica la zona horaria usada (p. ej. "Hora de Bogotá (GMT-5)") en el pie o en la cabecera
- Verify: `npm test -w apps/web -- datetime -t "HU-022 AC3"`

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
