---
id: HU-010
title: Bienvenida cuando no hay favoritos
epic: EP-003
status: approved
priority: medium
points: 2
jira: LDZ-17
updated: 2026-10-29
jira_hash: 6b9ac1903ea8
---
# HU-010 — Bienvenida cuando no hay favoritos

**Como** usuario nuevo, **quiero** que la app me ayude a elegir mis equipos la primera vez, **para** empezar a usarla en menos de un minuto.

## Criterios de aceptación
### AC1 — Estado vacío
- **Dado** que no tengo favoritos
- **Cuando** abro la portada
- **Entonces** veo una bienvenida con accesos a "Elegir equipos" y "Elegir competiciones", en lugar de una lista vacía
- Verify: `npm test -w apps/web -- home-empty -t "HU-010 AC1"`

### AC2 — Sugerencias
- **Dado** la bienvenida
- **Cuando** la veo
- **Entonces** se sugieren equipos populares que puedo marcar con un toque, mostrando **primero los de la Liga BetPlay (Colombia)** y después los de las demás competiciones soportadas
- Verify: `npm test -w apps/web -- home-empty -t "HU-010 AC2"`

### AC3 — Transición
- **Dado** que marco mi primer favorito desde la bienvenida
- **Cuando** vuelvo a la portada
- **Entonces** veo "Mis partidos" con sus partidos
- Verify: `npx playwright test onboarding -g "HU-010 AC3"`

### AC4 — Saltar la bienvenida
- **Dado** la bienvenida
- **Cuando** pulso "Omitir por ahora"
- **Entonces** voy a la portada sin favoritos (ver HU-012 AC5), y la bienvenida no vuelve a mostrarse en este dispositivo aunque siga sin favoritos
- Verify: `npx playwright test onboarding -g "HU-010 AC4"`

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
| 2026-10-29 | AC2: equipos colombianos primero. Nuevo AC4: omitir la bienvenida | CR-001 (LDZ-17) |
