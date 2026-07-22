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

**Ejemplos:** `modules/torneos/components/TournamentDetailView.tsx` (usado por `/torneos/[id]` y `/liga/[slug]/[torneo]`), `app/(public)/equipos/[id]/page.tsx`, `app/(public)/noticias/[id]/page.tsx`, `modules/partidos/components/MatchDetailView.tsx` (ficha de partido, `/partidos/[id]`), `app/(public)/jugadores/[id]/player-detail-page.tsx` (única excepción con tema propio "tarjeta de jugador" slate+partículas — deliberado, no migrarlo a `bg-gray-50`).

**Toda entidad pública tiene que ser linkeable.** Si una entidad se muestra en varios lugares (una card, un modal, una fila de tabla, un cuadro de eliminación), **todos** esos lugares llevan a su ficha — si no, la entidad no se puede compartir ni bookmarkear. La ficha de partido (2026-07-14) es la referencia: se llega desde el listado `/partidos`, la card de partido del equipo, el fixture y el bracket del torneo, el modal de detalle del torneo (que no tiene URL propia y por eso linkea a la ficha), los goles en la ficha del jugador y el panel. Un modal **nunca** reemplaza a la página: es un atajo, y siempre ofrece "ver ficha completa".

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

**El listado en sí va en `<DataTable>`** (`components/shared/DataTable.tsx`, F3) — ver §4 de COMPONENT_LIBRARY.md. La página aporta el `<PageHeader>` y los KPIs; el `DataTable` aporta la Card con búsqueda, filtros desplegables, orden, paginación, cards de mobile y estado vacío. No armes una `<Table>` a mano ni reimplementes la búsqueda/los filtros por fuera: la Card del DataTable ya los trae.

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

> **2026-07-22 — los filtros son desplegables, ya no chips.** `<FilterSelect>` + `<FilterGrid>` (`components/shared/FilterSelect.tsx`), con el estado en la **URL** (`useUrlFilters`, `hooks/use-url-filters.ts`). Referencia: `modules/torneos/components/FiltroTorneos.tsx`. Lo usan los 5 listados públicos (`/torneos`, `/equipos`, `/jugadores`, `/noticias`, `/partidos`) **y** el `DataTable` del panel.
>
> **Por qué cambió.** F2 (2026-07-13) los había puesto como chips y con pocas opciones funcionaba bien. Pero `/torneos` llegó a **14 categorías + 9 estados**: veintipico de píldoras siempre visibles que en el celular se comían la pantalla antes de que apareciera un solo resultado. Y la fila con scroll horizontal, que parecía la solución mobile, en realidad **escondía** opciones sin avisar que había más. El disparador ocupa una línea, dice cuál es el filtro activo sin abrirlo, y muestra las opciones recién cuando se las pide.

Estructura del panel:
```tsx
<Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl">
  <CardContent className="p-6 space-y-4">
    Search input con ícono absoluto a la izquierda
    <FilterGrid>                                    {/* apila en mobile, columnas en sm/lg */}
      <FilterSelect label="Estado" icon={...} value={...} onChange={...} options={[...]} />
    </FilterGrid>
    botón "Limpiar" (solo si hay filtros activos) con contador en un Badge
  </CardContent>
</Card>
```

Reglas:
- **Desplegable, no chips ni `<select>` nativo:** disparador de 44px (objetivo táctil) que muestra el valor activo, y `Popover` + `Command` con la lista. A partir de 8 opciones aparece un buscador dentro del panel — en 14 categorías, tipear "vet" gana a barrer con el ojo.
- **No declares `role="combobox"` en el disparador:** ese rol exige `aria-controls` apuntando a un listbox, y el panel es un diálogo de Radix. `PopoverTrigger` ya pone `aria-haspopup`/`aria-expanded`/`aria-controls` correctos; declararlo a mano los contradice.
- El ancho del panel sale de `w-(--radix-popover-trigger-width)`: en mobile no se sale de la pantalla ni queda desalineado.
- La primera opción es la neutra ("Todas"/"Todos"/"all"); el disparador se resalta con la marca solo cuando el valor **no** es esa.
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
5. Un registro deshabilitado tiene que **desaparecer de todo selector** donde se lo usaría (`/api/players` no devuelve deshabilitados; el formulario de inscripción filtra `enabled`). Deshabilitar sin sacarlo de los selectores no deshabilita nada.

## 8c. Deshacer una baja reversible (F4, 2026-07-14)

**Si el server puede deshacer la acción, la UI tiene que ofrecerlo** — y el copy tiene que decir la verdad sobre lo que pasa.

El DELETE de torneo siempre fue un **soft delete** (C7: escribe `deletedAt`, conserva partidos, goles y standings), pero el diálogo decía *"Esta acción no se puede deshacer. Se eliminará el torneo y todos sus datos"* y no había forma de recuperarlo salvo entrar a la base a mano. Dos errores en uno: asustaba con una consecuencia falsa y desperdiciaba una red de seguridad que ya existía.

El patrón (referencia: `modules/torneos/components/admin/DeleteTournamentButton.tsx`):

1. **Endpoint de restauración** que revierte exactamente lo que escribió el DELETE, con el mismo control de acceso (`POST /api/tournaments/[id]/restore`; espeja a `restoreReferee`).
2. **Toast con acción "Deshacer"** y `duration: 10000` — el default de 4s se va antes de que el usuario registre el error.
3. **Copy honesto** en la confirmación: qué se pierde, qué se conserva y que se puede restaurar.
4. Si la baja se hizo desde la ficha del propio recurso, pasá `redirectAfterDelete` (esa ruta deja de existir) — y el "Deshacer" devuelve a la ficha: deshacer es volver al estado anterior, también el de navegación.

Aplica a **toda baja reversible**. Una baja irreversible no lleva "Deshacer": lleva el copy que explica por qué (ver §8b).

## 9. Paginación

**Listados públicos:** patrón numérico con máximo 5 números visibles + Anterior/Siguiente, en una `Card` propia debajo del listado. Referencia: `app/(public)/partidos/page.tsx`.

**Tablas admin:** ya viene resuelta en `<DataTable>` (`pageSize`, default 10 — `0` la desactiva). Es en cliente; la página se acota **durante el render** cuando un filtro reduce el total, no con un `useEffect` + `setState`.

La paginación server-driven (`TODO.md` M7) se enchufa dentro del propio `DataTable`, con la misma API de columnas — no inventes un componente nuevo cuando llegue ese ítem.

## 10. Auth (sign-in / sign-up)

Ambas rutas envuelven su formulario en `<div className="min-h-screen flex flex-col premium-gradient-bg"><Header isLogued={false}/><main className="flex-grow flex items-center justify-center p-4">...</main><Footer/></div>` — el formulario en sí (`GoogleSignIn`/`GoogleSignUp`) es un `glass-card` centrado, sin su propio wrapper de página. Si agregás un tercer flujo de auth (ej. recuperar contraseña), replicá esta estructura exacta.

## 11. Formulario del panel → `FormSheet` (F3, 2026-07-14)

**Todo formulario de alta/edición del panel es un `<FormSheet>`** (`components/shared/form/FormSheet.tsx`): panel lateral en desktop, **pantalla completa en mobile**, con header y barra de acciones fijos (sticky) y solo el cuerpo scrolleando. Nunca más un `Dialog` centrado con 20 campos adentro y `max-h-[90vh] overflow-y-auto`: el botón "Guardar" quedaba fuera del viewport y había que scrollear hasta el fondo para encontrarlo.

```tsx
const form = useForm<TorneoFormValues>({
  resolver: zodResolver(torneoFormSchema),   // z de "@/lib/zod-locale" → mensajes en español
  defaultValues: isEditMode ? valuesFromTournament(t) : emptyValues(),
});

<FormSheet
  form={form}
  onSubmit={onSubmit}              // async: el loading sale de formState.isSubmitting
  open={open} onOpenChange={setOpen}
  trigger={<Button variant="brand">…</Button>}
  icon={Trophy} title="Crear torneo" description="…"
  submitLabel="Crear torneo"
  size="lg"                        // lg (2 columnas) | md (1 columna)
  draft={draft}                    // opcional: useFormDraft, solo en alta
>
  <FormSection icon={Trophy} title="Identidad">
    <TextField control={form.control} name="name" label="Nombre" required />
    <FieldRow>
      <SelectField … /><DateField … />
    </FieldRow>
  </FormSection>
</FormSheet>
```

Lo que resuelve una sola vez (no lo reimplementes por pantalla):

1. **Loading de submit**: sale de `formState.isSubmitting` — el `onSubmit` es `async` y react-hook-form lo maneja. Nada de un `useState(isLoading)` apagado a mano en un `finally`.
2. **Validación inline en español**: Zod 4 con locale `es` global (`lib/zod-locale.ts` → `z.config(z.locales.es())`). El esquema solo escribe `message` propio cuando el genérico no le dice al usuario **cómo** arreglar el campo. El error se muestra debajo del campo (`FormMessage`), el campo queda `aria-invalid` en rojo, el foco salta al primer inválido y el footer resume "Revisá los N campos marcados en rojo" con `role="alert"`.
3. **Guarda de cambios sin guardar**: cerrar con el formulario sucio (X, Escape, click afuera, Cancelar) abre un `<ConfirmDialog>` — nunca el `confirm()` nativo. Misma guarda en las páginas de edición que no son sheet (noticias, usuarios).
4. **Borradores** (`hooks/use-form-draft.ts`): autoguardado debounceado en `localStorage` y aviso "Tenés un borrador sin terminar" al reabrir. **Solo en altas**: en edición la fuente de verdad es la base, y un borrador viejo pisaría datos que pudo haber cambiado otra persona. Hoy lo usa el alta de torneo (25 campos).

**Campos** (`components/shared/form/fields.tsx`): `TextField`, `NumberField`, `DateField` (`withTime` para `datetime-local`), `TextareaField`, `SelectField`, `SwitchField`, `ImageField` (Cloudinary: recibe el campo de la URL y el del `publicId`), `ColorField`, más `FormSection` (agrupa campos relacionados) y `FieldRow` (2-3 columnas que colapsan a 1 en mobile). Todos: label con barra de acento de marca, alto 48px (objetivo táctil), par `dark:` completo y error inline. **No escribas un `<Input>` con clases a mano dentro de un formulario del panel.**

**Fechas**: viven en el estado del formulario como string (`"2026-07-14"`, `"2026-07-14T20:30"`), que es lo que hablan los inputs nativos, y se convierten al enviar con `lib/date-input.ts` (`toDateInput`/`toDateTimeInput`/`dateTimeInputToISO`). Formatear con `toISOString().split("T")[0]` —lo que hacían los formularios viejos— pasa a UTC y **corre el día** en Argentina.

Referencias: `modules/torneos/components/admin/DialogAddTournaments.tsx` (el más completo: 4 secciones + borrador), `modules/partidos/components/admin/MatchFormSheet.tsx` (campos condicionales según el estado del partido y datos que se traen de la API al elegir el torneo), `app/admin/arbitros/DialogReferee.tsx` (el más simple).

## 12. Navegación del panel: breadcrumbs y command palette (F3, 2026-07-14)

**Toda subpágina admin abre con `<Breadcrumbs>`** (`components/shared/Breadcrumbs.tsx`), no con un botón "Volver a X":

```tsx
<Breadcrumbs items={[
  { label: "Torneos", href: "/admin/torneos" },
  { label: tournamentData.name },        // último nivel: sin href
]} />
```

El nivel "Panel" lo agrega el componente. El último ítem es la página actual (`aria-current="page"`, sin link) y **dice cuál es el recurso, no el tipo de pantalla**: "Panel / Equipos / Racing", nunca "Detalle del Equipo" (lo que decía el pseudo-breadcrumb a mano de `modules/equipos/.../Header.tsx`). El link de la sección hace lo mismo que hacía el botón "Volver", más el contexto de dónde estás parado.

Están en las 6 subpáginas: detalle de torneo, detalle de equipo, detalle y edición de noticia, detalle y edición de usuario. **Excepción deliberada:** `/admin/partidos/[id]/cargar` conserva su "← Partidos" + badge del torneo — es el patrón §5 (acción rápida mobile-first) y ahí un breadcrumb competiría con el marcador sticky, que es lo único que importa en esa pantalla.

**Command palette:** `Ctrl/⌘+K` en cualquier pantalla del panel — busca torneos/equipos/jugadores por nombre y salta a secciones. Ver COMPONENT_LIBRARY §2c; al sumar una ruta admin no hay que tocarlo (sale de `adminNavItems`).
