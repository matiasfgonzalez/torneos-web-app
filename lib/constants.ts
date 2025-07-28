export const TOURNAMENT_CATEGORIES = [
    { label: "Reserva", value: "RESERVA" },
    { label: "Primera", value: "PRIMERA" },
    { label: "Veterano", value: "VETERANO" },
    { label: "Pre-Veterano", value: "PREVETERANO" },
    { label: "Libre", value: "LIBRE" },
    { label: "Senior", value: "SENIOR" },
    { label: "Sub-17", value: "SUB17" },
    { label: "Femenino", value: "FEMENINO" },
    { label: "Infantil", value: "INFANTIL" }
] as const;

export const TOURNAMENT_CATEGORIES_DESC = [
    "LIBRE",
    "SENIOR",
    "SUB_17",
    "RESERVA",
    "PRIMERA",
    "VETERANO",
    "PREVETERANO",
    "FEMENINO",
    "INFANTIL"
] as const;

export const TOURNAMENT_FORMATS = [
    { label: "Liga", value: "LIGA" },
    { label: "Eliminación directa", value: "ELIMINACION_DIRECTA" },
    { label: "Grupos", value: "GRUPOS" },
    { label: "Ida y vuelta", value: "IDA_Y_VUELTA" }
] as const;

export const TOURNAMENT_FORMATS_DESC = [
    "LIGA",
    "ELIMINACION_DIRECTA",
    "GRUPOS",
    "IDA_Y_VUELTA"
] as const;

export const TORNAMENT_STATUS_DESC = [
    "ACTIVE",
    "INACTIVE",
    "COMPLETED"
] as const;
