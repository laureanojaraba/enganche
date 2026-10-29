---
id: HU-021
title: Interfaz en español e inglés
epic: EP-007
status: ba-review
priority: medium
points: 3
jira: LDZ-28
updated: 2026-10-29
jira_hash: a704cf423681
---
# HU-021 — Interfaz en español e inglés

**Como** Valentina, **quiero** usar la app en inglés o en español, **para** leerla en el idioma que prefiera.

## Criterios de aceptación
### AC1 — Detección
- **Dado** un navegador en inglés y sin preferencia guardada
- **Cuando** abro la app
- **Entonces** se muestra en inglés; con cualquier otro idioma no soportado, en español
- Verify: `npm test -w apps/web -- i18n -t "HU-021 AC1"`

### AC2 — Selector
- **Dado** el selector de idioma
- **Cuando** cambio a español
- **Entonces** toda la interfaz cambia sin recargar y la preferencia se guarda
- Verify: `npm test -w apps/web -- i18n -t "HU-021 AC2"`

### AC3 — Sin textos escritos en el código
- **Dado** el código de `apps/web/src`
- **Cuando** corre el lint
- **Entonces** falla si hay textos visibles escritos directamente en JSX, y las claves existen en ambos catálogos
- Verify: `npm run lint -w apps/web && npm test -w apps/web -- i18n-keys -t "HU-021 AC3"`

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
