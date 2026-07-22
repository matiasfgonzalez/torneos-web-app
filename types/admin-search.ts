/**
 * Contrato del buscador del command palette (F3).
 *
 * Vive acá y no dentro de `app/api/admin/search/route.ts` porque lo consume
 * `components/admin/CommandPalette.tsx`: código compartido no puede importar
 * desde `app/` (la dependencia va app → components, nunca al revés). La regla
 * ESLint `no-restricted-imports` de A1 lo hace cumplir.
 */
export interface AdminSearchResult {
  id: string;
  type: "tournament" | "team" | "player";
  title: string;
  subtitle?: string | null;
}
