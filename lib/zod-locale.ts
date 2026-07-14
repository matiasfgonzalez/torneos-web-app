import { z } from "zod";

/**
 * Mensajes de error de Zod en español (F3).
 *
 * Zod 4 trae locales oficiales: `z.config(z.locales.es())` cambia el idioma de
 * TODOS los mensajes por defecto ("Required" → "Campo requerido", "Too small"
 * → "Demasiado pequeño: se esperaba que string tuviera >=3 caracteres"), así
 * que un esquema solo necesita `message` propio cuando el texto genérico no
 * alcanza para que el usuario sepa cómo corregir el campo.
 *
 * Importá `z` desde acá (no desde "zod") en todo esquema que alimente un
 * formulario: garantiza que la config corrió antes de parsear.
 */
z.config(z.locales.es());

export { z };
