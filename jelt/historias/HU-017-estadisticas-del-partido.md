---
id: HU-017
title: Estadísticas del partido
epic: EP-005
status: ba-review
priority: medium
points: 2
jira: LDZ-24
updated: 2026-10-29
jira_hash: a72d5313a714
---
# HU-017 — Estadísticas del partido

**Como** Andrés, **quiero** comparar las estadísticas de ambos equipos, **para** saber quién dominó el partido.

## Criterios de aceptación
### AC1 — Comparativa
- **Dado** un partido con estadísticas
- **Cuando** abro la pestaña Estadísticas
- **Entonces** veo, para local y visitante, la posesión, los tiros, los tiros a puerta, los córners, las faltas, los fueras de juego y las tarjetas, cada uno con una barra comparativa, y el xG si existe
- Verify: `npm test -w apps/web -- match-stats -t "HU-017 AC1"`

### AC2 — Accesible
- **Dado** las barras comparativas
- **Cuando** se leen con un lector de pantalla
- **Entonces** cada fila anuncia su valor numérico ("Posesión: local 58 %, visitante 42 %")
- Verify: `npm test -w apps/web -- match-stats -t "HU-017 AC2"`

### AC3 — Parciales
- **Dado** que solo hay algunas estadísticas
- **Cuando** se muestran
- **Entonces** se ocultan las filas sin dato
- Verify: `npm test -w apps/web -- match-stats -t "HU-017 AC3"`

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
