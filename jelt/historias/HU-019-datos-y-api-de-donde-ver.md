---
id: HU-019
title: Datos y API de dónde ver
epic: EP-006
status: ba-review
priority: medium
points: 3
jira: LDZ-26
updated: 2026-10-29
jira_hash: b4a7246cca24
---
# HU-019 — Datos y API de dónde ver

**Como** Andrés, **quiero** que la app sepa qué canal transmite cada partido en mi país, **para** no tener que buscarlo.

## Criterios de aceptación
### AC1 — Regla por competición
- **Dado** `broadcasts.json` con la regla "Liga BetPlay + CO → Win Sports"
- **Cuando** pido `/api/matches/:id/broadcasts?country=CO` de un partido de la Liga BetPlay
- **Entonces** responde con Win Sports
- Verify: `npm test -w apps/api -- broadcasts -t "HU-019 AC1"`

### AC2 — Excepción por partido
- **Dado** un override para un partido concreto en CO
- **Cuando** lo pido
- **Entonces** el override sustituye a la regla de la competición
- Verify: `npm test -w apps/api -- broadcasts -t "HU-019 AC2"`

### AC3 — Archivo validado
- **Dado** el archivo `broadcasts.json`
- **Cuando** arranca la API o corre el CI
- **Entonces** se valida con Zod (países permitidos: CO, AR, MX, CL, PE, EC, US; competiciones soportadas), y si no es válido falla con un mensaje claro
- Verify: `npm test -w apps/api -- broadcasts -t "HU-019 AC3"`

### AC4 — Datos iniciales
- **Dado** las 10 competiciones y los 7 países
- **Cuando** se carga el archivo inicial
- **Entonces** existe una regla para cada combinación conocida, y las desconocidas quedan documentadas en `apps/api/data/README.md`
- Verify: `npm test -w apps/api -- broadcasts -t "HU-019 AC4"`

## Notas técnicas
- Interfaz `BroadcastProvider`; implementación `FileBroadcastProvider`. Una futura implementación por API no debe cambiar el contrato del endpoint.
- Los datos de canales se investigan para la temporada actual y se anota su fuente y fecha en `updated`.

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
