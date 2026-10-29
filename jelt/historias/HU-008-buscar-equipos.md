---
id: HU-008
title: Buscar equipos
epic: EP-003
status: ba-review
priority: medium
points: 2
jira: LDZ-15
updated: 2026-10-29
jira_hash: 46b16efca7c5
---
# HU-008 — Buscar equipos

**Como** Andrés, **quiero** buscar un equipo por su nombre, **para** añadirlo a mis favoritos sin recorrer cada liga.

## Criterios de aceptación
### AC1 — Búsqueda
- **Dado** el buscador de equipos
- **Cuando** escribo al menos 2 caracteres ("nacio")
- **Entonces** veo los equipos de las competiciones soportadas que coinciden, con escudo y competición
- Verify: `npm test -w apps/api -- teams-search -t "HU-008 AC1"`

### AC2 — Sin tildes ni mayúsculas
- **Dado** el equipo "São Paulo"
- **Cuando** busco "sao paulo"
- **Entonces** aparece en los resultados
- Verify: `npm test -w apps/api -- teams-search -t "HU-008 AC2"`

### AC3 — Sin resultados
- **Dado** una búsqueda sin coincidencias
- **Cuando** termina
- **Entonces** veo "No encontramos equipos en las competiciones disponibles"
- Verify: `npm test -w apps/web -- team-search -t "HU-008 AC3"`

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
