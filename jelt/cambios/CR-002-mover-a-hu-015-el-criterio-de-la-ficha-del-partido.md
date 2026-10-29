---
id: CR-002
title: Mover a HU-015 el criterio de la ficha del partido a todo el ancho
status: ba-review
story: HU-023
epic: EP-007
source: equipo (implementación de HU-023)
jira: LDZ-38
updated: 2026-10-29
jira_hash: 155f19867998
---
# CR-002 — Mover a HU-015 el criterio de la ficha del partido a todo el ancho

## Origen
El equipo lo detectó al implementar HU-023 (LDZ-30) el 2026-10-29.

## Feedback original
> HU-023 AC2: "…hay una navegación lateral, **y la ficha del partido aprovecha el ancho (por ejemplo, eventos y estadísticas lado a lado)**".

## Interpretación
La ficha del partido no existe todavía: llega con HU-015 (cabecera y eventos), HU-016 (alineaciones) y HU-017 (estadísticas). Por eso la segunda mitad de AC2 no se puede implementar ni verificar dentro de HU-023.

**Propuesta:**
1. HU-023 AC2 queda como *"hay una navegación lateral y las páginas aprovechan el ancho disponible"*. Ya está verificado en el catálogo, con tarjetas en varias columnas a 1280 px.
2. Se añade a **HU-015** un criterio nuevo: *"Dado un viewport de 768 px o más, cuando veo la ficha de un partido, entonces eventos y estadísticas se muestran lado a lado"*.

## Impacto
| Artefacto | Cambio |
|---|---|
| HU-023 | AC2 reformulado (sin la ficha del partido) |
| HU-015 | Nuevo AC de diseño a todo el ancho (pendiente de su revisión por el BA) |

## Decisión
<!-- accepted / rejected + motivo. Pendiente del BA. -->
