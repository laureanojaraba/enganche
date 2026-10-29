---
id: HU-003
title: Adaptador API-Football con caché y snapshots
epic: EP-001
status: approved
priority: high
points: 5
jira: LDZ-10
updated: 2026-10-29
jira_hash: 380f27915672
---
# HU-003 — Adaptador API-Football con caché y snapshots

**Como** desarrollador, **quiero** que la API obtenga los datos del proveedor a través de un adaptador con caché, **para** usar tipos propios y no gastar la cuota diaria.

## Criterios de aceptación
### AC1 — Mapeo a dominio
- **Dado** una respuesta grabada de `/fixtures` de API-Football
- **Cuando** el `ApiFootballProvider` la procesa
- **Entonces** devuelve objetos `Match` válidos según el esquema Zod compartido (equipos, `kickoffUtc`, estado normalizado, marcador)
- Verify: `npm test -w apps/api -- api-football.mapper -t "HU-003 AC1"`

### AC2 — Snapshot reutilizado
- **Dado** que una petición ya se hizo una vez
- **Cuando** se repite en modo desarrollo
- **Entonces** se sirve desde `apps/api/.cache/` sin llamar al proveedor
- Verify: `npm test -w apps/api -- cache -t "HU-003 AC2"`

### AC3 — TTL por tipo de dato
- **Dado** el modo producción (`CACHE_MODE=ttl`)
- **Cuando** se pide una clasificación dos veces en menos de 1 h
- **Entonces** la segunda respuesta viene de la caché, y tras el TTL se vuelve a pedir
- Verify: `npm test -w apps/api -- cache -t "HU-003 AC3"`

### AC4 — Proveedor caído
- **Dado** que el proveedor devuelve error o hay menos del 10 % de cuota
- **Cuando** se pide un dato con caché previa
- **Entonces** se responde con el dato cacheado y `meta.stale: true`
- Verify: `npm test -w apps/api -- cache -t "HU-003 AC4"`

## Notas técnicas
- Interfaz `FootballProvider` en `apps/api/src/providers/`. `SnapshotProvider` para tests con fixtures versionadas.
- Hallazgo del spike HU-002: el contador de `/status` llega con retraso (marcó 14 tras 30 peticiones) y hay un límite de unas 10 por minuto. La protección de cuota (AC4) debe llevar su propio contador diario además de `/status`, y espaciar las peticiones.

## Definición de Hecho
- [ ] Todos los AC tienen un test que pasa
- [ ] Revisión de código hecha
- [ ] Textos de la interfaz en los catálogos de español e inglés (si aplica)

## Historial
| Fecha | Cambio | Origen |
|---|---|---|
| 2026-10-29 | Creación | — |
