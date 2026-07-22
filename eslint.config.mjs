// Flat config nativa de eslint-config-next 16.2+ (el puente FlatCompat
// anterior rompe con "Converting circular structure to JSON").
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Anti-regresión de código duplicado (A1).
 *
 * A1 borró árboles de componentes que estaban duplicados **byte a byte** entre
 * `app/admin/*` y `modules/*`, y dos copias de los utils. Nada impedía que
 * volvieran a aparecer: TypeScript compila igual un import a una copia nueva.
 * Estos patrones fijan las decisiones que se tomaron entonces.
 */
const duplicatePatterns = [
  {
    // Utils: el canónico quedó en `lib/` (convención ShadCN `@/lib/utils` +
    // ~80 imports existentes). `modules/shared/utils/*` se borró en A1 por
    // duplicar `lib/` — y su `formatDate` tenía además un bug de timezone.
    group: ["@modules/shared/utils/*", "@/modules/shared/utils/*"],
    message:
      "Los utils compartidos viven en `lib/` (A1). Importá desde `@/lib/...` — `modules/shared/utils` se borró por estar duplicado.",
  },
  {
    // Componentes de gestión: la fuente única es `modules/*/components/admin`.
    // Cubre `app/admin/<seccion>/components/*`, que es donde estaban las copias
    // que A1 eliminó (jugadores, torneos).
    //
    // NO alcanza a los componentes colocados de una página con segmento
    // dinámico (`app/admin/torneos/[id]/components/*`): `*` no cruza la barra,
    // así que el reuso deliberado de `QuickMatchLoader` (ManageGoals /
    // ManageCards) sigue siendo válido.
    group: ["@/app/admin/*/components/*"],
    message:
      "Los componentes del panel viven en `modules/<entidad>/components/admin` (A1, docs/ARQUITECTURA.md). No importes una copia bajo `app/`.",
  },
];

/**
 * Dirección de dependencias: `app/` (rutas) importa de `modules/`,
 * `components/`, `lib/` y `hooks/`. **Nunca al revés.** Un componente
 * compartido que importa de una ruta deja de ser reutilizable, y ese es el
 * primer paso hacia tenerlo duplicado — el problema que A1 vino a cerrar.
 */
const layeringPattern = {
  group: ["@/app/*", "@/app/**"],
  message:
    "El código compartido (`modules/`, `components/`, `lib/`, `hooks/`) no puede importar desde `app/`: la dependencia va app → compartido, nunca al revés (A1). Si necesitás un tipo que hoy vive en una ruta, movelo a `types/`.",
};

// ESLint NO fusiona la config de una misma regla: el último bloque que la
// declara reemplaza al anterior. Por eso el bloque de código compartido repite
// los patrones de duplicados en vez de apoyarse en el global — si solo llevara
// el de capas, dentro de `modules/` dejaría de detectarse el import a los utils
// borrados (pasó, y lo agarró la prueba de la regla).
const restricted = (patterns) => ({
  "no-restricted-imports": ["error", { patterns }],
});

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    name: "golazo/no-duplicados",
    rules: restricted(duplicatePatterns),
  },
  {
    name: "golazo/capas",
    files: ["modules/**", "components/**", "lib/**", "hooks/**"],
    rules: restricted([...duplicatePatterns, layeringPattern]),
  },
];

export default eslintConfig;
