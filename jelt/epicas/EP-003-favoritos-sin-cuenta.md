---
id: EP-003
title: Favoritos sin cuenta
status: ba-review
priority: high
jira: LDZ-4
updated: 2026-10-29
jira_hash: 1a7ebb35d79e
---
# EP-003 — Favoritos sin cuenta

## Objetivo
Permitir que el usuario marque sus equipos y competiciones favoritas sin registrarse, y que se conserven en su dispositivo.

## Alcance
- Buscar equipos dentro de las competiciones soportadas
- Marcar o desmarcar equipos y competiciones como favoritos
- Persistencia versionada en `localStorage`
- Pantalla de bienvenida cuando no hay favoritos

## Fuera de alcance
- Cuentas de usuario y sincronización entre dispositivos (fase 2)

## Criterios de aceptación de la épica
- [ ] Los favoritos persisten al cerrar y reabrir el navegador
- [ ] El formato guardado tiene versión, para migrarlo a cuentas más adelante

## Referencias
- PRD F2 · TRD §3 (favoritos)
