---
id: CR-001
title: "Bienvenida: priorizar equipos colombianos y permitir saltarla"
status: done
story: HU-010
epic: EP-003
source: LDZ-17
jira: LDZ-32
updated: 2026-10-29
jira_hash: 1ce61b5f2613
---
# CR-001 — Bienvenida: priorizar equipos colombianos y permitir saltarla

## Origen
- BA (laureano jaraba), comentario `/cambios` en **LDZ-17** (HU-010), 2026-10-29.

## Feedback original
> Las sugerencias deben mostrar primero equipos colombianos y permitir saltar la bienvenida

## Interpretación
1. **Orden de sugerencias:** en la bienvenida, los equipos sugeridos se muestran primero de la Liga BetPlay (Colombia) y después los de las demás competiciones soportadas.
2. **Saltar la bienvenida:** hay una acción "Saltar" (u "Omitir por ahora") que lleva a la portada sin elegir favoritos.
   - ⚠️ **Por confirmar:** qué muestra la portada si el usuario salta sin favoritos. Propuesta: los partidos de hoy y en vivo de **todas** las competiciones soportadas, con un aviso discreto de "Elige tus favoritos para personalizar". La decisión de saltar se recuerda en el dispositivo para no volver a mostrar la bienvenida.

## Impacto
| Artefacto | Cambio |
|---|---|
| HU-010 | AC2 (orden de sugerencias) modificado; nuevo AC4 (saltar) |
| HU-012 | Posible nuevo AC: portada sin favoritos tras saltar (según la respuesta a la duda) |
| PRD F2 / F3 | Añadir el comportamiento de la bienvenida omitida |

## Decisión
**Aceptado** (2026-10-29). La duda sobre la portada sin favoritos la resolvió el usuario: se acepta la propuesta.
Aplicado en HU-010 (AC2 modificado, AC4 nuevo), HU-012 (AC5 nuevo) y PRD F2/F3. HU-010 vuelve a revisión del BA.

**Cerrado** (2026-10-29): el BA aprobó la nueva versión de HU-010 (LDZ-17).
