/**
 * "hace 5 min" / "ayer" / "12 mar" — el formato de una campana (S5).
 *
 * No usa `formatDate` (lib/formatDate.ts): esa fuerza UTC-3 porque los partidos
 * pasan a una hora concreta de Argentina. Acá lo que importa es **cuánto hace**,
 * y una resta de timestamps no tiene zona horaria.
 *
 * Puro y sin dependencias: se testea con dos fechas y nada más.
 */
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function relativeTime(
  value: string | Date,
  now: Date = new Date(),
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const diff = now.getTime() - date.getTime();

  // Futuro (reloj del cliente atrasado respecto del server): no se dice "hace
  // -2 minutos". Se trata como recién.
  if (diff < MINUTE) return "recién";

  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    return `hace ${mins} min`;
  }

  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return hours === 1 ? "hace 1 hora" : `hace ${hours} horas`;
  }

  const days = Math.floor(diff / DAY);
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;

  // Más de una semana: la fecha concreta dice más que "hace 23 días".
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}
