# Agent Rules — checklist obligatorio al tocar UI

> Para cualquier IA (o humano) que escriba o modifique interfaz en este proyecto. Estas reglas son la síntesis operativa de [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md) y [UI_PATTERNS.md](UI_PATTERNS.md) — leé esos tres antes de construir una pantalla nueva; usá esta lista para auto-revisarte antes de dar por terminada la tarea.

## Antes de escribir código

1. **Identificá el tipo de pantalla** (público listado / público detalle / admin listado variante A o B / admin detalle / diálogo / acción rápida mobile-first) y abrí el archivo de referencia más parecido de `UI_PATTERNS.md` §correspondiente. Copiá su estructura, no inventes una nueva salvo que ninguna encaje.
2. **Buscá si el componente que necesitás ya existe** (`COMPONENT_LIBRARY.md`) antes de crear uno — especialmente: loading, empty state, badge de estado, botón de marca, tabla, diálogo de confirmación. Un componente nuevo solo se justifica si de verdad no hay nada parecido.
3. **Buscá si el color de estado que necesitás ya está mapeado** (`*_STATUS_COLORS` en `lib/constants.ts` o el módulo de la entidad) antes de inventar uno inline.

## Reglas no negociables

- **Marca = tokens, no hex (F0, 2026-07-13):** en código nuevo la marca se escribe con los tokens `bg-brand`, `text-brand`, `from-brand via-brand-mid to-brand-2`, `shadow-brand/25`, `<Button variant="brand">` — nunca `#ad45ff` literal. Los hex quedan solo en archivos legacy no migrados (deuda M6); si tocás uno, migrá sus clases de marca de paso.
- **Marca vs. semántica:** el gradiente de marca es para elementos de marca (títulos, CTAs primarios, íconos destacados, barras de acento). Colores Tailwind nombrados (`green`, `red`, `amber`, `blue`, `gray`) son solo para semántica de estado. Nunca uses `violet-600`, `indigo-600`, `purple-500` u otro nombrado como si fuera la marca — es literalmente el bug que se corrigió en `app/admin/partidos/page.tsx` (2026-07-12).
- **Componentes compartidos primero (F0):** hero público → `<PageHero>`; header admin → `<PageHeader>`; KPI admin → `<StatCard>`; badge de estado → `<StatusBadge entity=... status=...>`; estado vacío → `<EmptyState>`; loading con forma conocida → `<SkeletonTable>`/`<SkeletonCards>`; confirmación destructiva → `<ConfirmDialog>`; **tabla del panel → `<DataTable>`**. Todos en `components/shared/` (ver COMPONENT_LIBRARY.md §2b) — no reescribas ese markup a mano.
- **Tabla admin = `<DataTable>` (F3).** Nunca una `<Table>` cruda en el panel, y nunca `overflow-x-auto` como "solución" de mobile: el DataTable ya trae orden, búsqueda, filtros, paginación, estado vacío y colapso a cards. Las opciones de un filtro de estado salen **del enum real** (`TOURNAMENT_STATUS_OPTIONS`, `PLAYER_STATUS_OPTIONS`, `MATCH_STATUS`), no de labels escritos a mano: comparar `"En curso"` contra `ACTIVO` era el bug que tenían torneos y jugadores (el filtro no matcheaba nunca y el badge caía siempre al caso `default`).
- **Ningún botón sin handler.** Antes de dar por buena una pantalla, verificá que cada botón haga algo: en el panel había un "Eliminar jugador" sin `onClick` (y sin endpoint DELETE detrás) y un "Programar primer partido" que no abría nada. Un botón que no hace nada es peor que no tener el botón.
- **No declares componentes dentro del render.** Las acciones de fila, celdas, etc. van como función de render (`const renderRowActions = (row) => …`) o como componente a nivel de módulo: un componente creado en cada render remonta su árbol entero (`react-hooks/static-components`).
- **Nada de `setState` síncrono en el cuerpo de un `useEffect`** (`react-hooks/set-state-in-effect`). Para el fetch inicial de una pantalla client: o el estado arranca ya en "cargando", o el fetch va dentro de `startTransition` y el pendiente hace de loading. Para estado derivado (resetear la página al filtrar): ajustá durante el render. Para leer de un sistema externo (`localStorage`, media queries): `useSyncExternalStore`.
- **Todo color necesita su par `dark:`.** Si escribís `bg-white`, `text-gray-900`, `border-gray-200`, etc., la línea de al lado (o la misma clase con `dark:`) tiene que existir. Una pantalla sin ninguna clase `dark:` es un bug, no una variante — fue el caso de `GoogleSignUp.tsx` y de todo `admin/arbitros` hasta 2026-07-12.
- **Contraste:** texto de color sobre fondo claro en `600`/`700` como mínimo, nunca `400`/`500` (falla WCAG AA). En dark mode sí se usa `300`/`400` sobre fondos `900/20`-`900/30`.
- **Mobile-first siempre.** Diseñá primero para ~375px de ancho, expandí con `sm:`/`md:`/`lg:`. Objetivos táctiles ≥44×44px en cualquier acción primaria táctil (steppers, botones de acción en cards).
- **Iconos:** solo Lucide (`lucide-react`). Nunca un emoji como ícono funcional/de navegación (sí como acento puntual en copy).
- **Sin datos mock ni endpoints fantasma.** Si una pantalla necesita datos, traelos de la fuente real (API/server action/Prisma) — nunca un array hardcodeado tipo `mockTournaments`, y nunca un filtro de UI que no está conectado a la lógica de filtrado real (verificá que cada `Select`/`Input` de filtro efectivamente se use en el `filter()`/query, no solo que exista visualmente). Fue exactamente el bug de `app/(public)/partidos/page.tsx` hasta 2026-07-12.
- **`AlertDialog` para toda acción destructiva o de alto impacto** (eliminar, suspender, rechazar) — nunca `confirm()`/`alert()` nativos en código nuevo.
- **Reusar antes que reimplementar.** Antes de escribir una nueva lógica de "goles"/"tarjetas"/"suspensión"/"pagos" en una pantalla nueva, revisá si ya existe un componente que la resuelve (ver el patrón de composición de `QuickMatchLoader.tsx`, que reusa `ManageGoals`/`ManageCards` en vez de reimplementarlos).
- **No dupliques un componente que ya tiene una versión "canónica" y una "legacy".** Si encontrás dos versiones de algo parecido (ej. `components/admin/match-dialog.tsx` vs `DialogAddEditMatch.tsx`), preguntate cuál importa la pantalla en la que estás — no crees una tercera.

## Antes de dar la tarea por terminada

1. `npx tsc --noEmit` limpio.
2. `npx eslint <archivos tocados>` sin errores nuevos (warnings preexistentes de `<img>`/`no-img-element` son aceptables, no los introduzcas de más si podés usar `next/image` sin fricción).
3. `npm run build` en verde.
4. Si es una pantalla nueva o muy modificada: levantar el dev server y verificar con `curl` (o navegador) que la ruta responde 200 y no tiene errores de consola/render. Las rutas `/admin/*` devuelven 401/404 con `curl` sin cookies de Clerk en dev — es esperado, no es un bug (el middleware las protege).
5. Repasá visualmente contra el checklist de accesibilidad del skill `ui-ux-pro-max` (contraste, touch targets, focus visible, reduced-motion) antes de reportar como hecho.
6. **Documentá cualquier hallazgo fuera de alcance en `TODO.md`** (regla ya establecida del proyecto) en vez de arreglarlo silenciosamente si toca una decisión de contenido/negocio (ej. fusionar dos versiones de un footer con contenido real distinto) — arreglalo directo solo si es un fix mecánico sin ambigüedad de contenido.

## Errores ya cometidos en este proyecto — no los repitas

Ver la sección "7. Errores conocidos ya corregidos" de `DESIGN_SYSTEM.md` para el detalle completo. Resumen:
- Clases CSS inventadas/huérfanas que no existen en ningún lado (`bg-golazo-*`).
- Tema oscuro forzado sin soporte real de light mode.
- Paleta ajena a la marca (`violet`/`indigo`/`zinc`/`amber` como color principal).
- Filtros de UI que no filtran nada de verdad.
- Datos mock hardcodeados en una pantalla que ya tiene una API real disponible.
- Dos componentes casi idénticos (ej. dos footers, dos `STATUS_BADGE`) que divergieron en color/contenido sin que nadie lo haya notado — si vas a crear algo que "ya debería existir", buscalo primero.
