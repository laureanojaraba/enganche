---
id: HU-006
title: Catálogo de competiciones por secciones
epic: EP-002
status: done
priority: high
points: 3
jira: LDZ-13
updated: 2026-10-29
jira_hash: ecb62a4fd59a
---
# HU-006 — Catálogo de competiciones por secciones

**Como** Andrés, **quiero** ver las competiciones organizadas en Ligas e Internacionales, **para** encontrar rápido la que me interesa.

## Criterios de aceptación
### AC1 — Secciones
- **Dado** que abro "Competiciones"
- **Cuando** carga la página
- **Entonces** veo la sección **Ligas** (BetPlay, Argentina, Serie A, Premier, LaLiga, Brasileirão) y la sección **Internacionales** (Libertadores, Sudamericana, Champions, Europa League), cada una con logo y país o confederación
- Verify: `npm test -w apps/web -- competitions-page -t "HU-006 AC1"`

### AC2 — Solo competiciones soportadas
- **Dado** que se pide a la API una competición fuera de la lista (p. ej. el ID de la liga de Ecuador)
- **Cuando** se llama a `/api/competitions/:id/matches`
- **Entonces** responde `404` con un mensaje claro
- Verify: `npm test -w apps/api -- competitions -t "HU-006 AC2"`

### AC3 — Navegación
- **Dado** el catálogo
- **Cuando** pulso una competición
- **Entonces** voy a su página con las pestañas Partidos y Clasificación
- Verify: `npm test -w apps/web -- competitions-page -t "HU-006 AC3"`

## Definición de Hecho
- [x] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (pendiente: i18n llega en HU-021)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
| 2026-10-29 | Implementada y verificada: AC1–AC3 OK; 0 peticiones a API-Football (datos precargados) | PLAN-006 |
| 2026-10-29 | "/" deja de redirigir al catálogo: muestra el inicio provisional "Mis partidos" (HU-023) | HU-023 |
