---
id: EP-001
title: Fundación técnica y datos
status: approved
priority: high
jira: LDZ-1
updated: 2026-10-29
jira_hash: 6df623358da5
---
# EP-001 — Fundación técnica y datos

## Objetivo
Dejar lista la base sobre la que se construye todo: el monorepo, la API propia con el adaptador de API-Football, los snapshots y la precarga para no gastar la cuota, el reloj simulado que proyecta la temporada 2024 a fechas actuales, y el CI. Sin esto ninguna otra épica puede mostrar datos reales.

## Alcance
- Monorepo (`apps/web`, `apps/api`, `packages/shared`) con TypeScript, lint, tests y CI
- Tipos de dominio compartidos y adaptador API-Football → dominio
- Spike de verificación: temporadas e IDs permitidos con la clave gratuita
- Caché con snapshots en disco, script `seed` con presupuesto diario y protección de cuota
- Reloj simulado con reproyección de fechas y simulación de partidos "en vivo"
- Endpoint `/api/health`

## Fuera de alcance
- Pantallas de usuario (las cubren las demás épicas)
- Despliegue a producción

## Criterios de aceptación de la épica
- [ ] `npm run dev` levanta la web y la API, y la web consume la API a través del proxy
- [ ] Los datos de las 10 competiciones de 2024 están precargados sin superar 100 peticiones al día
- [ ] Con el reloj simulado, la API devuelve partidos "de hoy" con fechas actuales
- [ ] El CI ejecuta lint, typecheck, tests y build en cada PR

## Referencias
- PRD §6, §7, R1 · TRD §1, §4, §8, ADR-3/4/5
