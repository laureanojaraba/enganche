---
id: HU-002
title: Spike de cobertura del plan gratuito de API-Football
epic: EP-001
status: verifying
priority: high
points: 2
jira: LDZ-9
updated: 2026-10-29
jira_hash: 07d2ab50b404
---
# HU-002 — Spike de cobertura del plan gratuito de API-Football

**Como** responsable del producto, **quiero** confirmar qué temporadas, competiciones y endpoints permite la clave gratuita, **para** fijar con certeza la temporada de desarrollo y los IDs del catálogo (riesgo R1).

## Criterios de aceptación
### AC1 — Informe de cobertura
- **Dado** una `API_FOOTBALL_KEY` gratuita válida
- **Cuando** ejecuto `npm run spike:coverage -w apps/api`
- **Entonces** se genera `jelt/spikes/api-football-cobertura.md` con, para cada una de las 10 competiciones: el ID confirmado, las temporadas permitidas, y si hay datos de partidos, eventos, alineaciones, estadísticas y clasificación
- Verify: `npm run spike:coverage -w apps/api -- --dry-run`

### AC2 — Bajo consumo
- **Dado** el script del spike
- **Cuando** se ejecuta completo
- **Entonces** consume como máximo 40 peticiones y muestra la cuota restante (`/status`)
- Verify: `npm test -w apps/api -- spike -t "HU-002 AC2"`

### AC3 — Decisión registrada
- **Dado** el informe
- **Cuando** se revisa
- **Entonces** la tabla de competiciones del TRD §3 se actualiza con los IDs y la temporada definitivos, y cualquier competición sin cobertura se registra como riesgo en el PRD
- Verify: revisión manual del TRD

## Notas técnicas
- Si la Liga BetPlay u otra competición no tiene cobertura completa en 2024, evaluar 2023.

## Definición de Hecho
- [x] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [x] Textos de la interfaz: no aplica (script interno)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
| 2026-10-29 | Implementada y verificada: AC1 (dry-run), AC2 (30 peticiones ≤ 40), AC3 (TRD §3 y PRD R1/R3 actualizados) | PLAN-002 |
