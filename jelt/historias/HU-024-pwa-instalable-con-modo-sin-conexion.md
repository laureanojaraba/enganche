---
id: HU-024
title: PWA instalable con modo sin conexión
epic: EP-007
status: ba-review
priority: medium
points: 3
jira: LDZ-31
updated: 2026-10-29
jira_hash: 68c5710caeac
---
# HU-024 — PWA instalable con modo sin conexión

**Como** Andrés, **quiero** instalar enganche en la pantalla de inicio de mi teléfono, **para** abrirla como una app más.

## Criterios de aceptación
### AC1 — Instalable
- **Dado** la app servida por HTTPS
- **Cuando** se audita con Lighthouse
- **Entonces** cumple los criterios de PWA instalable: manifest con nombre, iconos (incluido maskable y apple-touch-icon), `display: standalone` y service worker
- Verify: `npm run build -w apps/web && npx playwright test pwa -g "HU-024 AC1"`

### AC2 — Sin conexión
- **Dado** que ya visité la portada y una ficha
- **Cuando** pierdo la conexión y las vuelvo a abrir
- **Entonces** veo los últimos datos guardados con el aviso "Sin conexión · actualizado hace X min"
- Verify: `npx playwright test pwa -g "HU-024 AC2"`

### AC3 — Actualización de versión
- **Dado** que se despliega una versión nueva
- **Cuando** abro la app instalada
- **Entonces** veo un aviso "Nueva versión disponible" con un botón para recargar
- Verify: `npm test -w apps/web -- sw-update -t "HU-024 AC3"`

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
| 2026-10-29 | Proyecto renombrado de ladiez a enganche | Usuario |
