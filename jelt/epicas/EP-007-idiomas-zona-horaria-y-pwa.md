---
id: EP-007
title: Idiomas, zona horaria y PWA
status: ba-review
priority: medium
jira: LDZ-8
updated: 2026-10-29
jira_hash: 5ed8417f83e6
---
# EP-007 — Idiomas, zona horaria y PWA

## Objetivo
Que la app funcione bien para usuarios en cualquier zona horaria, en español o en inglés, y que se pueda instalar como app en iPhone, Android y iPad.

## Alcance
- i18n en español e inglés, con detección del idioma y selector (F8)
- Todas las fechas convertidas de UTC a la zona del dispositivo, indicando la zona (F8)
- PWA: manifest, iconos, modo standalone, último dato disponible sin conexión (F9)
- Diseño responsive para móvil, tablet y escritorio

## Fuera de alcance
- Apps nativas con Capacitor (fase 3)
- Notificaciones push (fase 2)

## Criterios de aceptación de la épica
- [ ] Ningún texto de la interfaz está escrito directamente en el código
- [ ] La app se instala y abre en modo standalone en iOS y Android
- [ ] Las horas son correctas en America/Bogota y en America/New_York

## Referencias
- PRD F8, F9, §6 · TRD §2
