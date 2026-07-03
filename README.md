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

Crear archivo .env con las variables necesarias (ejemplo):

```env
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 4) Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Opcional seed:

```bash
npm run prisma db seed
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

## Estado de Calidad y Proximo Paso

Se realizo una auditoria tecnica integral sobre backend, API, Prisma y frontend.
El plan de remediacion y mejora esta detallado en TODO.md con prioridades P0-P3, criterios de aceptacion y alcance por area.

## Convenciones del Proyecto

- Mensajes de error orientados al usuario en espanol.
- Tipado estricto con TypeScript.
- Server Components por defecto; Client Components solo cuando aporta valor.
- Priorizar validacion de entrada y autorizacion por rol en toda mutacion.
