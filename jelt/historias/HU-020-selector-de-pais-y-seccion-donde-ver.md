---
id: HU-020
title: Selector de país y sección dónde ver
epic: EP-006
status: ba-review
priority: medium
points: 2
jira: LDZ-27
updated: 2026-10-29
jira_hash: ee85420d5eac
---
# HU-020 — Selector de país y sección dónde ver

**Como** Valentina, **quiero** elegir mi país para ver los canales que me corresponden, **para** saber dónde ver el partido en Estados Unidos.

## Criterios de aceptación
### AC1 — País por defecto
- **Dado** un usuario nuevo
- **Cuando** abre la app
- **Entonces** el país de "dónde ver" es Colombia
- Verify: `npm test -w apps/web -- country -t "HU-020 AC1"`

### AC2 — Cambio de país
- **Dado** el selector de país (CO, AR, MX, CL, PE, EC, US)
- **Cuando** elijo US
- **Entonces** todas las secciones "dónde ver" muestran los canales de US, y la elección se guarda en el dispositivo
- Verify: `npm test -w apps/web -- country -t "HU-020 AC2"`

### AC3 — Sección en la ficha
- **Dado** la ficha de un partido
- **Cuando** hay canales
- **Entonces** veo el canal y la plataforma (con enlace si existe); si no hay, veo "Sin información de transmisión"
- Verify: `npm test -w apps/web -- broadcasts-section -t "HU-020 AC3"`

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
