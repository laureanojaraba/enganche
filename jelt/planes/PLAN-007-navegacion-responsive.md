---
id: PLAN-007
title: Navegación responsive
story: HU-023
status: done
updated: 2026-10-29
---
# PLAN-007 — Plan para HU-023: Navegación responsive

## Enfoque
- **Una sola `<nav aria-label="Principal">`** con cuatro destinos: Mis partidos (`/`), Competiciones, Favoritos y Ajustes. Cambia de posición según el ancho, así que no hay dos navegaciones duplicadas para los lectores de pantalla:
  - **Menos de 768 px** (iPhone 390, S25 Ultra 412): barra **inferior fija** con icono y texto. Respeta `env(safe-area-inset-bottom)`, y el contenido reserva su altura para que nada quede tapado.
  - **768 px o más** (iPad 820, iPad Pro 1024, escritorio de 1280 o más): **barra lateral** a la izquierda, con el logo y el estado de la API.
- **Destinos que aún no existen:** "Mis partidos" (HU-012), "Favoritos" (HU-009) y "Ajustes" muestran una página provisional con un enlace a Competiciones. "Mis partidos" deja de redirigir al catálogo; el cambio se registra en HU-006.
- **Modo oscuro** del sistema con `dark:` (ya en la paleta). **Foco visible** en todos los enlaces y botones.
- **Iconos** en SVG en línea con `aria-hidden`; el nombre accesible es el texto.

**Pruebas en navegador real (Playwright + Chromium)**
- Proyectos `mobile` (390×844, táctil) y `tablet` (820×1180). Los tests recorren además 412×915, 1024×1366 y 1280×800 con `setViewportSize`.
- La API se **simula con `page.route`**, con datos fijos y sin backend ni cuota. Solo arranca Vite.
- **AC1:** en cada ruta, la barra inferior está pegada abajo y no hay scroll horizontal (`scrollWidth ≤ clientWidth`).
- **AC2:** en cada ancho, la navegación es lateral (x = 0, alto completo), no hay barra inferior y no hay scroll horizontal.
- **AC3:** axe sin violaciones `serious` ni `critical` en todas las rutas (móvil y escritorio), y recorrido con teclado: Tab llega a los cuatro enlaces y Enter navega.
- Vitest excluye `e2e/`. El CI ejecuta Playwright en las PR y pushes a `staging` y `main` (TRD §8), no en cada PR a `develop`.

## Alcance de AC2 (decisión pendiente del BA)
La parte *"la ficha del partido aprovecha el ancho (eventos y estadísticas lado a lado)"* no se puede verificar: la ficha llega con HU-015, todavía en revisión. Propuesta: **CR-002**, que mueve ese criterio a HU-015. En esta historia queda verificada la navegación lateral y el uso del ancho en las páginas que ya existen.

## Archivos a crear / modificar
| Archivo | Cambio |
|---|---|
| `apps/web/src/components/Layout.tsx` | Layout responsive + `MainNav` |
| `apps/web/src/components/icons.tsx` | Iconos SVG |
| `apps/web/src/pages/PlaceholderPage.tsx` | Páginas provisionales |
| `apps/web/src/routes.tsx` | `/`, `/favoritos`, `/ajustes` |
| `apps/web/test/layout.test.tsx` | Navegación (Vitest): 4 destinos, `aria-current` |
| `apps/web/playwright.config.ts`, `apps/web/e2e/*.spec.ts`, `e2e/fixtures.ts` | AC1–AC3 |
| `apps/web/vite.config.ts` | Vitest solo en `test/` |
| `apps/web/package.json`, `package.json` | Scripts `e2e` |
| `.github/workflows/ci.yml` | Job `e2e` en `staging` y `main` |

## Pasos (TDD)
1. Rojo en Vitest: la navegación tiene 4 enlaces y marca el activo.
2. Rojo en Playwright: AC1, AC2 y AC3.
3. Implementar el layout, los iconos, las páginas provisionales y las rutas.
4. Calidad completa, Playwright local y CI.
