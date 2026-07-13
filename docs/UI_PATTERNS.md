# UI Patterns — plantillas de pantalla

> Cómo se componen pantallas completas a partir de los tokens ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)) y componentes ([COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md)) del proyecto. Cada patrón lista un ejemplo real del código para copiar la estructura, no reinventarla.

## 1. Página pública tipo listado/hub

> **F0 (2026-07-13):** el hero de este patrón ya es un componente — `<PageHero>` + `<HeroHighlight>` (`components/shared/PageHero.tsx`). Usalo en vez de copiar los blobs a mano; `app/(public)/torneos/page.tsx` es la referencia migrada. Los heros de jugadores/equipos/noticias/partidos siguen inline (migración en F2).

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

> **F0 (2026-07-13):** ambas variantes ya son un componente — `<PageHeader variant="showcase" | "simple">` (`components/shared/PageHeader.tsx`), con `breadcrumbs`/`quickStats`/`actions`. Referencia migrada: `app/admin/torneos/page.tsx`. Los KPIs debajo usan `<StatCard>`/`<StatCardGrid>`. El resto de las pantallas admin sigue inline (migración en F3).

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

```tsx
<Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl">
  <CardContent className="p-6">
    <div className="flex flex-col md:flex-row gap-4">
      Search input con ícono absoluto a la izquierda
      Select(s) de filtro
      botón "Limpiar" (solo visible si hay filtros activos) con contador de filtros activos en un Badge
    </div>
  </CardContent>
</Card>
```
Los filtros activos se muestran como chips (`Badge variant="secondary"` con `bg-[#ad45ff]/10 text-[#ad45ff]`) debajo del panel, cada uno idealmente removible individualmente (patrón en `FiltroTorneos.tsx`).

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

## 9. Paginación

Patrón numérico con máximo 5 números visibles + Anterior/Siguiente, en una `Card` propia debajo del listado. Referencia: `app/(public)/partidos/page.tsx`. Para tablas admin server-driven (pendiente, `TODO.md` M7) el patrón todavía no está definido — no inventar uno nuevo sin revisar ese ítem primero.

## 10. Auth (sign-in / sign-up)

Ambas rutas envuelven su formulario en `<div className="min-h-screen flex flex-col premium-gradient-bg"><Header isLogued={false}/><main className="flex-grow flex items-center justify-center p-4">...</main><Footer/></div>` — el formulario en sí (`GoogleSignIn`/`GoogleSignUp`) es un `glass-card` centrado, sin su propio wrapper de página. Si agregás un tercer flujo de auth (ej. recuperar contraseña), replicá esta estructura exacta.
