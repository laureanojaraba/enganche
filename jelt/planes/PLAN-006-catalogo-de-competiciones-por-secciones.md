---
id: PLAN-006
title: Catálogo de competiciones por secciones
story: HU-006
status: done
updated: 2026-10-29
---
# PLAN-006 — Plan para HU-006: Catálogo de competiciones por secciones

## Enfoque
Esta es la primera pantalla real de la app. **No consume cuota de API-Football:** el catálogo combina la lista canónica (`CATALOG`) con los 10 `/leagues` ya precargados (logo y tipo).

**API**
- `GET /api/competitions` → `{ data: { leagues: Competition[], international: Competition[] }, meta }`.
- `GET /api/competitions/:id/matches?from=&to=&round=` → partidos de la competición a través de `MatchService` (con el reloj). Si el id no está en el catálogo, responde **`404`** con `{ error: { code: 'COMPETITION_NOT_SUPPORTED', message } }` (AC2). La navegación por jornadas llega con HU-013.
- `buildApp(config, deps?)` acepta dependencias inyectadas (`source`, `clock`) para los tests. En producción y desarrollo se construyen con `createFootballProvider` y `createClock`.
- **Dominio:** `Competition { id, name, region, logo?, type: 'league'|'cup', section, season }` en `@enganche/shared`. `region` es el país o la confederación en español (Colombia, Sudamérica, Europa…). Se añade al catálogo.

**Web**
- **Nuevas dependencias:** React Router (rutas), TanStack Query (datos) y Tailwind CSS v4 con el plugin de Vite. Todas están previstas en el TRD §2.
- **Rutas:** `/competiciones` (catálogo) y `/competicion/:id` (pestañas **Partidos** y **Clasificación**). El contenido de cada pestaña llega con HU-013 y HU-007; por ahora muestran un texto provisional. `/` redirige al catálogo hasta que exista la portada (HU-012).
- **Catálogo:** dos secciones con encabezado. Cada competición es una tarjeta (logo, nombre y región) que enlaza a su página. Se usa un `<section>` con `aria-labelledby` y una lista accesible.
- **Textos:** todavía escritos en el código, en español. Pasarán a i18n en HU-021, igual que en HU-001.
- **Logos:** desde `media.api-sports.io` (URL de la API), con `alt` y `loading="lazy"`.

## Archivos a crear / modificar
| Archivo | Cambio |
|---|---|
| `packages/shared/src/domain.ts` | `Competition`, `CompetitionCatalog` |
| `apps/api/src/catalog/competitions.ts` | Campo `region` |
| `apps/api/src/services/competition-service.ts` | Catálogo con datos de `/leagues` (caché) |
| `apps/api/src/routes/competitions.ts` | Rutas `/api/competitions` y `/api/competitions/:id/matches` |
| `apps/api/src/app.ts` | Dependencias inyectables; registra las rutas |
| `apps/api/test/competitions.test.ts` | AC2 y forma del catálogo (fuente falsa) |
| `apps/web/src/main.tsx`, `App.tsx`, `index.css` | Router, QueryClient, Tailwind, layout base |
| `apps/web/src/api.ts` | `fetchJson` validado con Zod |
| `apps/web/src/pages/CompetitionsPage.tsx`, `CompetitionPage.tsx` | Páginas |
| `apps/web/test/competitions-page.test.tsx` | AC1 y AC3 (MSW) |

## Pasos (TDD)
1. **API rojo:** `/api/competitions` devuelve 6 ligas y 4 internacionales en el orden del catálogo, con logo. AC2: el id 242 (liga de Ecuador) da `404` con código `COMPETITION_NOT_SUPPORTED`; un id soportado devuelve partidos.
2. Implementar el dominio, el servicio, las rutas y la inyección en `buildApp`.
3. **Web rojo:** AC1, el catálogo muestra las dos secciones con sus competiciones, logo y región. AC3, al pulsar "Premier League" se ve su página con las pestañas Partidos y Clasificación.
4. Instalar las dependencias web y crear el router, Tailwind y las páginas.
5. Calidad completa y prueba manual con `npm run dev` **sin clave** (modo offline sobre los snapshots), para garantizar 0 peticiones.

## Riesgos
- Los textos en el código generan trabajo extra en HU-021. Es asumible y ya está documentado.
- Hotlinking de logos: si `media.api-sports.io` limitara las peticiones, se podrían cachear los logos en la API más adelante.
