---
id: HU-005
title: Reloj simulado y partidos en vivo simulados
epic: EP-001
status: done
priority: high
points: 5
jira: LDZ-12
updated: 2026-10-29
jira_hash: ff827694b937
---
# HU-005 — Reloj simulado y partidos en vivo simulados

**Como** usuario de la demo, **quiero** ver la temporada 2024 como si se jugara hoy, con partidos en vivo, **para** probar la app completa sin un plan premium.

## Criterios de aceptación
### AC1 — Reproyección de fechas
- **Dado** `CLOCK_MODE=simulated` y `SIM_ANCHOR=2024-11-09T18:00:00Z`
- **Cuando** la API devuelve un partido jugado el 2024-11-09 a las 20:00 UTC
- **Entonces** su `kickoffUtc` corresponde a hoy, 2 horas después del arranque del servidor (desplazamiento = ahora real − ancla)
- Verify: `npm test -w apps/api -- clock -t "HU-005 AC1"`

### AC2 — Estado derivado del reloj
- **Dado** un partido de 2024 ya finalizado en el proveedor
- **Cuando** según el reloj simulado aún no ha empezado, está en curso o ha terminado
- **Entonces** su estado es `scheduled`, `live` (con el minuto calculado) o `finished`, respectivamente
- Verify: `npm test -w apps/api -- clock -t "HU-005 AC2"`

### AC3 — Eventos hasta el minuto actual
- **Dado** un partido simulado en el minuto 55
- **Cuando** pido su ficha
- **Entonces** solo aparecen los eventos hasta el minuto 55, y el marcador corresponde a esos eventos
- Verify: `npm test -w apps/api -- clock -t "HU-005 AC3"`

### AC4 — Modo real
- **Dado** `CLOCK_MODE=real`
- **Cuando** se consulta cualquier partido
- **Entonces** las fechas y estados se devuelven tal como vienen del proveedor
- Verify: `npm test -w apps/api -- clock -t "HU-005 AC4"`

## Notas técnicas
- Hallazgo de HU-004: con `SIM_ANCHOR=2024-11-09` hay partidos de las 6 ligas (6–10 por liga), pero ninguno de las 4 copas internacionales (8–10 nov 2024). Para que la demo muestre copas, elige un ancla con jornada de copa (p. ej. martes/miércoles de Champions) o permite varias anclas, y precarga sus fichas con `SEED_WINDOW_DAYS` o una segunda ejecución.

## Definición de Hecho
- [x] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [x] Textos de la interfaz: no aplica (backend)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
| 2026-10-29 | Ancla por defecto 2024-10-24T19:30Z (10/10 competiciones en ±2 días); implementada y verificada: AC1–AC4 OK | PLAN-005 · decisión del usuario (opción 2) |
