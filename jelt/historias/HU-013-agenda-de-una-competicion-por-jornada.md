---
id: HU-013
title: Agenda de una competición por jornada
epic: EP-004
status: approved
priority: medium
points: 3
jira: LDZ-20
updated: 2026-10-29
jira_hash: a2f0b5a97692
---
# HU-013 — Agenda de una competición por jornada

**Como** Valentina, **quiero** ver los partidos de una competición por jornada o fase, **para** seguir el calendario completo.

## Criterios de aceptación
### AC1 — Jornada actual
- **Dado** la pestaña Partidos de una competición
- **Cuando** carga
- **Entonces** muestra la jornada en curso o la próxima según el reloj
- Verify: `npm test -w apps/web -- competition-matches -t "HU-013 AC1"`

### AC2 — Navegación entre jornadas
- **Dado** una jornada
- **Cuando** pulso "anterior" o "siguiente"
- **Entonces** veo los partidos de esa jornada, y el botón se desactiva en los extremos
- Verify: `npm test -w apps/web -- competition-matches -t "HU-013 AC2"`

### AC3 — Fases de copa
- **Dado** una copa (p. ej. Champions)
- **Cuando** navego
- **Entonces** las jornadas se muestran con el nombre de la fase ("Fase de liga – Jornada 4", "Octavos – Ida")
- Verify: `npm test -w apps/web -- competition-matches -t "HU-013 AC3"`

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
