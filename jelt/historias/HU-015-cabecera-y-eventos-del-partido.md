---
id: HU-015
title: Cabecera y eventos del partido
epic: EP-005
status: ba-review
priority: high
points: 3
jira: LDZ-22
updated: 2026-10-29
jira_hash: a050bfeb8af8
---
# HU-015 — Cabecera y eventos del partido

**Como** Andrés, **quiero** ver el marcador y lo que ha pasado en el partido, **para** entender cómo se desarrolló.

## Criterios de aceptación
### AC1 — Cabecera
- **Dado** la ficha de un partido
- **Cuando** carga
- **Entonces** veo los equipos con escudo, el marcador, el estado o minuto, la competición con su jornada, la fecha y hora local, y el estadio
- Verify: `npm test -w apps/web -- match-page -t "HU-015 AC1"`

### AC2 — Línea de tiempo
- **Dado** un partido con eventos
- **Cuando** veo la sección Eventos
- **Entonces** aparecen en orden cronológico los goles (con asistencia), los penaltis, los autogoles, las tarjetas, los cambios y el VAR, cada uno con su minuto y alineado al lado de su equipo
- Verify: `npm test -w apps/web -- match-events -t "HU-015 AC2"`

### AC3 — Sin datos
- **Dado** un partido sin eventos disponibles
- **Cuando** abro la ficha
- **Entonces** la sección Eventos no aparece
- Verify: `npm test -w apps/web -- match-page -t "HU-015 AC3"`

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
