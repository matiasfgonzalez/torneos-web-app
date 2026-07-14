/**
 * Fechas ↔ `<input type="date">` / `<input type="datetime-local">` (F3).
 *
 * Los inputs nativos hablan strings locales ("2026-07-14", "2026-07-14T20:30"),
 * nunca `Date`. Formatear con `toISOString().split("T")[0]` —lo que hacían los
 * formularios viejos— convierte a UTC y **corre el día** para cualquiera al
 * oeste de Greenwich: un partido del 14 a las 21:00 en Argentina se mostraba
 * como 15. Estas funciones trabajan siempre en hora local.
 */

const pad = (n: number) => String(n).padStart(2, "0");

const parse = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Date | ISO string → "2026-07-14" (hora local). "" si no hay fecha. */
export function toDateInput(value: string | Date | null | undefined): string {
  const date = parse(value);
  if (!date) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Date | ISO string → "2026-07-14T20:30" (hora local). "" si no hay fecha. */
export function toDateTimeInput(
  value: string | Date | null | undefined,
): string {
  const date = parse(value);
  if (!date) return "";
  return `${toDateInput(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Valor de un `datetime-local` → ISO para la API. `null` si está vacío.
 * (Los `type="date"` se mandan tal cual: los validadores Zod ya interpretan
 * "YYYY-MM-DD" como medianoche local — ver `lib/validators/tournament.ts`.)
 */
export function dateTimeInputToISO(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
