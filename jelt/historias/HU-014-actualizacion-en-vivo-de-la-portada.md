---
id: HU-014
title: Actualización en vivo de la portada
epic: EP-004
status: ba-review
priority: medium
points: 3
jira: LDZ-21
updated: 2026-10-29
jira_hash: 73ae233229e5
---
# HU-014 — Actualización en vivo de la portada

**Como** Andrés, **quiero** que los marcadores en vivo se actualicen solos, **para** seguir los partidos sin recargar.

## Criterios de aceptación
### AC1 — Stream SSE
- **Dado** partidos en vivo de mis favoritos
- **Cuando** la portada está abierta
- **Entonces** se abre una conexión a `/api/live?matches=...` y cada evento `match.update` actualiza la tarjeta correspondiente
- Verify: `npm test -w apps/web -- live -t "HU-014 AC1"`

### AC2 — Emisión desde la API
- **Dado** un partido en vivo (real o simulado) cuyo marcador o minuto cambia
- **Cuando** la API lo detecta
- **Entonces** emite un `match.update` en menos de 60 s, sin pedir datos al proveedor una vez por cada cliente conectado
- Verify: `npm test -w apps/api -- live -t "HU-014 AC2"`

### AC3 — Reconexión
- **Dado** que se pierde la conexión
- **Cuando** vuelve
- **Entonces** el cliente se reconecta y recupera el estado actual
- Verify: `npm test -w apps/web -- live -t "HU-014 AC3"`

### AC4 — Gol destacado
- **Dado** que cambia el marcador de un partido
- **Cuando** llega la actualización
- **Entonces** la tarjeta muestra una animación breve de gol, respetando `prefers-reduced-motion`
- Verify: `npm test -w apps/web -- match-card -t "HU-014 AC4"`

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
