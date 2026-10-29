---
id: HU-018
title: Ficha del partido en vivo
epic: EP-005
status: ba-review
priority: medium
points: 3
jira: LDZ-25
updated: 2026-10-29
jira_hash: a385c891be2b
---
# HU-018 — Ficha del partido en vivo

**Como** Andrés, **quiero** que la ficha se actualice sola durante el partido, **para** seguirlo minuto a minuto.

## Criterios de aceptación
### AC1 — Actualización
- **Dado** la ficha de un partido en vivo
- **Cuando** llega un `match.update`
- **Entonces** se actualizan el marcador, el minuto, los eventos y las estadísticas sin recargar ni perder la pestaña activa
- Verify: `npm test -w apps/web -- match-page-live -t "HU-018 AC1"`

### AC2 — Fin del partido
- **Dado** un partido que termina
- **Cuando** llega el estado `finished`
- **Entonces** la ficha muestra "Final" y se cierra la conexión en vivo
- Verify: `npm test -w apps/web -- match-page-live -t "HU-018 AC2"`

### AC3 — Demo simulada
- **Dado** `CLOCK_MODE=simulated` y un partido simulado en curso
- **Cuando** mantengo la ficha abierta 3 minutos
- **Entonces** el minuto avanza y aparecen los eventos que ocurrieron en ese intervalo
- Verify: `npx playwright test live-sim -g "HU-018 AC3"`

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
