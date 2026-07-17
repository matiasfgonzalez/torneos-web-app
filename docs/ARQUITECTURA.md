# Arquitectura del Proyecto GOLAZO

## Visión General

Este proyecto utiliza **Next.js 14+** con el **App Router** y sigue una arquitectura modular profesional y escalable.

## Estructura de Directorios

```
torneos-web-app/
├── app/                          # App Router de Next.js
│   ├── (public)/                 # Route Group - Páginas públicas
│   │   ├── layout.tsx           # Layout para páginas públicas
│   │   ├── torneos/             # /torneos
│   │   ├── equipos/             # /equipos
│   │   ├── jugadores/           # /jugadores
│   │   ├── partidos/            # /partidos
│   │   ├── noticias/            # /noticias
│   │   ├── profile/             # /profile
│   │   └── login/               # /login
│   │
│   ├── (admin)/                  # Route Group - Panel administrativo
│   │   ├── layout.tsx           # Layout para admin (con autenticación)
│   │   ├── dashboard/           # /admin/dashboard
│   │   ├── torneos/             # /admin/torneos
│   │   ├── equipos/             # /admin/equipos
│   │   ├── jugadores/           # /admin/jugadores
│   │   ├── noticias/            # /admin/noticias
│   │   ├── arbitros/            # /admin/arbitros
│   │   └── usuarios/            # /admin/usuarios
│   │
│   ├── api/                      # API Routes
│   │   ├── tournaments/
│   │   ├── teams/
│   │   ├── players/
│   │   ├── matches/
│   │   ├── noticias/
│   │   └── users/
│   │
│   ├── sign-in/                  # Autenticación (Clerk)
│   ├── sign-up/
│   ├── sso-callback/
│   │
│   ├── layout.tsx               # Layout raíz
│   ├── page.tsx                 # Página principal (/)
│   ├── not-found.tsx           # Página 404
│   └── globals.css
│
├── modules/                      # 🎯 ARQUITECTURA MODULAR
│   ├── torneos/                  # Módulo de Torneos
│   │   ├── actions/             # Server Actions
│   │   │   ├── getTorneos.ts
│   │   │   ├── getTorneoById.ts
│   │   │   └── getTournamentTeams.ts
│   │   ├── components/          # Componentes del módulo
│   │   │   ├── admin/          # Componentes para admin
│   │   │   └── *.tsx           # Componentes públicos
│   │   ├── types/              # TypeScript types
│   │   │   ├── index.ts
│   │   │   ├── fases.types.ts
│   │   │   └── tournament-teams.types.ts
│   │   └── index.ts            # Barrel export
│   │
│   ├── equipos/                  # Módulo de Equipos
│   │   ├── actions/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   └── public/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── jugadores/                # Módulo de Jugadores
│   │   ├── actions/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   └── *.tsx
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── partidos/                 # Módulo de Partidos
│   │   ├── actions/
│   │   │   ├── match.ts
│   │   │   ├── goals.ts
│   │   │   ├── cards.ts
│   │   │   └── referees.ts
│   │   ├── components/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── noticias/                 # Módulo de Noticias
│   │   ├── actions/
│   │   ├── components/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── arbitros/                 # Módulo de Árbitros
│   │   ├── actions/
│   │   ├── components/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── usuarios/                 # Módulo de Usuarios
│   │   ├── actions/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── notificaciones/          # Módulo de Notificaciones (S5)
│   │   ├── actions/             # campana, marcar leídas, preferencias
│   │   ├── components/          # NotificationBell/List/Row/Preferences
│   │   ├── lib/                 # relativeTime (puro)
│   │   ├── types/
│   │   └── index.ts
│   │
│   └── shared/                   # Utilidades compartidas
│       ├── utils/
│       ├── types/
│       └── hooks/
│
├── components/                   # Componentes globales compartidos
│   ├── ui/                      # Componentes UI (shadcn/ui)
│   ├── layout/                  # Header, Footer, etc.
│   ├── admin/                   # Componentes admin compartidos
│   ├── sections/                # Secciones de landing
│   ├── theme/                   # Theme provider
│   └── *.tsx                    # Componentes individuales
│
├── lib/                          # Utilidades core
│   ├── db.ts                    # Cliente Prisma
│   ├── utils.ts                 # Utilidades generales
│   ├── checkUser.ts             # Verificación de usuario
│   ├── formatDate.ts            # Formateo de fechas
│   └── notifications/           # Emisión de notificaciones (S5)
│       ├── catalog.ts           # puro: qué dice y adónde lleva cada una
│       ├── dispatch.ts          # notify() + destinatarios por rol
│       └── email.ts             # Resend (no-op sin RESEND_API_KEY)
│
├── prisma/                       # Base de datos
│   ├── schema.prisma            # Schema de la BD
│   ├── migrations/              # Migraciones
│   └── seeds/                   # Seeds
│
├── hooks/                        # React Hooks globales
├── docs/                         # Documentación
└── public/                       # Assets estáticos
```

## Convenciones de Nombres

### Archivos y Carpetas

- **Carpetas**: kebab-case (`tournament-teams`)
- **Componentes**: PascalCase (`TeamCard.tsx`)
- **Utilidades/Actions**: camelCase (`getTorneos.ts`)
- **Types**: camelCase con sufijo `.types.ts` o `index.ts`

### Imports con Alias

```typescript
// Módulos
import { getTorneos } from "@modules/torneos/actions/getTorneos";
import { ITorneo } from "@modules/torneos/types";

// Componentes globales
import { Button } from "@/components/ui/button";

// Utilidades
import { formatDate } from "@/lib/formatDate";
```

## Route Groups

### `(public)` - Páginas Públicas

- No afectan la URL
- Layout compartido con Header y Footer
- Accesibles sin autenticación

### `(admin)` - Panel de Administración

- URL: `/admin/*` (por convención de naming dentro del grupo)
- Layout con Sidebar y autenticación
- Requiere rol de administrador

## Módulos

Cada módulo es una unidad autocontenida que incluye:

1. **actions/**: Server Actions para comunicación con la BD
2. **components/**: Componentes React específicos del dominio
   - `admin/`: Componentes para el panel de administración
   - `public/`: Componentes para páginas públicas
3. **types/**: Interfaces y tipos TypeScript
4. **index.ts**: Barrel export para facilitar imports

### Ejemplo de uso de un módulo:

```typescript
// Importar desde el barrel export
import { getTorneos, ITorneo } from "@modules/torneos";

// O importar específicamente
import { getTorneos } from "@modules/torneos/actions/getTorneos";
import { ITorneo } from "@modules/torneos/types";
```

## Flujo de Datos

```
Usuario → Page Component → Server Action → Prisma → Base de Datos
                ↓
            API Route (para clientes externos)
```

## Tecnologías

- **Framework**: Next.js 14+ (App Router)
- **Autenticación**: Clerk
- **Base de Datos**: PostgreSQL + Prisma
- **UI Components**: shadcn/ui + Tailwind CSS
- **Tema**: next-themes (Dark/Light mode)
- **Validación**: Zod
- **Toasts (feedback inmediato de una acción)**: Sonner
- **Notificaciones (S5)**: modelo `Notification` + campana in-app + email por
  Resend. **No confundir con Sonner**: el toast le dice al que hizo clic que su
  acción salió; la notificación le avisa a *otra* persona que algo le pasó.
  Emisión: `notify()` de [lib/notifications](../lib/notifications/dispatch.ts).

## Migraciones (Prisma)

- **El timestamp de la carpeta es el orden de ejecución, no un dato cosmético.**
  Prisma aplica en orden lexicográfico del nombre. **Nunca antedatar una
  carpeta**: si una migración depende de otra (un tipo, una tabla), su nombre
  tiene que ordenar después, o el historial deja de poder replayearse desde cero
  y no se puede levantar un entorno nuevo. Pasó una vez (ver "Historial de
  migraciones irreproducible" en TODO.md) y no se detectó por meses, porque en
  la base real las migraciones se aplican **una sola vez y en el orden en que se
  escriben** — el defecto solo aparece al reconstruir desde cero.
- **Usar `migrate dev`, no solo `migrate deploy`.** `dev` replaya todo el
  historial en una shadow DB y detecta el problema antes de commitear; `deploy`
  solo aplica lo pendiente sobre la base real y **no lo detecta nunca**.
- **No editar una migración ya aplicada**: el checksum cubre el archivo entero
  (comentarios incluidos) y la base la rechaza como modificada.

## Mejores Prácticas

1. **Server Components por defecto**: Solo usar "use client" cuando sea necesario
2. **Server Actions para mutaciones**: Evitar API routes para operaciones internas
3. **Barrel exports**: Usar `index.ts` para exportar módulos
4. **Colocación**: Componentes específicos de página cerca de la página
5. **Tipos estrictos**: TypeScript strict mode habilitado

## Escalabilidad

Para agregar un nuevo módulo:

1. Crear carpeta en `modules/nuevo-modulo/`
2. Agregar subcarpetas: `actions/`, `components/`, `types/`
3. Crear `index.ts` con barrel exports
4. Agregar alias en `tsconfig.json` si es necesario
5. Crear rutas en `app/(public)/` y/o `app/(admin)/`
