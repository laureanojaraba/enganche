---
id: PRD
title: enganche
status: approved
updated: 2026-10-29
---
# PRD — enganche

## 1. Resumen y problema
Los aficionados que siguen equipos de varias ligas (por ejemplo, un colombiano que sigue a su club de la Liga BetPlay y a un equipo de la Premier) tienen que saltar entre varias apps y webs para saber **cuándo juegan sus equipos, dónde se ven y cómo va el partido**. Las apps generalistas muestran demasiadas ligas, y la información de qué canal transmite cada partido en Colombia/LATAM está dispersa.

**enganche** es una web responsive (y luego una app móvil) centrada en **mis equipos y mis competiciones**: agenda personal, partidos en vivo, estadísticas y dónde ver cada partido desde Colombia y LATAM.

Es un proyecto personal que sirve para probar el skill `jelt-sl` y que puede acabar en un portafolio.

## 2. Objetivos y métricas de éxito
| Objetivo | Métrica | Meta |
|---|---|---|
| Encontrar rápido los partidos de mis equipos | Pasos desde abrir la app hasta ver el próximo partido de un favorito | 1 (la portada) |
| Saber dónde ver un partido | % de partidos de las ligas soportadas con al menos un canal para Colombia | ≥ 90 % |
| Seguir un partido en vivo | Retraso del marcador frente al real | ≤ 60 s (sujeto al plan de la API) |
| Validar el proceso jelt-sl | Historias del MVP que pasan por revisión del BA en Jira antes de implementarse | 100 % |
| Calidad | Criterios de aceptación cubiertos por tests automáticos | 100 % |

## 3. Usuarios y personas
- **Aficionado multi-liga (principal):** vive en Colombia o LATAM, sigue 2–5 equipos de distintas ligas y consulta la app desde el móvil antes y durante los partidos.
- **Business Analyst (proceso):** revisa y aprueba las historias en Jira. No usa la app como producto.

El detalle de cada persona está en `personas.md`.

## 4. Alcance

### Incluido (MVP)
- **Competiciones soportadas (lista cerrada):**
  - **Ligas:** Liga BetPlay (Colombia), Liga Profesional Argentina, Serie A (Italia), Premier League (Inglaterra), LaLiga (España), Brasileirão Série A (Brasil).
  - **Internacionales:** Copa Libertadores, Copa Sudamericana, UEFA Champions League, UEFA Europa League.
- Favoritos de equipos y competiciones guardados en el dispositivo, sin cuenta.
- Partidos de hoy, en vivo y próximos de mis favoritos; agenda por competición.
- Ficha del partido con marcador, eventos, alineaciones y estadísticas.
- Clasificaciones de cada competición.
- Dónde ver cada partido, para Colombia y LATAM.
- Interfaz en español e inglés; horarios en la zona horaria del dispositivo.
- Web responsive instalable como PWA en iPhone, Android (Samsung S25 Ultra) y tablets (iPad / iPad Pro).

### Fuera de alcance (MVP)
- Cuentas de usuario (Google o email) y sincronización entre dispositivos. Se hará en una fase 2.
- Apps nativas publicadas en App Store o Google Play (fase 3, con Capacitor).
- Notificaciones push de goles y estadísticas de jugadores. Son deseables para la fase 2.
- Que el usuario añada competiciones fuera de la lista soportada.
- Apuestas, noticias, vídeos o highlights.
- Monetización.

## 5. Funcionalidades

### F1 — Catálogo de competiciones (Must)
- Navegación por secciones: **Ligas** y **Internacionales**.
- Cada competición tiene nombre, país, logo y temporada en curso.
- **Regla de negocio:** la lista de competiciones soportadas está en configuración del servidor. El usuario no puede añadir otras.

### F2 — Favoritos sin cuenta (Must)
- Marcar o desmarcar como favoritos equipos (de cualquier competición soportada) y competiciones.
- Buscador de equipos por nombre dentro de las competiciones soportadas.
- Los favoritos se guardan en el dispositivo (`localStorage`) y se conservan al cerrar el navegador.
- **Regla de negocio:** los datos se guardan con un formato versionado para poder migrarlos a una cuenta en la fase 2.
- Estado vacío: si no hay favoritos, la portada muestra una bienvenida para elegir equipos o competiciones. Las sugerencias muestran primero los equipos colombianos (Liga BetPlay). La bienvenida se puede omitir, y entonces no vuelve a mostrarse en ese dispositivo.

### F3 — Portada "Mis partidos" (Must)
- Secciones en este orden: **En vivo**, **Hoy** y **Próximos 7 días** de mis equipos y competiciones favoritas. También se muestran los **últimos resultados** de mis equipos.
- Cada partido muestra los equipos, el escudo, la hora local o el marcador con el minuto, la competición y un icono de "dónde ver".
- Los partidos en vivo se actualizan solos, sin recargar la página.
- Sin favoritos (bienvenida omitida): se muestran los partidos en vivo y de hoy de todas las competiciones soportadas, con un aviso para personalizar.

### F4 — Agenda por competición (Must)
- Partidos por jornada o fecha, con navegación hacia la jornada anterior y la siguiente.
- Pestañas: Partidos · Clasificación.

### F5 — Ficha del partido (Must)
- Marcador, estado (programado, en vivo con minuto, descanso o finalizado) y estadio.
- **Eventos:** goles, tarjetas, cambios y VAR, en una línea de tiempo.
- **Alineaciones:** titulares, suplentes, formación y entrenador, cuando estén disponibles.
- **Estadísticas:** posesión, tiros, tiros a puerta, córners, faltas, fueras de juego, tarjetas y xG si existe.
- **Dónde ver** (F7).
- Durante el partido, la ficha se actualiza sola.

### F6 — Clasificaciones (Must)
- Tabla con posición, PJ, G, E, P, GF, GC, DG, Pts y racha.
- Grupos o fases en las copas.
- Los equipos favoritos aparecen resaltados.

### F7 — Dónde ver (Must)
- Para cada partido, los canales o plataformas que lo emiten en el país del usuario. El país por defecto es Colombia, y en el selector también están Argentina, México, Chile, Perú, Ecuador y Estados Unidos.
- **Fuente:** una tabla propia de derechos por **competición + país**, con excepciones por partido. Ejemplos: Liga BetPlay en Colombia → Win Sports; Premier League en LATAM → ESPN / Disney+. Los valores reales se validan al cargar la tabla.
- Si no hay datos, se muestra "Sin información de transmisión" en lugar de ocultar la sección.

### F8 — Idioma y zona horaria (Must)
- Interfaz en español (por defecto) e inglés, con un selector manual. La primera vez se detecta el idioma del navegador.
- Las fechas y horas que llegan de la API (en UTC) se convierten siempre a la zona horaria del dispositivo, y se indica la zona.

### F9 — PWA instalable (Should)
- Se instala en iOS, Android y iPadOS, con icono, pantalla de inicio y modo standalone.
- Diseño adaptado a móvil, tablet y escritorio.
- Si no hay conexión, se muestran los últimos datos guardados indicando la hora de actualización.

### F10 — Estadísticas de jugadores (Could, fase 2)
### F11 — Notificaciones de goles de favoritos (Could, fase 2)
### F12 — Cuentas Google o email con migración de favoritos (Could, fase 2)
### F13 — Apps nativas con Capacitor (Could, fase 3)

## 6. Requisitos no funcionales
- **Rendimiento:**
  - La portada carga en menos de 2,5 s (LCP) en un móvil con 4G.
  - En vivo, el marcador se actualiza cada 30–60 s como máximo, según lo que permita el plan de la API.
- **Consumo de API:**
  - Todas las llamadas al proveedor pasan por nuestro backend, que hace de caché. El navegador nunca llama a la API directamente ni conoce la API key.
  - El consumo debe ajustarse a la cuota del plan contratado. La caché del backend tiene TTL según el tipo de dato: en vivo, segundos; partidos del día, minutos; clasificaciones, horas; equipos y competiciones, días.
- **Seguridad:** las API keys solo existen en las variables de entorno del servidor. No se guarda ningún dato personal en el MVP.
- **Accesibilidad:** WCAG 2.1 AA en contraste y navegación por teclado. Los colores de los equipos no deben ser la única señal.
- **Compatibilidad:** las últimas 2 versiones de Safari iOS, Chrome Android, Chrome, Edge y Firefox de escritorio.
- **i18n:** ningún texto de la interfaz se escribe directamente en el código; todos salen de los catálogos de español e inglés.
- **Calidad:** cada criterio de aceptación tiene un test automático. El CI ejecuta lint, tests y build.
- **Coste:** 0 USD al mes en desarrollo. Como mucho, unos 20 USD al mes para los datos en tiempo real, si se decide (ver R1).

## 7. Dependencias externas y restricciones
- **Proveedor de datos deportivos:** API-Football (api-sports.io) como opción inicial. Se elegirá definitivamente en el TRD.
  - El backend debe tener una **capa de adaptador** que aísle al proveedor, para poder cambiarlo sin tocar el frontend.
- **Datos de "dónde ver":** no hay una API gratuita fiable. Se mantienen en una tabla propia.
- **Licencias:** no se hace scraping de sitios de terceros (Opta / Stats Perform, elnine.com.ar). Solo sirven como referencia de diseño.
- **Uso no comercial:** mientras se use un plan gratuito, se deben respetar los términos del proveedor.

## 8. Supuestos, riesgos y preguntas abiertas
| # | Tipo | Descripción | Responsable |
|---|---|---|---|
| R1 | Riesgo alto, mitigado | **Confirmado por el spike HU-002 (2026-10-29):** el plan gratuito de API-Football **no incluye la temporada actual (2026)**; solo da acceso a 2022–2024, con 100 peticiones al día y unas 10 por minuto. Las 10 competiciones están disponibles en 2024. **Decisión:** todo el diseño y el desarrollo se hacen con datos reales de una temporada pasada (2024) usando un "reloj simulado". Después, el usuario evaluará un plan premium para tener datos actuales y en vivo. Cambiar de plan o de proveedor no debe requerir cambios en el frontend. | Usuario |
| R2 | Riesgo | Los derechos de TV cambian cada temporada y por país. La tabla de "dónde ver" necesita mantenimiento manual. | Usuario |
| R3 | Riesgo bajo | El spike HU-002 confirma que en 2024 las 10 competiciones (incluida la Liga BetPlay) declaran eventos, alineaciones, estadísticas y clasificación. Queda el riesgo de huecos en partidos concretos; la interfaz debe ocultar las secciones vacías. | Equipo |
| R4 | Supuesto | Hay un solo usuario por dispositivo y los favoritos no se sincronizan entre dispositivos en el MVP. | — |
| Q1 | Resuelta | Países del selector de "dónde ver": CO (por defecto), AR, MX, CL, PE, EC y US. | Usuario |
| Q2 | Resuelta | Para el MVP, la tabla de "dónde ver" es un archivo de datos versionado en el repo, sin panel de administración. **Objetivo futuro:** pasar a un proveedor cuya API incluya los canales de TV por partido (por ejemplo, Sportmonks "TV stations"; está por evaluar). Por eso la fuente de canales también va detrás de un adaptador. | Usuario |

## 9. Historial de cambios
| Fecha | Cambio | Origen (CR/feedback) |
|---|---|---|
| 2026-10-29 | Versión inicial a partir de la entrevista (2 tandas) | — |
| 2026-10-29 | Proyecto renombrado a ladiez; se añade US a "dónde ver" (Q1 resuelta) | Usuario |
| 2026-10-29 | R1: se desarrolla con temporadas pasadas y premium a evaluar. Q2: archivo de canales y API con TV como objetivo. PRD aprobado | Usuario |
| 2026-10-29 | F2/F3: bienvenida con equipos colombianos primero, que se puede omitir; portada sin favoritos | CR-001 (LDZ-17) |
| 2026-10-29 | Proyecto renombrado de ladiez a enganche | Usuario |
| 2026-10-29 | R1 confirmado (Free = 2022–2024) y R3 reducido por el spike | HU-002 (LDZ-9) |
