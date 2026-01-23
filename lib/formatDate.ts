import { format } from "date-fns";
import { es } from "date-fns/locale";

// Offset de Argentina: UTC-3 (en milisegundos)
const ARGENTINA_OFFSET_MS = -3 * 60 * 60 * 1000;

/**
 * Convierte una fecha UTC a hora de Argentina (UTC-3)
 */
const toArgentinaTime = (date: Date): Date => {
  // Obtener el offset actual del navegador/servidor
  const localOffset = date.getTimezoneOffset() * 60 * 1000;
  // Convertir a UTC
  const utcTime = date.getTime() + localOffset;
  // Aplicar offset de Argentina
  return new Date(utcTime + ARGENTINA_OFFSET_MS);
};

/**
 * Formatea una fecha ajustándola a la zona horaria de Argentina (UTC-3)
 * Usar para fechas con hora (ej: partidos, eventos)
 */
export const formatDate = (
  dateString: string | Date,
  formato: string = "dd 'de' MMMM yyyy - HH:mm",
): string => {
  if (!dateString) {
    return "";
  }

  const fecha = new Date(dateString);
  const fechaArgentina = toArgentinaTime(fecha);

  const resultado = format(fechaArgentina, formato, {
    locale: es,
  });

  return resultado;
};

/**
 * Formatea una fecha sin ajustar zona horaria
 * Usar para fechas de solo día (ej: fecha de nacimiento)
 * Las fechas de nacimiento se guardan como YYYY-MM-DDT00:00:00.000Z
 * y al parsearlas el navegador las ajusta a la zona local, causando desfases
 */
export const formatDateOk = (
  dateString: string | Date,
  formato: string = "dd 'de' MMMM yyyy",
): string => {
  if (!dateString) {
    return "";
  }

  const fecha = new Date(dateString);

  // Para fechas de solo día (sin hora específica), compensar el desfase UTC
  // Esto evita que una fecha como "1990-05-15T00:00:00Z" se muestre como "14 de mayo"
  const utcDate = new Date(
    fecha.getUTCFullYear(),
    fecha.getUTCMonth(),
    fecha.getUTCDate(),
  );

  const resultado = format(utcDate, formato, {
    locale: es,
  });

  return resultado;
};

/**
 * Formatea una fecha para Argentina
 * @param includeTime - Si es true, ajusta la hora a Argentina. Si es false, usa fecha UTC.
 */
export const formatDateArgentina = (
  dateString: string | Date,
  formato: string = "dd 'de' MMMM yyyy",
  includeTime: boolean = false,
): string => {
  if (!dateString) {
    return "";
  }

  const fecha = new Date(dateString);

  // Si incluye hora, ajustar a Argentina
  if (includeTime) {
    const fechaArgentina = toArgentinaTime(fecha);
    return format(fechaArgentina, formato, { locale: es });
  }

  // Para fechas de solo día, usar UTC para evitar desfases
  const utcDate = new Date(
    fecha.getUTCFullYear(),
    fecha.getUTCMonth(),
    fecha.getUTCDate(),
  );

  return format(utcDate, formato, { locale: es });
};

export const formatDateTimeLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
