---
id: HU-016
title: Alineaciones del partido
epic: EP-005
status: approved
priority: medium
points: 2
jira: LDZ-23
updated: 2026-10-29
jira_hash: a46efa8b88f2
---
# HU-016 — Alineaciones del partido

**Como** Andrés, **quiero** ver las alineaciones, **para** saber quién juega.

## Criterios de aceptación
### AC1 — Alineación
- **Dado** un partido con alineaciones
- **Cuando** abro la pestaña Alineaciones
- **Entonces** veo de cada equipo la formación, los titulares con su número y posición, los suplentes y el entrenador
- Verify: `npm test -w apps/web -- lineups -t "HU-016 AC1"`

### AC2 — Cambios señalados
- **Dado** jugadores que entraron o salieron
- **Cuando** veo la alineación
- **Entonces** se indica el minuto del cambio junto al jugador
- Verify: `npm test -w apps/web -- lineups -t "HU-016 AC2"`

### AC3 — No disponibles
- **Dado** que la API no tiene alineaciones (frecuente en algunas ligas)
- **Cuando** abro la ficha
- **Entonces** la pestaña no aparece
- Verify: `npm test -w apps/web -- match-page -t "HU-016 AC3"`

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
