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

/**
 * Date | ISO string → "1995-03-05" leído en **UTC**. Para campos **date-only**
 * (fecha de nacimiento, alta): una fecha civil sin hora ni zona.
 *
 * Estos campos se guardan como medianoche UTC (el validador los parsea con
 * `z.coerce.date()`, que interpreta "1995-03-05" como `...T00:00:00Z` sin
 * importar la zona del server). Si se los formatea en hora local —como hace
 * `toDateInput`— al oeste de Greenwich sale el **día anterior**, y como el input
 * vuelve a guardarse, la fecha **pierde un día en cada guardado**. Leyéndolos en
 * UTC ↔ guardándolos en UTC, la fecha civil queda idéntica en cualquier zona.
 */
export function toDateOnlyInput(
  value: string | Date | null | undefined,
): string {
  const date = parse(value);
  if (!date) return "";
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
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
