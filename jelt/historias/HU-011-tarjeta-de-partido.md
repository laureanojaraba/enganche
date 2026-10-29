---
id: HU-011
title: Tarjeta de partido
epic: EP-004
status: ba-review
priority: high
points: 2
jira: LDZ-18
updated: 2026-10-29
jira_hash: 70ad3a58d352
---
# HU-011 — Tarjeta de partido

**Como** Andrés, **quiero** que cada partido se muestre con la información esencial, **para** entenderlo de un vistazo.

## Criterios de aceptación
### AC1 — Partido programado
- **Dado** un partido programado
- **Cuando** se muestra su tarjeta
- **Entonces** veo los escudos y nombres de ambos equipos, la hora local, la competición y un icono de "dónde ver"
- Verify: `npm test -w apps/web -- match-card -t "HU-011 AC1"`

### AC2 — En vivo y finalizado
- **Dado** un partido en vivo o finalizado
- **Cuando** se muestra su tarjeta
- **Entonces** veo el marcador y el minuto con un indicador "EN VIVO", o "Final"
- Verify: `npm test -w apps/web -- match-card -t "HU-011 AC2"`

### AC3 — Estados especiales
- **Dado** un partido aplazado o cancelado
- **Cuando** se muestra
- **Entonces** se indica "Aplazado" o "Cancelado" sin hora
- Verify: `npm test -w apps/web -- match-card -t "HU-011 AC3"`

### AC4 — Navegación
- **Dado** una tarjeta
- **Cuando** la pulso
- **Entonces** voy a la ficha del partido
- Verify: `npm test -w apps/web -- match-card -t "HU-011 AC4"`

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
