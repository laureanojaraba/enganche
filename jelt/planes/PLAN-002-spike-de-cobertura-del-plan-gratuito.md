---
id: PLAN-002
title: Spike de cobertura del plan gratuito
story: HU-002
status: done
updated: 2026-10-29
---
# PLAN-002 — Plan para HU-002: Spike de cobertura del plan gratuito

## Enfoque
El spike es un script de línea de comandos que hace las mínimas llamadas necesarias y genera un informe en Markdown.

**Hechos comprobados el 2026-10-29** con `/status`, que no consume cuota:
- Plan **Free**, 100 peticiones al día.
- Unas **10 peticiones por minuto** (cabecera `x-ratelimit-remaining`).

**Estrategia de llamadas** (unas 30, con un tope de 40):

1. `GET /status`: cuota antes y después. No cuenta para la cuota.
2. `GET /leagues?id=<id>` por competición (10 llamadas). Devuelve el nombre, el país, **todas las temporadas** con su bandera `current` y su `coverage`, que dice si hay eventos, alineaciones, estadísticas de partido y clasificación. Esto confirma el ID y la cobertura **sin pedir partidos**.
3. **Sondeo de acceso por temporada.** `GET /standings?league=<id>&season=<s>` para la temporada actual y para 2024 (20 llamadas). Si el plan no permite una temporada, la API responde `errors.plan`. Si 2024 está bloqueada, se prueba 2023, mientras quede presupuesto.
4. **Espaciado** de unos 7 s entre llamadas, para no superar el límite por minuto. El spike completo tarda unos 4 minutos.
5. **Presupuesto duro de 40 peticiones.** Si se alcanza, el script se detiene y lo indica en el informe.

**Salida:** `jelt/spikes/api-football-cobertura.md` con una tabla por competición:
- ID y nombre confirmados;
- temporada actual según la API;
- temporadas permitidas o bloqueadas por el plan;
- cobertura de partidos, eventos, alineaciones, estadísticas y clasificación;
- temporada recomendada para desarrollo.

Con `--dry-run` muestra las llamadas planificadas sin usar la red ni la clave.

## Archivos a crear / modificar
| Archivo | Cambio |
|---|---|
| `apps/api/src/spikes/coverage.ts` | Lógica del spike con `fetch` y temporizador inyectables (testeables): plan de llamadas, presupuesto, interpretación y render del informe |
| `apps/api/src/spikes/coverage-cli.ts` | Entrada CLI: carga `.env`, `--dry-run`, escribe el informe |
| `apps/api/src/spikes/competitions.ts` | Lista de las 10 competiciones candidatas (IDs del TRD) |
| `apps/api/test/spike.test.ts` | `HU-002 AC2` (≤ 40 peticiones, `/status` consultado) y comportamiento ante `errors.plan` y fin de presupuesto |
| `apps/api/package.json` | Script `spike:coverage` |
| `jelt/spikes/api-football-cobertura.md` | Informe generado (versionado: es evidencia de la decisión) |
| `jelt/trd.md` §3, `jelt/prd.md` §8 | AC3: IDs y temporada definitivos; riesgos de cobertura |

## Pasos (TDD)
1. **Test rojo `HU-002 AC2`:** con un `fetch` falso que simula `/leagues`, `/standings` (algunas temporadas con `errors.plan`) y `/status`, el spike hace como máximo 40 llamadas que cuentan para la cuota, consulta `/status` y devuelve 10 resultados.
2. **Test rojo:** el presupuesto se respeta (con un tope de 5, se detiene y marca el informe como incompleto).
3. **Test rojo:** una temporada con `errors.plan` aparece como "bloqueada", y la temporada recomendada es la más reciente permitida con fixtures y clasificación.
4. Implementar `coverage.ts` hasta poner los tests en verde. Después, la CLI y `--dry-run` (AC1 Verify).
5. **Ejecución real** con la clave (unas 30 peticiones) y revisión del informe.
6. **AC3:** actualizar el TRD y el PRD con los resultados. Si alguna competición no tiene cobertura suficiente, registrarla como riesgo y proponer una alternativa.

## Riesgos y dudas
- Si la cobertura por temporada de `/leagues` no es fiable para el plan Free, el sondeo con `/standings` la complementa.
- Las respuestas de la API no se guardan en el repo; solo el informe. Los snapshots llegarán con HU-003.
