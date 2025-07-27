import { format } from "date-fns";
import { es } from "date-fns/locale";

export const formatDate = (
    dateString: string | Date,
    formato: string = "dd 'de' MMMM yyyy - HH:mm"
): string => {
    const fecha = new Date(dateString);

    const resultado = format(fecha, formato, {
        locale: es
    });

    return resultado;
};
