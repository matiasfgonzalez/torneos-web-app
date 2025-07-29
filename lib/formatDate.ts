import { format, addHours } from "date-fns";
import { es } from "date-fns/locale";

export const formatDate = (
    dateString: string | Date,
    formato: string = "dd 'de' MMMM yyyy - HH:mm"
): string => {
    const fecha = new Date(dateString);
    const fechaAjustada = addHours(fecha, 3); // ⬅️ Sumar 3 horas

    const resultado = format(fechaAjustada, formato, {
        locale: es
    });

    return resultado;
};
