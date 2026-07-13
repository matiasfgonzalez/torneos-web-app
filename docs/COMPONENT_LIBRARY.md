# Component Library

> Cómo funciona cada componente compartido del proyecto y cuándo usar cada uno. Los tokens de color/tipografía viven en [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md); cómo se combinan estos componentes en pantallas completas vive en [UI_PATTERNS.md](UI_PATTERNS.md).

## 1. Primitivas shadcn/ui (`components/ui/*`)

Base Radix + `class-variance-authority`, ya instaladas y themeadas con los tokens de `app/globals.css` (`--primary`, `--card`, `--border`, etc.). **Siempre preferir estas sobre HTML plano** (`<select>`, `<button>` nativo) salvo un caso puntual ya existente (ej. los `<select>` nativos de `app/(public)/jugadores/page.tsx` — deuda menor, no lo repitas en código nuevo).

| Componente | Archivo | Notas |
|---|---|---|
| `Button` | `button.tsx` | Variantes: `default` (usa `--primary`, gris/negro neutro — **no** es el botón de marca), `destructive`, `outline`, `secondary`, `ghost`, `link` y **`brand`** (F0, 2026-07-13: gradiente de marca con hover y sombra — el botón primario de toda pantalla). Tamaños: `sm`/`default`/`lg`/`icon`. Para el botón primario de marca: `<Button variant="brand">` — no escribas más el gradiente a mano. |
| `Card` / `CardHeader` / `CardTitle` / `CardDescription` / `CardContent` | `card.tsx` | Contenedor base. Para el look "premium" agregale `border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl` (listados públicos) o `border-2 border-[#ad45ff]/20 dark:border-[#ad45ff]/30 shadow-xl bg-white/95 dark:bg-gray-800/95` (header decorativo admin, ver UI_PATTERNS.md). |
| `Badge` | `badge.tsx` | Variantes shadcn (`default`/`secondary`/`outline`/`destructive`) + casi siempre se le pasa `className` con el color semántico de la entidad (ver §3). |
| `Dialog` / `AlertDialog` | `dialog.tsx` / `alert-dialog.tsx` | `Dialog` para crear/editar, `AlertDialog` **siempre** para acciones destructivas (eliminar, suspender). No uses `confirm()` nativo del navegador en código nuevo — sí existe todavía en un par de lugares viejos (`app/admin/partidos/page.tsx` `handleDelete`), es deuda, no lo repitas. |
| `Select` | `select.tsx` | El contenido (`SelectContent`) se renderiza en un portal — no aparece en el HTML del primer render SSR, es normal, no es un bug si lo ves "vacío" en un `curl`/view-source. |
| `Table` / `TableHeader` / `TableRow` / `TableCell` | `table.tsx` | Ver convención de header/filas en §4. |
| `Input`, `Label`, `Textarea`, `Switch`, `Checkbox` | — | Estándar shadcn, respetan tema automáticamente. `Switch` usa `checked`/`onCheckedChange` (no `value`). |
| `Sheet` | `sheet.tsx` | Panel lateral — usado hoy solo en el sidebar mobile (`AdminSidebar`). Candidato para diálogos largos en mobile (ver TODO.md F3, pendiente). |
| `Avatar` / `AvatarImage` / `AvatarFallback` | `avatar.tsx` | `AvatarFallback` debe llevar `bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] text-white` con las iniciales — no dejar el gris default de shadcn. |
| `Skeleton` | `skeleton.tsx` | Usado en `MembersClient.tsx` como referencia de loading no-intrusivo (alternativa a `FullscreenLoading`, ver §5). |
| `Popover`, `Calendar` | — | Usados en selects de fecha puntuales. |
| `CloudinaryUpload` | `cloudinary-upload.tsx` | Ver §6. |
| `Sonner` (`toast`) | `sonner.tsx` | `import { toast } from "sonner"`. Es el único mecanismo de notificación transitoria del proyecto — no crear un sistema de alertas propio. `<Toaster />` ya está montado en `app/admin/layout.tsx`. |

## 2. Botón de marca

`<Button variant="brand">` (F0, 2026-07-13) — usa los tokens `from-brand to-brand-mid` con hover y `shadow-brand/25`. El patrón manual `bg-gradient-to-r from-[#ad45ff] to-[#c77dff] ...` que se repite en pantallas viejas es legacy: al tocar una, reemplazalo por la variant. `components/ui-dev/gradient-button.tsx` (`GradientButton`, usado en el `Header` público) sigue vivo para su caso.

## 2b. Componentes compartidos `components/shared/*` (F0, 2026-07-13)

**Buscá acá antes de escribir un header/hero/KPI/estado vacío a mano.** Todos usan los tokens de marca y respetan dark/light:

| Componente | Archivo | Uso |
|---|---|---|
| `PageHero` + `HeroHighlight` | `PageHero.tsx` | Hero de página pública tipo listado (patrón §1 de UI_PATTERNS): blobs + badge + título con palabra destacada + subtítulo + stats glass. Referencia: `app/(public)/torneos/page.tsx`. |
| `PageHeader` | `PageHeader.tsx` | Header admin. `variant="showcase"` (default) = "Sistema activo" con Card decorativa (listados de gestión); `variant="simple"` = ícono + título (pantallas de cuenta/config). Soporta `breadcrumbs`, `quickStats`, `actions`. Referencia: `app/admin/torneos/page.tsx`. |
| `StatCard` + `StatCardGrid` | `StatCard.tsx` | KPI del panel admin — reemplazó las 3 implementaciones duplicadas de StatsCards (torneos/equipos/jugadores usan esto internamente). |
| `StatusBadge` | `StatusBadge.tsx` | Ver §3. |
| `EmptyState` | `EmptyState.tsx` | Estado vacío estándar (patrón §7 de UI_PATTERNS). |
| `SkeletonTable` / `SkeletonCards` | `Skeletons.tsx` | Loading que preserva layout para tablas y grids de cards. |
| `ConfirmDialog` | `ConfirmDialog.tsx` | Confirmación de acciones destructivas (patrón §8). Modo trigger o controlado (`open`/`onOpenChange` — necesario si el disparador vive en un `DropdownMenu`). Soporta `onConfirm` async con loading. Referencia: `app/admin/partidos/page.tsx`. |

## 3. `StatusBadge` — mapas de color por entidad

**Componente único** (F0, 2026-07-13): `<StatusBadge entity="tournament" | "match" | "player" | "user" | "payment" | "referee" status={...} />` (`components/shared/StatusBadge.tsx`) — resuelve label en español + color del mapa único. Los mapas viven en [lib/status-colors.ts](../lib/status-colors.ts) (formato "badge suave con borde", el de REFEREE_STATUS_COLORS). Si falta un estado/entidad: agregalo ahí, nunca inline.

Historial — cada entidad resolvía su color de una de estas dos formas (legacy, migrar al tocar):

**a) Mapa centralizado exportado** (patrón preferido para código nuevo):
- `PLAYER_STATUS_COLORS` y `FOOT_COLORS` — `lib/constants.ts`. Estilo "punto/badge sólido": `bg-{color}-500` + texto blanco (pensado para un dot de 3-4px o un badge muy pequeño, no para texto largo — a ese tamaño el contraste con blanco siempre es correcto sin importar el tema).
- `REFEREE_STATUS_COLORS` — `modules/arbitros/types/index.ts`. Estilo "badge suave con borde": `bg-{color}-50 text-{color}-700 border-{color}-200 dark:bg-{color}-500/20 dark:text-{color}-400 dark:border-{color}-500/30` (el patrón correcto para badges de tabla/detalle — replicalo tal cual para entidades nuevas).

**b) Función local `getStatusColor`/`getStatusBadge` dentro del componente** (patrón heredado, aceptar pero no expandir): torneo (`FiltroTorneos.tsx` `statusColors`, `TournamentDetailView.tsx` `getStatusColor` para `MatchStatus`), partido (`app/admin/partidos/page.tsx` `getStatusBadge`, `app/(public)/partidos/page.tsx` `getStatusColor`), noticia (`app/admin/noticias/page.tsx` `getStatusBadge` para published/borrador), pago (`STATUS_BADGE` const en `app/admin/pagos/page.tsx` y `app/admin/plan/page.tsx`, duplicado — mismo objeto en dos archivos, no lo dupliques una tercera vez).

Si necesitás el color de un estado que no está en ningún mapa: agregalo al mapa centralizado más cercano (o creá uno nuevo siguiendo el formato REFEREE_STATUS_COLORS), no lo hardcodees inline en el JSX.

## 4. Tablas admin (patrón)

```tsx
<div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
  <Table>
    <TableHeader>
      <TableRow className="bg-gray-50 dark:bg-gray-900/50 ...">
        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">...</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50">...</TableRow>
    </TableBody>
  </Table>
</div>
```

Fila vacía: `<TableCell colSpan={N} className="text-center py-16">` con ícono grande en círculo + texto (ver patrón EmptyState en UI_PATTERNS.md).

## 5. Sistemas de loading (dos, con roles distintos — no crear un tercero)

| Componente | Archivo | Cuándo |
|---|---|---|
| `FullscreenLoading` | `components/fullscreen-loading.tsx` | Loading **de página completa**, con branding fuerte (logo GOLAZO animado, partículas, fondo oscuro `#0f051a→#1a0a2e` fijo — este componente sí es intencionalmente oscuro siempre, es una pantalla de marca tipo splash, no una superficie de contenido). Se usa como `{loading && <FullscreenLoading isVisible message="..." />}` al inicio de una página que todavía no tiene ningún layout que mostrar. |
| `LoadingSpinner` / `LoadingCard` / `LoadingPage` | `components/loading-spinner.tsx` | Loading **inline/parcial**, usa tokens de tema (`text-primary`, `text-muted-foreground`) — se adapta a light/dark automáticamente. `LoadingPage` para reemplazar el contenido de un `<Suspense>` o de una sección; `LoadingCard` dentro de un `Card`; `LoadingSpinner` para un spinner suelto. |
| `Skeleton` (shadcn) | `components/ui/skeleton.tsx` | Loading que **preserva el layout** (evita el salto de contenido) — preferible a los dos anteriores cuando se conoce la forma final del contenido (listas, tablas). Referencia: `MembersClient.tsx`. |

Regla: página nueva que carga datos client-side → `Skeleton` si conocés la forma del contenido, si no `LoadingPage`. `FullscreenLoading` solo para el arranque de una página entera sin nada más que mostrar (patrón heredado, usarlo con moderación — no es accesible con `prefers-reduced-motion`, pendiente en TODO F1).

## 6. `CloudinaryUpload`

`components/ui/cloudinary-upload.tsx`. Props: `folder` (string, ej. `"torneos/logos"` — **debe** estar en `ALLOWED_UPLOAD_FOLDERS`, `types/cloudinary.ts`, al agregar una entidad nueva con imágenes), `value`/`publicId` (estado controlado), `onChange(url, publicId)` (la forma más simple de integrarlo a un form), `onUploadComplete`/`onError` (callbacks alternativos), `placeholder`. Es el único mecanismo de subida de imágenes del proyecto — no uses un `<input type="file">` suelto.

## 7. Layout y navegación

- `components/layout/header.tsx` (`Header`) / `components/layout/footer.tsx` (`Footer`) — Header/Footer públicos. **Unificados en F2 (2026-07-13):** el Header muestra las MISMAS secciones en todas las páginas (Torneos/Partidos/Equipos/Jugadores/Noticias desde `lib/constants/navigation.ts` `siteLinks`; anónimos suman "Precios" → `/#precios`, logueados suman "Mi Panel"/"Mi Perfil"), con indicador de sección activa por ruta (`usePathname`). Prop única: `isLogued?: boolean` (`isLandingPage` fue eliminado — no agregar menús por página). El Footer comparte `siteLinks` y tiene variante clara/oscura real. **Toda página pública nueva debe envolverse en `<Header/>...<Footer/>`** salvo que ya esté dentro de `app/(public)/layout.tsx` (que ya los incluye — confirmá si tu ruta cae bajo el route group `(public)` antes de agregarlos a mano; `sign-in`/`sign-up`/`crear-liga` están fuera del route group y sí los agregan explícitamente).
- `components/admin/sidebar.tsx` (`AdminSidebar`) — sidebar del panel admin, ya filtra ítems por rol (`roles: ["ADMINISTRADOR"]` o `["ADMINISTRADOR","USUARIO"]`). Agregar una ruta admin nueva = agregar un objeto a `menuItems` con `title`/`href`/`icon` (Lucide)/`roles`. No crear una navegación paralela.
- `components/ThemeToggle.tsx` — selector claro/oscuro/sistema, ya montado en `app/admin/layout.tsx` y en el `Header` público. No dupliques el toggle en una página nueva.
- `components/ui-dev/gradient-text.tsx` (`GradientText`) — `<GradientText>texto</GradientText>` envuelve en `bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent`. Preferible a escribir el gradiente a mano para texto corto (logo, palabra destacada en un título).

## 8. Componentes legacy duplicados — no usar para código nuevo

Ver `TODO.md` ítem A1 (pendiente): `components/admin/match-dialog.tsx` es un duplicado más viejo de `app/admin/torneos/[id]/components/DialogAddEditMatch.tsx`. Ambos siguen vivos (usados por rutas distintas: `/admin/partidos` usa `MatchDialog`, `/admin/torneos/[id]` usa `DialogAddEditMatch`) — no son intercambiables todavía porque tienen features distintas. Si tocás la carga de partidos, confirmá cuál de los dos importa la pantalla en la que estás antes de copiar patrones de uno al otro.
