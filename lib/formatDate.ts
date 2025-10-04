import { format, addHours } from "date-fns";
import { es } from "date-fns/locale";

export const formatDate = (
  dateString: string | Date,
  formato: string = "dd 'de' MMMM yyyy - HH:mm"
): string => {
  const fecha = new Date(dateString);
  const fechaAjustada = addHours(fecha, 3); // ⬅️ Sumar 3 horas

  const resultado = format(fechaAjustada, formato, {
    locale: es,
  });

  return resultado;
};

export const formatDateOk = (
  dateString: string | Date,
  formato: string = "dd 'de' MMMM yyyy - HH:mm"
): string => {
  const fecha = new Date(dateString);

  const resultado = format(fecha, formato, {
    locale: es,
  });

  return resultado;
};

export const formatDateTimeLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
