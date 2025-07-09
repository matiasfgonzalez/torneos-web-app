import { format } from "date-fns";
import { es } from "date-fns/locale";

export const formatDate = (dateString: string | Date): string => {
    const fecha = new Date(dateString);

    const resultado = format(fecha, "dd 'de' MMMM yyyy - HH:mm", {
        locale: es
    });

    return resultado;
};
