---
id: HU-023
title: Navegación responsive
epic: EP-007
status: ba-review
priority: high
points: 3
jira: LDZ-30
updated: 2026-10-29
jira_hash: 363337f051bb
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
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
