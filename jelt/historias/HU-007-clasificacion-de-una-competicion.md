---
id: HU-007
title: Clasificación de una competición
epic: EP-002
status: approved
priority: high
points: 3
jira: LDZ-14
updated: 2026-10-29
jira_hash: 4c13c80bb0cb
---
# HU-007 — Clasificación de una competición

**Como** Andrés, **quiero** ver la tabla de posiciones de una competición, **para** saber cómo va mi equipo.

## Criterios de aceptación
### AC1 — Tabla de liga
- **Dado** la pestaña Clasificación de LaLiga
- **Cuando** carga
- **Entonces** veo posición, escudo, equipo, PJ, G, E, P, GF, GC, DG, Pts y racha (últimos 5)
- Verify: `npm test -w apps/web -- standings -t "HU-007 AC1"`

### AC2 — Grupos en copas
- **Dado** una copa con fase de grupos (p. ej. Libertadores)
- **Cuando** abro la clasificación
- **Entonces** veo una tabla por grupo con su nombre
- Verify: `npm test -w apps/web -- standings -t "HU-007 AC2"`

### AC3 — Favoritos resaltados
- **Dado** que Atlético Nacional es favorito
- **Cuando** veo la tabla de la Liga BetPlay
- **Entonces** su fila aparece resaltada, con una señal que no depende solo del color (p. ej. una estrella)
- Verify: `npm test -w apps/web -- standings -t "HU-007 AC3"`

### AC4 — Pantalla estrecha
- **Dado** un móvil de 390 px de ancho
- **Cuando** veo la tabla
- **Entonces** se muestran posición, equipo, PJ, DG y Pts sin scroll horizontal de la página, y el resto de columnas se puede ver con scroll dentro de la tabla
- Verify: `npx playwright test standings --project=mobile -g "HU-007 AC4"`

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
