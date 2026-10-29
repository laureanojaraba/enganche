---
id: HU-023
title: Navegación responsive
epic: EP-007
status: done
priority: high
points: 3
jira: LDZ-30
updated: 2026-10-29
jira_hash: 46abf9eea3f8
---
# HU-023 — Navegación responsive

**Como** Andrés, **quiero** que la app se vea y se use bien en el iPhone, el Samsung, el iPad y el portátil, **para** usarla en cualquier dispositivo.

## Criterios de aceptación
### AC1 — Móvil
- **Dado** un viewport de 390×844 (iPhone) o 412×915 (Galaxy S25 Ultra)
- **Cuando** navego
- **Entonces** hay una barra inferior con Mis partidos, Competiciones, Favoritos y Ajustes, y no hay scroll horizontal en ninguna pantalla
- Verify: `npx playwright test layout --project=mobile -g "HU-023 AC1"`

### AC2 — Tablet y escritorio
- **Dado** un viewport de 820×1180 (iPad), 1024×1366 (iPad Pro) o de 1280 px o más
- **Cuando** navego
- **Entonces** hay una navegación lateral, y la ficha del partido aprovecha el ancho (por ejemplo, eventos y estadísticas lado a lado)
- Verify: `npx playwright test layout --project=tablet -g "HU-023 AC2"`

### AC3 — Accesibilidad
- **Dado** cualquier pantalla
- **Cuando** se pasa axe
- **Entonces** no hay violaciones serias o críticas, y todo se puede usar con teclado
- Verify: `npx playwright test a11y -g "HU-023 AC3"`

## Notas técnicas
- Respetar las *safe areas* de iOS (notch, barra de inicio) y el modo oscuro del sistema.

## Definición de Hecho
- [x] Todos los AC tienen un test que pasa (AC2: la parte de la ficha del partido está en CR-002)
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (pendiente: i18n llega en HU-021)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
| 2026-10-29 | Implementada: AC1 y AC3 OK; AC2 OK salvo la ficha del partido, que no existe aún (propuesto mover a HU-015 en CR-002). Inicio provisional "Mis partidos" en lugar de redirigir al catálogo | PLAN-007 · CR-002 |
