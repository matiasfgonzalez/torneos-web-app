# Design System — "Premium Golazo"

> Fuente de verdad del sistema visual. Extraído del código ya consistente (2026-07-12) — no es aspiracional, es lo que ya existe y se debe replicar. Para componentes concretos ver [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md); para cómo se arman pantallas completas ver [UI_PATTERNS.md](UI_PATTERNS.md); para el checklist obligatorio al escribir UI ver [AGENT_RULES.md](AGENT_RULES.md).

## 1. Paleta de marca

- **Gradiente principal:** `#ad45ff → #a3b3ff` (violeta a lila-azulado). Con un tercer stop opcional `#c77dff` para gradientes de 3 puntos (`from-[#ad45ff] via-[#c77dff] to-[#a3b3ff]`), usado en títulos hero, barras de acento e íconos destacados.
- **Nunca** usar paletas Tailwind nombradas (`violet-600`, `indigo-600`, `amber-400`, etc.) como color primario/de marca de una pantalla — son los hex de arriba, no un accesorio. Los colores nombrados de Tailwind sí se usan, y solo se usan, para **semántica de estado** (ver §4).
- El gradiente de marca vive hardcodeado como literal hex en casi todo el código (`93 archivos` según auditoría previa) en vez de una variable CSS — es deuda técnica conocida (ver `TODO.md` M6), no lo dupliques a mano si podés usar las utilidades de §2 o `<GradientText>` / `<Badge>` de marca (ver COMPONENT_LIBRARY.md).

## 2. Utilidades CSS (`app/globals.css`)

| Clase | Definición | Uso |
|---|---|---|
| `.premium-gradient-bg` | `bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950/30` | Fondo de página. Páginas públicas tipo listado/hub (torneos, equipos, jugadores, noticias, partidos, crear-liga) y el layout admin completo (`app/admin/layout.tsx` ya lo aplica a todas las páginas admin). |
| `.glass-card` | `bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-xl` | Cards flotantes sobre el gradiente: perfil, sign-in/sign-up, tarjetas destacadas. |
| `.glass-header` | `bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-white/20 dark:border-white/10` | Headers sticky (usado en `app/admin/layout.tsx`). |
| `.premium-gradient-text` | `bg-clip-text text-transparent bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff]` | Atajo para texto con gradiente cuando no se usa `<GradientText>`. |
| `.premium-shadow` / `.golazo-shadow` | sombra tintada `rgba(173, 69, 255, ...)` | Elementos flotantes que necesitan un glow de marca sutil. |
| `.animate-fade-in` / `.animate-slide-up` / `.animate-scale-in` | keyframes de entrada | Transiciones de aparición de contenido. |

**Fondo del panel admin:** `app/admin/layout.tsx` ya envuelve **todas** las páginas admin en `premium-gradient-bg`. Las páginas hijas normalmente **no declaran su propio fondo**. Si una página necesita un fondo propio (poco común), debe usar el mismo patrón `bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/50` para no generar un fondo en conflicto con el del layout.

**Páginas de detalle** (torneo/equipo/noticia individual, tanto públicas como admin) usan un fondo neutro `bg-gray-50 dark:bg-gray-950` en vez del gradiente — es un sub-patrón válido para contenido denso (tablas, tabs, texto largo), no un error. No migrarlas a `premium-gradient-bg`.

## 3. Tipografía y espaciado

- Hero público: `text-5xl lg:text-7xl font-extrabold`, subtítulo `text-xl lg:text-2xl text-gray-600 dark:text-gray-300`.
- Título de sección admin: `text-3xl sm:text-4xl font-bold` con gradiente de marca.
- Secciones públicas: `py-16 lg:py-20` (el hero un poco más, `py-20 lg:py-28`); contenedor `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- Cards: `p-6` estándar. Diálogos: `p-5` por bloque de sección interna.
- Radios: `rounded-xl` para inputs/botones/badges chicos, `rounded-2xl` para cards y diálogos, `rounded-3xl` solo en elementos hero muy grandes.

## 4. Color semántico de estado (no de marca)

Usar SIEMPRE colores Tailwind nombrados con **par claro/oscuro explícito** — nunca un tono suelto sin `dark:`, y nunca un tono `-400`/`-500` como texto sobre fondo blanco (falla contraste AA):

```
Éxito/activo:     bg-green-50  text-green-700  border-green-200   dark:bg-green-900/20  dark:text-green-300  dark:border-green-800
Alerta/pendiente: bg-amber-50  text-amber-700  border-amber-200   dark:bg-amber-900/20  dark:text-amber-300  dark:border-amber-800
Error/peligro:    bg-red-50    text-red-700    border-red-200     dark:bg-red-900/20    dark:text-red-300    dark:border-red-800
Info/neutro:      bg-blue-50   text-blue-700   border-blue-200    dark:bg-blue-900/20   dark:text-blue-300   dark:border-blue-800
Inactivo/gris:    bg-gray-50   text-gray-600   border-gray-200    dark:bg-gray-500/20   dark:text-gray-400   dark:border-gray-500/30
```

Cada entidad con estado tiene su propio mapa de colores en `lib/constants.ts` o en su módulo (`modules/*/types`) — ver COMPONENT_LIBRARY.md §"StatusBadge" para la lista completa. Antes de inventar un color nuevo, revisá si la entidad ya tiene un mapa (`*_STATUS_COLORS`).

## 5. Iconografía

Lucide React exclusivamente (`lucide-react`). Contenedor de ícono destacado: `p-2` a `p-3`, `rounded-lg`/`rounded-xl`, `bg-gradient-to-br from-[#ad45ff] to-[#c77dff]`, ícono `text-white`. Nunca emojis como ícono estructural/de navegación (sí como acento puntual dentro de copy, ej. "✨ Lo que obtienes gratis", "¡Bienvenido! 👋" — uso decorativo en texto, no como reemplazo de un ícono funcional).

## 6. Accesibilidad y modo oscuro (no negociable)

- Toda clase de color (`bg-*`, `text-*`, `border-*`) que no sea un token semántico de shadcn (`bg-card`, `text-muted-foreground`, etc.) necesita su contraparte `dark:`. Una pantalla que se ve "siempre oscura" o "siempre clara" sin importar el toggle es un bug, no una variante de diseño.
- Texto de color sobre fondo claro: tono `600`-`700` mínimo. En dark mode: `300`-`400` sobre fondos `900/20`-`900/30`.
- Focus visible en todo elemento interactivo (heredado de shadcn — no lo remuevas con `outline-none` sin agregar un reemplazo).
- Objetivo táctil mínimo 44×44px en acciones primarias de mobile (ver el patrón de steppers en `app/admin/partidos/[id]/cargar/QuickMatchLoader.tsx`).

## 7. Errores conocidos ya corregidos (no reintroducir)

- `app/(public)/partidos/page.tsx` usaba clases `bg-golazo-green`/`text-golazo-black`/`text-golazo-gray` que **no existen** en `globals.css` ni en la config de Tailwind (huérfanas de un diseño anterior). Corregido a `premium-gradient-bg` + marca real (2026-07-12).
- `app/admin/arbitros/page.tsx` y `DialogReferee.tsx` forzaban un tema oscuro permanente (`bg-slate-900` sin `dark:`) que rompía el toggle claro/oscuro del resto del panel. Corregido a light/dark adaptativo (2026-07-12).
- `app/admin/partidos/page.tsx` usaba `zinc-900`/`violet-600`/`indigo-600` en vez de la marca, también forzando oscuro. Corregido (2026-07-12).
- `app/sign-up/[[...sign-up]]/GoogleSignUp.tsx` no tenía ninguna clase `dark:` (a diferencia de su gemela `GoogleSignIn.tsx`) y el `page.tsx` no incluía `Header`/`Footer`. Corregido (2026-07-12).
- `REFEREE_STATUS_COLORS` (`modules/arbitros/types/index.ts`) usaba tonos `-400` sin variante clara (bajo contraste sobre blanco). Corregido a pares `-50/-700` claro + `-500/20/-400` oscuro (2026-07-12).
