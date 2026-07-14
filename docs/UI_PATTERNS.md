# UI Patterns — plantillas de pantalla

> Cómo se componen pantallas completas a partir de los tokens ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)) y componentes ([COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md)) del proyecto. Cada patrón lista un ejemplo real del código para copiar la estructura, no reinventarla.

## 1. Página pública tipo listado/hub

> **F0 (2026-07-13):** el hero de este patrón ya es un componente — `<PageHero>` + `<HeroHighlight>` (`components/shared/PageHero.tsx`). Usalo en vez de copiar los blobs a mano; `app/(public)/torneos/page.tsx` y `app/(public)/jugadores/page.tsx` son referencia migrada. Los heros de equipos/noticias/partidos siguen inline (pendiente).
>
> **F2 (2026-07-13):** las cards del grid ya son componentes — anatomía compartida vía `<EntityCard>`/`<EntityCardAvatar>` (`components/shared/EntityCard.tsx`: shell con esquinas, elevación en hover y barra de acento de marca; cada entidad decide su layout interno). Consumidores: `TournamentCard` (`modules/torneos/components/TournamentCard.tsx`, banner con logo superpuesto + badge de estado **sólido** — ver `TOURNAMENT_STATUS_SOLID_COLORS` en `lib/status-colors.ts`, excepción deliberada porque el badge suave pierde contraste sobre el banner), `TeamCard` (`modules/equipos/components/public/TeamCard.tsx`, avatar circular centrado) y `PlayerCard` (`modules/jugadores/components/public/PlayerCard.tsx`, con `variant="grid"|"list"` y `<StatusBadge entity="player">`). No repitas el markup de card a mano — importá el componente de la entidad; si aparece una cuarta entidad con card pública, componela sobre `<EntityCard>` igual que las tres anteriores.

**Ejemplos de referencia:** `app/(public)/torneos/page.tsx` + `modules/torneos/components/FiltroTorneos.tsx`, `app/(public)/jugadores/page.tsx`, `app/(public)/equipos/page.tsx`, `app/(public)/noticias/page.tsx`, `app/(public)/partidos/page.tsx`.

Estructura:
```
<div className="min-h-screen premium-gradient-bg">
  <section className="relative overflow-hidden py-20 lg:py-28">      {/* Hero */}
    blobs decorativos absolutos con blur-3xl
    badge con ícono + texto (bg-gradient-to-r de marca, rounded-full)
    <h1> con línea partida en <span> gradiente
    subtítulo descriptivo
    grid de 3-4 stat cards (ícono en caja gradiente + número grande + label)
  </section>
  <section className="py-16 lg:py-20">                                {/* Contenido */}
    panel de filtros: glass card con Search input + Select(s) + botón limpiar
    resultado: grid de Cards (o toggle grid/list) | loading spinner | EmptyState
    paginación si aplica
  </section>
</div>
```

Reglas:
- El hero SIEMPRE tiene blobs decorativos (`absolute ... rounded-full blur-3xl`, tonos `#ad45ff`/`#a3b3ff` al 15-20% opacidad) — no un hero plano.
- Los filtros derivan opciones de los **datos reales** cargados (ver `tournaments` derivado de `matches` en `app/(public)/partidos/page.tsx` tras la corrección de 2026-07-12) — nunca una lista hardcodeada tipo mock.
- El contador "X de Y resultados" siempre visible cerca del panel de filtros.

## 2. Página pública de detalle

**Ejemplos:** `modules/torneos/components/TournamentDetailView.tsx` (usado por `/torneos/[id]` y `/liga/[slug]/[torneo]`), `app/(public)/equipos/[id]/page.tsx`, `app/(public)/noticias/[id]/page.tsx`, `app/(public)/jugadores/[id]/player-detail-page.tsx` (única excepción con tema propio "tarjeta de jugador" slate+partículas — deliberado, no migrarlo a `bg-gray-50`).

Estructura:
```
<div className="min-h-screen bg-gray-50 dark:bg-gray-950">
  breadcrumb (texto pequeño, > entre niveles)
  header con imagen/logo + título + badges de estado + meta (fecha, ubicación)
  contenido: Tabs (si hay varias vistas: tabla/fixture/resultados/stats) o secciones apiladas
</div>
```

Si el recurso no existe: `notFound()` (Next) o una card de error con ícono `AlertTriangle`, mensaje y botón "Volver a X" con gradiente de marca (ver `app/admin/torneos/[id]/page.tsx` rama de "no encontrado" como referencia exacta a replicar).

## 3. Página admin tipo listado — dos variantes válidas

> **F0 (2026-07-13):** ambas variantes son un componente — `<PageHeader variant="showcase" | "simple">` (`components/shared/PageHeader.tsx`), con `breadcrumbs`/`quickStats`/`actions`. Los KPIs debajo usan `<StatCard>`/`<StatCardGrid>`; los títulos de sección, `<SectionTitle>`.
>
> **F3 (2026-07-13): TODAS las pantallas admin ya usan `<PageHeader>`** — no escribas el header a mano. Variante **showcase** (listados de gestión con volumen): torneos, equipos, jugadores, árbitros, partidos. Variante **simple** (cuenta/config/aprobaciones): plan, pagos, planes, organizaciones, configuración. El panel además **no tiene hex de marca**: todo usa los tokens (`from-brand`, `text-brand`, `<Button variant="brand">`).

**Variante A — "Sistema activo" (recomendada para entidades de gestión con volumen: torneos, equipos, jugadores, árbitros, partidos):**
```tsx
<div className="space-y-8 p-6 sm:p-8">
  <div className="relative">
    <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff]/5 to-[#a3b3ff]/5 dark:from-[#ad45ff]/10 dark:to-[#a3b3ff]/10 rounded-3xl -z-10" />
    <Card className="border-2 border-[#ad45ff]/20 dark:border-[#ad45ff]/30 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
      <CardContent className="p-6 sm:p-8">
        {/* ícono + <h1> gradiente + punto verde "Sistema activo · N registros" + descripción + quick-stats en píldoras + acción principal a la derecha */}
      </CardContent>
    </Card>
  </div>
  {/* StatsCards o grid de KPIs */}
  {/* Tabla o grid de contenido */}
</div>
```
Referencia exacta: `app/admin/torneos/page.tsx`, `app/admin/equipos/page.tsx`, `app/admin/jugadores/page.tsx`, `app/admin/arbitros/page.tsx`, `app/admin/partidos/page.tsx`.

**Variante B — header simple (para pantallas de cuenta/configuración: usuarios, plan, pagos, miembros, organizaciones, planes):**
```tsx
<div className="p-6 sm:p-8 space-y-8 max-w-5xl mx-auto">
  <div className="flex items-center gap-3">
    <div className="w-12 h-12 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-2xl flex items-center justify-center shadow-lg">
      <IconoLucide className="w-6 h-6 text-white" />
    </div>
    <div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">Título</h1>
      <p className="text-gray-600 dark:text-gray-300">Descripción</p>
    </div>
  </div>
  {/* contenido en Cards simples */}
</div>
```
Referencia: `app/admin/plan/page.tsx`, `app/admin/pagos/page.tsx`, `app/admin/organizaciones/OrganizacionesClient.tsx`, `app/admin/planes/PlanesClient.tsx`.

**Cuál elegir:** Variante A para listados de gestión de alto volumen con acción de "crear" prominente y quick-stats operativos. Variante B para pantallas más acotadas (configuración, cuenta, aprobaciones). Es una decisión ya tomada implícitamente por el código existente — replicá la variante de la pantalla más parecida a la que estás construyendo, no mezcles ambas en una misma pantalla. Unificar en un único patrón queda pendiente (`TODO.md` F3).

**El listado en sí va en `<DataTable>`** (`components/shared/DataTable.tsx`, F3) — ver §4 de COMPONENT_LIBRARY.md. La página aporta el `<PageHeader>` y los KPIs; el `DataTable` aporta la Card con búsqueda, filtros de chips, orden, paginación, cards de mobile y estado vacío. No armes una `<Table>` a mano ni reimplementes la búsqueda/los filtros por fuera: la Card del DataTable ya los trae.

**Cargar/refrescar los datos:** si el listado es client-side (`app/admin/arbitros`, `app/admin/noticias`, `TabsMatches`), el fetch inicial va en un `useEffect` **sin `setState` síncrono en el cuerpo** — o el estado arranca ya en "cargando" (`useState(true)`), o el fetch va envuelto en `startTransition` y el pendiente de la transición hace de loading. `react-hooks/set-state-in-effect` rechaza lo otro. Mientras carga: `<SkeletonTable>`, no un spinner de pantalla completa.

## 3b. Tabla admin en mobile

Una tabla de 6-12 columnas es ilegible en 375px, y el `overflow-x-auto` que había en varias pantallas escondía las acciones fuera del viewport. `DataTable` colapsa **automáticamente** a cards por debajo de `md`:

- Por defecto la card se arma con las columnas: la primera es el título, el resto van como pares etiqueta/valor. Sirve para tablas "de entidad" (equipos, jugadores, árbitros, noticias).
- Si la tabla es de **estadísticas** (muchas columnas numéricas), la card automática queda como una lista de 11 pares — ilegible. Ahí pasá `renderCard` con una card a medida: identidad arriba, números en una grilla compacta de chips, acciones abajo. Referencia: `TabsTeams.tsx` (equipos de un torneo: PJ/G/E/P/GF/GC en `grid-cols-6`, puntos destacados en el header de la card).
- Las acciones de fila se repiten en el footer de la card vía `rowActions` — nunca dejes una acción accesible sólo en la tabla de desktop.

## 4. Pantalla admin de detalle/edición de un recurso

**Ejemplos:** `app/admin/torneos/[id]/page.tsx` (+ `Header.tsx`, `QuickStats.tsx`, `TabsTournament.tsx`), `app/admin/equipos/[id]/page.tsx`, `app/admin/usuarios/[id]/page.tsx`.

Breadcrumb (Dashboard > Sección > Nombre del recurso) + header con datos del recurso + `QuickStats`-like row + `Tabs` para las distintas vistas del recurso (partidos/equipos/config, etc.).

## 5. Pantalla mobile-first de acción rápida (patrón nuevo, 2026-07-12)

**Ejemplo:** `app/admin/partidos/[id]/cargar/QuickMatchLoader.tsx` — carga de resultado de partido en una sola pantalla en vez del flujo largo de diálogos anidados.

Cuándo usarlo: una acción operativa **muy frecuente** que hoy requiere abrir 2+ diálogos/tabs para completarse. Patrón:
```
- Card superior "sticky" con el estado editable más importante (aquí: marcador) siempre visible mientras se scrollea
- Secciones relacionadas debajo, apiladas (no en tabs — todo visible con scroll, es "una pantalla")
- Steppers/controles táctiles ≥44px para edición numérica rápida
- Guardado explícito con botón (no autosave silencioso) + toast de confirmación
```
Reutilizá los componentes de formulario ya existentes (`ManageGoals`, `ManageCards`, etc.) en vez de reescribir su lógica — este patrón es de **composición**, no de reimplementación.

## 6. Panel de filtros (público y admin)

> **F2 (2026-07-13):** en los **listados públicos** los filtros ya no son `<Select>`/`<select>` — son **chips** (`<FilterChipGroup>`, `components/shared/FilterChips.tsx`) con el estado en la **URL** (`useUrlFilters`, `hooks/use-url-filters.ts`). Referencia: `modules/torneos/components/FiltroTorneos.tsx`. Los 5 listados (`/torneos`, `/equipos`, `/jugadores`, `/noticias`, `/partidos`) usan este patrón.

Estructura del panel:
```tsx
<Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl">
  <CardContent className="p-6 space-y-4">
    Search input con ícono absoluto a la izquierda
    <FilterChipGroup label="Estado" icon={...} value={...} onChange={...} options={[...]} />   {/* uno por dimensión */}
    botón "Limpiar" (solo si hay filtros activos) con contador en un Badge
  </CardContent>
</Card>
```

Reglas:
- **Chips, no selects:** en mobile scrollean en una sola fila horizontal (`overflow-x-auto scrollbar-hide`, patrón app deportiva) y en desktop hacen wrap. Cada chip mide 44px de alto (objetivo táctil mínimo) y expone `aria-pressed`; el grupo expone `role="group"` + `aria-label`.
- **Estado en la URL:** `useUrlFilters(DEFAULTS)` devuelve `{ values, setFilter, clearFilters, hasActiveFilters }`. Un filtro en su valor por defecto **no** aparece en la query (`/torneos`, no `/torneos?estado=Todos`). Usa `router.replace(..., { scroll: false })`: cambiar un filtro no salta al tope ni ensucia el historial, pero la búsqueda queda compartible/bookmarkeable y "atrás" deshace el último filtro.
- Las opciones se derivan de los **datos reales** (localidades/ciudades/autores/torneos presentes en el listado), nunca de una lista hardcodeada.
- Si el listado pagina, resetear a la página 1 al cambiar un filtro **ajustando el estado durante el render** (comparando una `filterKey` con la anterior), no con un `useEffect` + `setState` — el lint `react-hooks/set-state-in-effect` lo rechaza y provoca renders en cascada. Ver `app/(public)/partidos/page.tsx`.
- Los filtros activos se resumen además como chips-badge (`Badge variant="secondary"` con `bg-brand/10 text-brand`) en el header de resultados (patrón en `FiltroTorneos.tsx`).

## 7. Estado vacío (`EmptyState` — componente en `components/shared/EmptyState.tsx` desde F0)

> Usá `<EmptyState icon={...} title="..." description="..." action={...} />` en código nuevo; el markup de abajo es lo que el componente renderiza.

```tsx
<div className="text-center py-20">
  <div className="w-24 h-24 bg-gradient-to-br from-[#ad45ff]/10 to-[#a3b3ff]/10 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
    <IconoLucide className="h-12 w-12 text-gray-400" />
  </div>
  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">Título del estado vacío</h3>
  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">Explicación + qué hacer</p>
  {/* opcional: botón de acción con gradiente de marca */}
</div>
```
Usalo tanto para "sin resultados de búsqueda" (con botón "Limpiar filtros") como para "sin datos todavía" (con botón de acción creadora). El copy cambia según el caso — no reutilices el mismo texto para ambos.

## 8. Confirmación de acciones destructivas

`AlertDialog` **siempre** (nunca `confirm()` nativo en código nuevo) para: eliminar, suspender, rechazar. **Desde F0 usá `<ConfirmDialog>`** (`components/shared/ConfirmDialog.tsx`): trigger o modo controlado, tono `danger`/`warning`, `onConfirm` async con loading — referencia: eliminación de partido en `app/admin/partidos/page.tsx`. Estructura que implementa: ícono de advertencia en caja de color semántico + título "¿Acción X?" + descripción con el nombre del recurso afectado en negrita +, si corresponde, una advertencia extra sobre efectos secundarios (ver `app/admin/arbitros/page.tsx` — avisa si el árbitro tiene partidos asignados).

## 8b. Baja de una entidad con historial: eliminar vs. deshabilitar (2026-07-14)

Regla de negocio del proyecto, para **toda entidad que participe del historial deportivo** (jugador, equipo, torneo, árbitro):

- **Sin relaciones** (se cargó y nunca se usó) → **eliminar** de verdad. No hay historial que perder.
- **Con relaciones** → **nunca** eliminar: **deshabilitar** (`enabled = false`). Los datos y el historial se siguen viendo; lo que se pierde es poder *usarla* (sumar el jugador a un equipo, inscribir el equipo en un torneo nuevo).

No es una preferencia estética: las FK del schema son `onDelete: Cascade`, así que un borrado físico con historial se lleva puestos **goles, tarjetas, suspensiones y estadísticas de partidos ya jugados**, y deja la tabla de posiciones mintiendo.

Cómo se implementa (referencia: `modules/jugadores/actions/players.ts` y `modules/equipos/actions/teams.ts`):

1. El **listado del panel** trae el conteo de relaciones (`_count: { teamPlayer }` / `_count: { tournamentTeams }`) para que la UI sepa de antemano qué ofrecer.
2. La UI usa **`<DeleteOrDisableButtons>`** (`components/shared/DeleteOrDisableButtons.tsx`): un toggle habilitar/deshabilitar + un botón de baja cuyo diálogo cambia según el caso — con historial explica *por qué* no se puede eliminar y ofrece deshabilitar (tono `warning`, ícono `Archive`); sin historial ofrece eliminar (tono `danger`, ícono `Trash2`). Si ya está deshabilitado y tiene historial, ese segundo botón no se muestra: no hay nada que ofrecer.
3. El **server action vuelve a verificar** las relaciones antes de borrar. Nunca confíes en el conteo que mandó el cliente: pudo haber cargado la lista antes de que la entidad se usara.
4. Al borrar de verdad, limpiá también las **imágenes en Cloudinary** (`deleteImage(publicId)`), o quedan huérfanas. Si falla ese borrado remoto no revertimos el de la base.
5. Un registro deshabilitado tiene que **desaparecer de todo selector** donde se lo usaría (`/api/players` no devuelve deshabilitados; `tournament-team-form` filtra `t.enabled`). Deshabilitar sin sacarlo de los selectores no deshabilita nada.

## 9. Paginación

**Listados públicos:** patrón numérico con máximo 5 números visibles + Anterior/Siguiente, en una `Card` propia debajo del listado. Referencia: `app/(public)/partidos/page.tsx`.

**Tablas admin:** ya viene resuelta en `<DataTable>` (`pageSize`, default 10 — `0` la desactiva). Es en cliente; la página se acota **durante el render** cuando un filtro reduce el total, no con un `useEffect` + `setState`.

La paginación server-driven (`TODO.md` M7) se enchufa dentro del propio `DataTable`, con la misma API de columnas — no inventes un componente nuevo cuando llegue ese ítem.

## 10. Auth (sign-in / sign-up)

Ambas rutas envuelven su formulario en `<div className="min-h-screen flex flex-col premium-gradient-bg"><Header isLogued={false}/><main className="flex-grow flex items-center justify-center p-4">...</main><Footer/></div>` — el formulario en sí (`GoogleSignIn`/`GoogleSignUp`) es un `glass-card` centrado, sin su propio wrapper de página. Si agregás un tercer flujo de auth (ej. recuperar contraseña), replicá esta estructura exacta.
