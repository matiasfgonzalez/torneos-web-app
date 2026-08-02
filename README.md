# GOLAZO - Plataforma de Gestion de Torneos

GOLAZO es una aplicacion web fullstack para organizar, administrar y publicar torneos de futbol, con foco en ligas locales, clubes y organizadores independientes.

## Mision

Democratizar la gestion profesional de torneos deportivos, permitiendo que cualquier organizador pueda operar su competencia con herramientas modernas, datos confiables y una experiencia clara para administradores, equipos, jugadores y publico.

## Objetivo

- Centralizar en un solo sistema la operacion deportiva: torneos, equipos, jugadores, partidos, arbitros, noticias y usuarios.
- Reducir errores manuales en tablas de posiciones y carga de resultados.
- Publicar informacion en tiempo casi real para participantes y audiencia.
- Escalar desde torneos pequenos hasta estructuras multi-fase.

## Para Que Fue Hecho

Este proyecto fue creado para cubrir el ciclo completo de una competencia:

1. Configurar torneos y sus reglas.
2. Registrar equipos y planteles.
3. Programar y actualizar partidos.
4. Calcular standings y estadisticas.
5. Gestionar arbitros y contenido editorial (noticias).
6. Exponer una capa publica atractiva y un panel administrativo con roles.

## Que Hace Hoy

### Funcionalidad Publica

- Landing page comercial y de marca.
- Listado y detalle de torneos.
- Listado y detalle de jugadores.
- Listado y detalle de noticias.
- Listado de partidos por torneo.
- Futbol de hoy: partidos del mundo agrupados por liga, con resultados en vivo.
- Perfil de usuario autenticado.

### Funcionalidad Administrativa

- CRUD de torneos.
- CRUD de equipos y asociacion equipo-torneo.
- CRUD de jugadores y asociacion jugador-equipo (TeamPlayer).
- CRUD de partidos con impacto en tabla de posiciones.
- CRUD de arbitros con soft delete.
- Gestion de usuarios (solo administrador).
- Publicacion y edicion de noticias.

### Seguridad y Autenticacion

- Autenticacion con Clerk.
- Validacion de permisos por rol en gran parte de endpoints.
- Middleware de Clerk aplicado a rutas del sitio y API.

## Stack Tecnologico

- Framework: Next.js (App Router)
- Lenguaje: TypeScript
- UI: Tailwind CSS + Radix + componentes personalizados
- Auth: Clerk
- ORM/DB: Prisma + PostgreSQL
- Multimedia: Cloudinary
- Formularios/Validacion: React Hook Form + Zod

## Arquitectura

- App Router con separacion por dominio:
  - Rutas publicas en app/(public)
  - Rutas admin en app/admin
  - API REST en app/api
- Arquitectura modular por dominio en modules/\*
- Capa utilitaria en lib/\*
- Esquema de datos relacional en prisma/schema.prisma

## Modelo de Dominio (Resumen)

Entidades principales:

- User (roles, estado y auditoria)
- Tournament
- Team
- Player
- Match
- Goal
- Card
- Referee
- News
- TournamentTeam (M:N torneo-equipo)
- TeamPlayer (M:N equipo-jugador por torneo)
- TournamentPhase / TeamPhaseStats

## Analisis Ejecutivo del Estado Actual

### Fortalezas

- Cobertura funcional amplia para una primera version productiva.
- Modelo de datos rico para futbol competitivo real.
- Separacion clara entre frontend publico y panel admin.
- Base de autorizacion por roles ya implementada.

### Riesgos y Deuda Tecnica Detectada

- Endpoints con validacion incompleta o inconsistente.
- Casos de mass assignment en updates puntuales.
- Inconsistencia de formato de errores entre APIs.
- Oportunidades de optimizacion en queries profundas y payloads grandes.
- Falta de test automatizados (unitarios/integracion/e2e).
- Ajustes pendientes para alineacion con requerimientos nuevos de Prisma.

Ver backlog detallado en TODO.md.

## Puesta en Marcha Local

### 1) Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL accesible
- Cuenta de Clerk y Cloudinary (si se usa subida de imagenes)

### 2) Instalar dependencias

```bash
npm install
```

### 3) Variables de entorno

Copiar la plantilla y completar los valores:

```bash
cp .env.example .env
```

`.env` esta en `.gitignore`; `.env.example` no. Nunca poner un valor real en la
plantilla, ni siquiera recortado: el prefijo de un secreto tambien es una pista.

#### Obligatorias

| Variable | Para que sirve | Donde se saca | Si falta |
|---|---|---|---|
| `DATABASE_URL` | Conexion a PostgreSQL. | Neon, Supabase o tu Postgres local. | La app no arranca. Es la unica variable sin la que no funciona absolutamente nada. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clave publica de Clerk (la usa el navegador). | Dashboard de Clerk → Developers → API keys. | No se puede iniciar sesion. |
| `CLERK_SECRET_KEY` | Clave privada de Clerk (solo server). | Idem anterior. | No se puede iniciar sesion; todo `/admin` queda inaccesible. |
| `ADMIN_EMAIL` | Email que recibe el rol **ADMINISTRADOR** al iniciar sesion (bootstrap, ver `lib/checkUser.ts`). Se compara sin distinguir mayusculas y se aplica aunque el usuario ya existiera sin el rol. | Lo elegis vos: tu propio email. | **Nadie es administrador.** No hay forma de entrar a planes, usuarios ni organizaciones. Es lo primero a configurar en una instalacion nueva. |

#### Obligatorias si se suben imagenes (escudos, fotos, portadas)

| Variable | Para que sirve | Si falta |
|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | Nombre de la cuenta de Cloudinary. | No se pueden subir imagenes. |
| `CLOUDINARY_API_KEY` | Firma de subidas. | Idem. |
| `CLOUDINARY_API_SECRET` | Firma de subidas y borrado. **Nunca se expone al cliente.** | Idem. |

Las tres son solo server-side. No hace falta una `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`:
el navegador recibe el cloud name en la respuesta de `/api/cloudinary/sign`.

#### Opcionales

| Variable | Para que sirve | Si falta |
|---|---|---|
| `CLERK_WEBHOOK_SECRET` | Verifica la firma del webhook de Clerk, que sincroniza usuario, email, foto y ultimo login con la BD. | La app anda igual, pero `lastLoginAt` y los cambios hechos en Clerk no se reflejan en la base. |
| `RESEND_API_KEY` | Envio de notificaciones por email (S5). | No se manda ningun mail. La campana dentro de la app sigue funcionando igual. |
| `RESEND_FROM` | Remitente de esos emails. Requiere dominio verificado en Resend. | Usa `onboarding@resend.dev`, que solo entrega a tu propia casilla. |
| `NEXT_PUBLIC_APP_URL` | Base absoluta para links de email, imagenes OG, QR y sitemap (un mail o un QR no pueden usar rutas relativas). | En Vercel se deduce de `VERCEL_URL`; en local asume `http://localhost:3000`. Configurala en produccion con el dominio real. |
| `FOOTBALL_API_KEY` | Clave de API-Sports que alimenta la seccion publica `/futbol-hoy` (partidos del mundo). | La seccion se ve vacia con un aviso de que falta configurarla. El resto del sitio no se entera. Ver "Futbol de hoy" mas abajo. |
| `FOOTBALL_CRON_TOKEN` | Token del cron de [cron-job.org](https://console.cron-job.org/jobs) que refresca los resultados (`GET /api/world-fixtures/refresh`). | Ese endpoint responde 503. **No hace falta**: la seccion se actualiza sola al visitarse. |

#### Rutas de Clerk (no son secretos)

`NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL` y los dos
`..._FALLBACK_REDIRECT_URL` apuntan a paginas de la propia app. Los valores de la
plantilla ya son los correctos: cambialos solo si moves esas paginas.

### 4) Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Sembrar el catalogo de planes (necesario: sin planes no se puede crear una liga):

```bash
npm run db:seed
```

### 5) Levantar entorno de desarrollo

```bash
npm run dev
```

## Scripts

- npm run dev: desarrollo
- npm run devt: desarrollo con turbopack
- npm run build: build de produccion (incluye prisma generate)
- npm run start: iniciar app buildada
- npm run lint: validacion de codigo
- npm run test: tests con Vitest (`npm run test:watch` para el modo interactivo)
- npm run test:integration: tests contra una Postgres descartable (necesita
  `npm run test:db:up` antes)
- npm run test:e2e: tests end-to-end con Playwright (`:ui` para el modo
  interactivo, `:report` para ver el ultimo reporte)
- npm run db:seed: siembra el catalogo de planes (idempotente)
- npm run db:reset: **vacia toda la base** y vuelve a sembrar los planes, para
  arrancar de cero. Pide confirmar escribiendo el nombre de la base y se niega a
  correr con `NODE_ENV=production` (ver `scripts/reset-db.mjs`)

## Testing

Tres capas, cada una con su costo de arranque:

| Comando | Que verifica | Necesita |
|---|---|---|
| `npm test` | Logica pura: fixture, tabla de posiciones, transiciones, validadores Zod, helpers | nada |
| `npm run test:integration` | Queries reales: scope por organizacion, recalculo de standings, migraciones | Postgres descartable (`npm run test:db:up`) |
| `npm run test:e2e` | El navegador contra la app: render, redirecciones del middleware, formularios de punta a punta | la app corriendo + Clerk |

### End-to-end (Playwright)

Los tests viven en `e2e/` y se dividen en dos grupos:

- **`publico.spec.ts`** — no necesita cuenta. Corre en cualquier maquina: verifica
  que las paginas publicas rendericen sin errores de cliente, que no se desborden
  a lo ancho en un telefono de 375px, y que `/admin` mande a sign-in sin sesion.
- **`admin-torneo.spec.ts`** — el flujo del organizador (crear torneo, inscribir
  equipos, cargar el resultado, ver la tabla). Necesita una cuenta de pruebas y
  **se saltea solo** si no esta configurada.

Para habilitar el flujo con sesion, en `.env`:

```bash
E2E_CLERK_USER_EMAIL=pruebas@ejemplo.com
E2E_CLERK_USER_PASSWORD=...
```

La cuenta tiene que existir en la instancia de Clerk del proyecto y ser **OWNER
de una organizacion** (o ADMINISTRADOR de la plataforma): crear torneos consume
cupo del plan y el server exige ese rol.

Ese flujo **escribe en la base de la app bajo prueba**. Borra su torneo al
terminar, pero conviene apuntarlo a la base descartable en vez de a la de
desarrollo:

```bash
npm run test:db:up
DATABASE_URL=postgresql://golazo:golazo@localhost:55432/golazo_test npm run dev
# en otra terminal
npm run test:e2e
```

Variables opcionales: `E2E_PORT` (puerto del servidor, por defecto 3000) y
`E2E_BASE_URL` (probar contra un servidor ya levantado o un preview; con esta
variable Playwright no arranca nada).

En CI el job esta **apagado por defecto** — sin claves de Clerk la app no
arranca. Se enciende con la variable de repositorio `E2E_ENABLED=true` y los
secretos documentados en `.github/workflows/ci.yml`.

## Futbol de Hoy (partidos del mundo)

La ruta publica `/futbol-hoy` muestra **todos los partidos que se juegan hoy en
el mundo, agrupados por liga**, con resultados en vivo, horarios y estadios. Los
datos vienen de [API-Football](https://www.api-football.com/) (`v3.football.api-sports.io`).
La home enlaza a la seccion desde un apartado propio (landing y home del hincha).

### Como se raciona el plan gratuito

El plan gratuito da **100 llamadas por dia para toda la aplicacion**, no por
usuario. Consumir la API desde el navegador en cada visita seria imposible: dos
personas mirando la pagina agotarian la cuota. La arquitectura es:

```
Navegador  →  /api/world-fixtures  →  Base de datos (cache)  →  API-Football
   ↑ polling cada 60 s                        ↑ como maximo 1 llamada cada 20 min
```

- **La clave nunca sale del server** (`lib/futbol-hoy/api-football.ts` es
  `server-only`).
- **La actualizacion es perezosa, disparada por la visita**: al abrir la pagina,
  si la copia guardada tiene mas de 20 minutos, se sale a buscar datos nuevos.
  Sin visitas no se gasta cuota. El cron de cron-job.org (ver mas abajo) se suma
  a esto, no lo reemplaza: la pagina sigue funcionando aunque el cron se caiga.
- **El polling del navegador le pega a nuestra API, no al proveedor**: el
  marcador se actualiza solo sin que eso implique una llamada a API-Football.
- **Hay un techo diario propio de 80 llamadas** (`PRESUPUESTO_DIARIO`), por
  debajo de las 100 del plan, y se cuenta por dia calendario sumando todas las
  fechas consultadas.
- **Un dia pasado y ya resuelto no se vuelve a consultar nunca**: los resultados
  de ayer no cambian.
- Si los datos quedan viejos (proveedor caido, cuota agotada), **la pagina lo
  dice**: un resultado desactualizado sin aviso es peor que no tenerlo.

Las reglas viven en [lib/futbol-hoy/politica.ts](lib/futbol-hoy/politica.ts),
son puras y estan cubiertas por tests (`tests/futbol-hoy/`).

### Que ligas se destacan

Un dia cualquiera trae 150+ partidos de 80 competiciones. `LIGAS_DESTACADAS` en
[lib/futbol-hoy/agrupar.ts](lib/futbol-hoy/agrupar.ts) fija cuales van primero
(Liga Profesional, Libertadores, Sudamericana, Champions, Premier, LaLiga...).
Editar esa lista es la forma soportada de cambiar el orden. Las ligas con
partidos en vivo siempre suben al tope, por encima de la lista.

### Actualizacion programada con cron-job.org

La seccion **funciona sin cron**: se actualiza sola cuando alguien la visita. El
cron agrega que se mantenga fresca aunque no entre nadie (util cuando hay poco
trafico y el primero en entrar no quiere ver datos de hace horas).

**1) Generar el token** y ponerlo en las variables de entorno del deploy:

```bash
openssl rand -hex 32      # o cualquier cadena larga y aleatoria
# FOOTBALL_CRON_TOKEN=<lo que salio>
```

**2) Crear el job** en [console.cron-job.org/jobs](https://console.cron-job.org/jobs):

| Campo | Valor |
|---|---|
| URL | `https://tudominio.com/api/world-fixtures/refresh` |
| Metodo | `GET` |
| Schedule | cada **20 minutos** (`*/20`), o cada 30 para mas margen de cuota |
| Zona horaria | `America/Argentina/Buenos_Aires` |

**3) Autenticar el job.** Cualquiera de las dos formas sirve:

- **Header** (recomendado): pestaña *Headers* → `Authorization` = `Bearer <token>`.
- **Query string** (mas rapido): usar la URL
  `https://tudominio.com/api/world-fixtures/refresh?token=<token>`. Ojo: el
  token queda escrito en la URL, asi que va a aparecer en el historial de
  ejecuciones del panel y en los logs del server.

Sin `FOOTBALL_CRON_TOKEN` configurado el endpoint queda **cerrado** (503), no
abierto: cada llamada gasta de las 100 diarias, y una URL publica que consume
cuota ajena se agota el mismo dia que alguien la descubre.

**Cuentas de cuota.** Un job cada 20 minutos consume **72 llamadas por dia** de
las 100 del plan, dentro del techo propio de 80 (`PRESUPUESTO_DIARIO`). Si se
quiere mas margen —para probar a mano, o por si el proveedor falla y hay
reintentos— conviene cada 30 minutos: 48 por dia.

El endpoint devuelve **200 siempre que haya podido evaluar el pedido**, con el
detalle adentro (`{ llamado, guardados, detalle }`). "No llame porque se agoto
la cuota" es una ejecucion correcta, no un fallo: un 500 ahi haria que
cron-job.org marcara el job como caido sin motivo. Responde 401 solo si el token
no coincide y 503 si no esta configurado — esos si son problemas de verdad.

Tambien sirve para forzar un refresco a mano:

```bash
curl -H "Authorization: Bearer $FOOTBALL_CRON_TOKEN" \
  https://tudominio.com/api/world-fixtures/refresh
```

## API (Resumen)

Superficies principales:

- /api/tournaments
- /api/teams
- /api/players
- /api/matches
- /api/referees
- /api/noticias
- /api/users
- /api/cloudinary/\*
- /api/world-fixtures (+ `/refresh`)

## Estado de Calidad y Proximo Paso

Se realizo una auditoria tecnica integral sobre backend, API, Prisma y frontend.
El plan de remediacion y mejora esta detallado en TODO.md con prioridades P0-P3, criterios de aceptacion y alcance por area.

## Convenciones del Proyecto

- Mensajes de error orientados al usuario en espanol.
- Tipado estricto con TypeScript.
- Server Components por defecto; Client Components solo cuando aporta valor.
- Priorizar validacion de entrada y autorizacion por rol en toda mutacion.
