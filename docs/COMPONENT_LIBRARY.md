# Component Library

> Cómo funciona cada componente compartido del proyecto y cuándo usar cada uno. Los tokens de color/tipografía viven en [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md); cómo se combinan estos componentes en pantallas completas vive en [UI_PATTERNS.md](UI_PATTERNS.md).

## 1. Primitivas shadcn/ui (`components/ui/*`)

Base Radix + `class-variance-authority`, ya instaladas y themeadas con los tokens de `app/globals.css` (`--primary`, `--card`, `--border`, etc.). **Siempre preferir estas sobre HTML plano** (`<select>`, `<button>` nativo) salvo un caso puntual ya existente (ej. los `<select>` nativos de `app/(public)/jugadores/page.tsx` — deuda menor, no lo repitas en código nuevo).

| Componente | Archivo | Notas |
|---|---|---|
| `Button` | `button.tsx` | Variantes: `default` (usa `--primary`, gris/negro neutro — **no** es el botón de marca), `destructive`, `outline`, `secondary`, `ghost`, `link`. Tamaños: `sm`/`default`/`lg`/`icon`. **Para el botón primario de marca** no uses `variant="default"` — aplicá manualmente `bg-gradient-to-r from-[#ad45ff] to-[#c77dff] hover:from-[#9c3ee6] hover:to-[#b66de6] text-white shadow-lg shadow-[#ad45ff]/25 rounded-xl` (es el patrón repetido en todo el código, no hay una variant `brand` todavía — candidato a `buttonVariants` extra en F0). |
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

## 2. Botón de marca (patrón, no componente)

No existe todavía un `<GradientButton variant="brand">` reutilizable a nivel `components/ui`. El patrón se repite a mano en cada pantalla:

```tsx
<Button className="bg-gradient-to-r from-[#ad45ff] to-[#c77dff] hover:from-[#9c3ee6] hover:to-[#b66de6] text-white shadow-lg shadow-[#ad45ff]/25 rounded-xl px-6">
  <IconoLucide className="mr-2 h-4 w-4" />
  Texto de acción
</Button>
```

Existe `components/ui-dev/gradient-button.tsx` (`GradientButton`) usado en el `Header` público — revisalo antes de escribir el patrón a mano si estás en una página pública; en admin todavía no se adoptó, se sigue escribiendo la clase completa.

## 3. `StatusBadge` — mapas de color por entidad

No hay un único componente `<StatusBadge entity="tournament" status={...}>` (documentado como pendiente en TODO.md F0). Hoy cada entidad resuelve su color de una de estas dos formas — **revisá si ya existe antes de inventar un color nuevo**:

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

- `components/layout/header.tsx` (`Header`) / `components/layout/footer.tsx` (`Footer`) — Header/Footer públicos. Props de `Header`: `isLogued?: boolean`, `isLandingPage?: boolean` (controla si se muestran los links de ancla `#seccion`, solo válidos en la landing). **Toda página pública nueva debe envolverse en `<Header/>...<Footer/>`** salvo que ya esté dentro de `app/(public)/layout.tsx` (que ya los incluye — confirmá si tu ruta cae bajo el route group `(public)` antes de agregarlos a mano; `sign-in`/`sign-up`/`crear-liga` están fuera del route group y sí los agregan explícitamente).
- `components/admin/sidebar.tsx` (`AdminSidebar`) — sidebar del panel admin, ya filtra ítems por rol (`roles: ["ADMINISTRADOR"]` o `["ADMINISTRADOR","USUARIO"]`). Agregar una ruta admin nueva = agregar un objeto a `menuItems` con `title`/`href`/`icon` (Lucide)/`roles`. No crear una navegación paralela.
- `components/ThemeToggle.tsx` — selector claro/oscuro/sistema, ya montado en `app/admin/layout.tsx` y en el `Header` público. No dupliques el toggle en una página nueva.
- `components/ui-dev/gradient-text.tsx` (`GradientText`) — `<GradientText>texto</GradientText>` envuelve en `bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent`. Preferible a escribir el gradiente a mano para texto corto (logo, palabra destacada en un título).

## 8. Componentes legacy duplicados — no usar para código nuevo

Ver `TODO.md` ítem A1 (pendiente): `components/admin/match-dialog.tsx` es un duplicado más viejo de `app/admin/torneos/[id]/components/DialogAddEditMatch.tsx`. Ambos siguen vivos (usados por rutas distintas: `/admin/partidos` usa `MatchDialog`, `/admin/torneos/[id]` usa `DialogAddEditMatch`) — no son intercambiables todavía porque tienen features distintas. Si tocás la carga de partidos, confirmá cuál de los dos importa la pantalla en la que estás antes de copiar patrones de uno al otro.
