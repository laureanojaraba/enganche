---
id: HU-009
title: Marcar equipos y competiciones como favoritos
epic: EP-003
status: ba-review
priority: high
points: 3
jira: LDZ-16
updated: 2026-10-29
jira_hash: 135b5f18f830
---
# HU-009 — Marcar equipos y competiciones como favoritos

**Como** Andrés, **quiero** marcar equipos y competiciones como favoritos, **para** que la app me muestre solo lo que me interesa.

## Criterios de aceptación
### AC1 — Marcar y desmarcar
- **Dado** un equipo o una competición en cualquier listado
- **Cuando** pulso la estrella
- **Entonces** queda marcado como favorito, y si la vuelvo a pulsar se desmarca
- Verify: `npm test -w apps/web -- favorites -t "HU-009 AC1"`

### AC2 — Persistencia
- **Dado** que tengo favoritos
- **Cuando** cierro el navegador y vuelvo a abrir la app
- **Entonces** siguen ahí
- Verify: `npx playwright test favorites -g "HU-009 AC2"`

### AC3 — Formato versionado
- **Dado** que guardo favoritos
- **Cuando** leo `localStorage["enganche:favorites"]`
- **Entonces** contiene `{"version":1,"teams":[...],"competitions":[...]}`, y si encuentra datos corruptos los ignora sin romper la app
- Verify: `npm test -w apps/web -- favorites-storage -t "HU-009 AC3"`

### AC4 — Mis favoritos
- **Dado** que tengo favoritos
- **Cuando** abro "Mis favoritos"
- **Entonces** veo mis equipos y competiciones, y puedo quitarlos desde ahí
- Verify: `npm test -w apps/web -- favorites -t "HU-009 AC4"`

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
| 2026-10-29 | Proyecto renombrado de ladiez a enganche | Usuario |
