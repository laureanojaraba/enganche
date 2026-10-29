# Spike HU-002 — Cobertura de API-Football con la clave gratuita

- Fecha: 2026-10-29T13:13:45.112Z
- Peticiones usadas: 30 de un presupuesto de 40
- Cuota antes: 0/100
- Cuota después: 14/100

## Resumen

| ID | Competición (API) | País | Temporada actual | Acceso por temporada | Recomendada | Eventos | Alineaciones | Estadísticas | Clasificación |
|---|---|---|---|---|---|---|---|---|---|
| 239 | Primera A | Colombia | 2026 | 2026 ✘ plan, 2024 ✔ | 2024 | ✔ | ✔ | ✔ | ✔ |
| 128 | Liga Profesional Argentina | Argentina | 2026 | 2026 ✘ plan, 2024 ✔ | 2024 | ✔ | ✔ | ✔ | ✔ |
| 135 | Serie A | Italy | 2026 | 2026 ✘ plan, 2024 ✔ | 2024 | ✔ | ✔ | ✔ | ✔ |
| 39 | Premier League | England | 2026 | 2026 ✘ plan, 2024 ✔ | 2024 | ✔ | ✔ | ✔ | ✔ |
| 140 | La Liga | Spain | 2026 | 2026 ✘ plan, 2024 ✔ | 2024 | ✔ | ✔ | ✔ | ✔ |
| 71 | Serie A | Brazil | 2026 | 2026 ✘ plan, 2024 ✔ | 2024 | ✔ | ✔ | ✔ | ✔ |
| 13 | CONMEBOL Libertadores | World | 2026 | 2026 ✘ plan, 2024 ✔ | 2024 | ✔ | ✔ | ✔ | ✔ |
| 11 | CONMEBOL Sudamericana | World | 2026 | 2026 ✘ plan, 2024 ✔ | 2024 | ✔ | ✔ | ✔ | ✔ |
| 2 | UEFA Champions League | World | 2026 | 2026 ✘ plan, 2024 ✔ | 2024 | ✔ | ✔ | ✔ | ✔ |
| 3 | UEFA Europa League | World | 2026 | 2026 ✘ plan, 2024 ✔ | 2024 | ✔ | ✔ | ✔ | ✔ |

## Detalle de errores y temporadas

- **239 Primera A**: temporadas en la API 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 · 2026: Free plans do not have access to this season, try from 2022 to 2024.
- **128 Liga Profesional Argentina**: temporadas en la API 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 · 2026: Free plans do not have access to this season, try from 2022 to 2024.
- **135 Serie A**: temporadas en la API 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 · 2026: Free plans do not have access to this season, try from 2022 to 2024.
- **39 Premier League**: temporadas en la API 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 · 2026: Free plans do not have access to this season, try from 2022 to 2024.
- **140 La Liga**: temporadas en la API 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 · 2026: Free plans do not have access to this season, try from 2022 to 2024.
- **71 Serie A**: temporadas en la API 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 · 2026: Free plans do not have access to this season, try from 2022 to 2024.
- **13 CONMEBOL Libertadores**: temporadas en la API 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 · 2026: Free plans do not have access to this season, try from 2022 to 2024.
- **11 CONMEBOL Sudamericana**: temporadas en la API 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 · 2026: Free plans do not have access to this season, try from 2022 to 2024.
- **2 UEFA Champions League**: temporadas en la API 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 · 2026: Free plans do not have access to this season, try from 2022 to 2024.
- **3 UEFA Europa League**: temporadas en la API 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 · 2026: Free plans do not have access to this season, try from 2022 to 2024.
## Conclusiones (AC3)

1. **IDs confirmados:** los 10 IDs del TRD son correctos. El TRD §3 ya incluye el nombre exacto de cada competición en la API.
2. **Temporada de desarrollo: 2024 para todas.** Es la más reciente que permite el plan Free (2022–2024, según el mensaje literal de la API). La temporada actual (2026) está bloqueada, como se preveía en el riesgo R1.
3. **Cobertura completa en 2024:** eventos, alineaciones, estadísticas y clasificación en las 10 competiciones, incluida la Liga BetPlay. El riesgo R3 baja a "bajo".
4. **Límites reales:** 100 peticiones al día y unas 10 por minuto. El contador de `/status` se actualiza con retraso (marcó 14 tras 30 peticiones), así que la protección de cuota (HU-003) debe contar sus propias peticiones en lugar de fiarse solo de `/status`.
5. **Sin competiciones descartadas:** no hace falta registrar riesgos nuevos de cobertura.

> Este archivo lo genera `npm run spike:coverage -w apps/api`. Si se vuelve a ejecutar, la sección de conclusiones debe revisarse a mano.
