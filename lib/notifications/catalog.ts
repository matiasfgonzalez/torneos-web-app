import type { NotificationCategory, NotificationType } from "@prisma/client";

/**
 * Catálogo de notificaciones (S5) — **puro y sin dependencias**.
 *
 * Acá vive la única fuente de "qué dice y adónde lleva" cada notificación. El
 * despachador (lib/notifications/dispatch.ts) solo transporta lo que esto
 * devuelve; los emisores (server actions) solo arman el payload.
 *
 * Es puro a propósito: el texto de una notificación es la parte que más se
 * revisa y la más fácil de romper (un torneo sin nombre, una URL a un id que
 * no existe). Separado de Prisma se testea sin base de datos.
 */

/**
 * Payload de cada tipo. La unión discriminada es lo que hace que el emisor no
 * pueda mandar una notificación de inscripción sin el nombre del torneo:
 * `notify(user, { type: "INSCRIPCION_APROBADA" })` no compila.
 */
export type NotificationPayload =
  // ── Al delegado ────────────────────────────────────────────
  | { type: "SOLICITUD_DELEGADO_APROBADA"; teamName: string; teamId: string }
  | { type: "SOLICITUD_DELEGADO_RECHAZADA"; teamName: string }
  | {
      type: "INSCRIPCION_APROBADA";
      teamName: string;
      tournamentName: string;
      tournamentId: string;
    }
  | {
      type: "INSCRIPCION_RECHAZADA";
      teamName: string;
      tournamentName: string;
    }
  | {
      type: "RESULTADO_CARGADO";
      matchId: string;
      tournamentName: string;
      homeTeamName: string;
      awayTeamName: string;
      homeScore: number;
      awayScore: number;
    }
  | {
      type: "JUGADOR_SUSPENDIDO";
      playerName: string;
      tournamentName: string;
      tournamentId: string;
      matches: number;
      reason: string;
    }
  | {
      type: "EQUIPO_INSCRIPTO_POR_OTRA_LIGA";
      teamName: string;
      tournamentName: string;
      tournamentId: string;
      /** Liga que lo inscribió — no es la dueña del equipo. */
      organizationName: string;
    }
  // ── A la liga ──────────────────────────────────────────────
  | {
      type: "SOLICITUD_DELEGADO_RECIBIDA";
      teamName: string;
      requesterName: string;
      isNewTeam: boolean;
    }
  | {
      type: "INSCRIPCION_RECIBIDA";
      teamName: string;
      tournamentName: string;
      tournamentId: string;
    }
  | { type: "PAGO_APROBADO"; planName: string; periodEnd: string }
  | { type: "PAGO_RECHAZADO"; planName: string; reason: string | null }
  // ── A la plataforma ────────────────────────────────────────
  | {
      type: "PAGO_INFORMADO";
      orgName: string;
      planName: string;
      amount: string;
    }
  | { type: "FICHA_DISPUTA_ABIERTA"; playerName: string; claimantName: string }
  // ── Al jugador ─────────────────────────────────────────────
  | { type: "FICHA_APROBADA"; playerName: string }
  | { type: "FICHA_RECHAZADA"; playerName: string };

export interface RenderedNotification {
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string | null;
  url: string | null;
}

/** Categoría de cada tipo — el eje por el que el usuario apaga los emails. */
export const NOTIFICATION_CATEGORY: Record<
  NotificationType,
  NotificationCategory
> = {
  SOLICITUD_DELEGADO_APROBADA: "EQUIPO",
  SOLICITUD_DELEGADO_RECHAZADA: "EQUIPO",
  SOLICITUD_DELEGADO_RECIBIDA: "EQUIPO",
  INSCRIPCION_APROBADA: "EQUIPO",
  INSCRIPCION_RECHAZADA: "EQUIPO",
  INSCRIPCION_RECIBIDA: "EQUIPO",
  RESULTADO_CARGADO: "PARTIDO",
  JUGADOR_SUSPENDIDO: "PARTIDO",
  EQUIPO_INSCRIPTO_POR_OTRA_LIGA: "EQUIPO",
  PAGO_INFORMADO: "PAGO",
  PAGO_APROBADO: "PAGO",
  PAGO_RECHAZADO: "PAGO",
  FICHA_APROBADA: "FICHA",
  FICHA_RECHAZADA: "FICHA",
  FICHA_DISPUTA_ABIERTA: "FICHA",
};

/** Etiquetas de las categorías para la pantalla de preferencias. */
export const CATEGORY_LABELS: Record<
  NotificationCategory,
  { label: string; description: string }
> = {
  EQUIPO: {
    label: "Equipo e inscripciones",
    description:
      "Cuando la liga responde una solicitud de delegado o una inscripción a un torneo.",
  },
  PARTIDO: {
    label: "Partidos",
    description: "Resultados cargados y suspensiones de tus jugadores.",
  },
  PAGO: {
    label: "Plan y pagos",
    description: "Cuando se aprueba o se rechaza un pago de tu liga.",
  },
  FICHA: {
    label: "Mi ficha de jugador",
    description: "Respuestas a tu reclamo de ficha y disputas de titularidad.",
  },
};

/** Todas las categorías, en el orden en que se muestran. */
export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  "EQUIPO",
  "PARTIDO",
  "PAGO",
  "FICHA",
];

/**
 * Arma título, cuerpo y destino de una notificación.
 *
 * Reglas de redacción, para que el conjunto suene a una sola voz:
 * - El título dice **qué pasó**, no "Notificación de…". Se lee en una campana
 *   de 300px: entra el sujeto y el verbo, nada más.
 * - El cuerpo agrega lo que el título no puede y **cierra**: si hay que hacer
 *   algo, lo dice.
 * - La URL lleva al lugar donde se resuelve, no al home.
 */
export function renderNotification(
  payload: NotificationPayload,
): RenderedNotification {
  const base = {
    type: payload.type,
    category: NOTIFICATION_CATEGORY[payload.type],
  };

  switch (payload.type) {
    case "SOLICITUD_DELEGADO_APROBADA":
      return {
        ...base,
        title: `Ya sos delegado de ${payload.teamName}`,
        body: "La liga aprobó tu solicitud. Ya podés cargar el plantel e inscribirlo en torneos.",
        url: "/mi-equipo",
      };

    case "SOLICITUD_DELEGADO_RECHAZADA":
      return {
        ...base,
        title: `La liga rechazó tu solicitud para ${payload.teamName}`,
        body: "Si creés que hay un error, hablá con la liga antes de volver a pedirlo.",
        url: "/mi-equipo",
      };

    case "EQUIPO_INSCRIPTO_POR_OTRA_LIGA":
      return {
        ...base,
        title: `${payload.teamName} fue inscripto en ${payload.tournamentName}`,
        // Se avisa, no se pide permiso: el club puede jugar en varias ligas y
        // exigir aprobación trabaría el caso normal. Pero el delegado tiene que
        // enterarse, porque es su representación la que entra a ese torneo.
        body: `Lo inscribió ${payload.organizationName}, que no es la liga que administra al equipo. Si no corresponde, hablá con esa liga.`,
        url: `/torneos/${payload.tournamentId}`,
      };

    case "INSCRIPCION_APROBADA":
      return {
        ...base,
        title: `${payload.teamName} quedó inscripto en ${payload.tournamentName}`,
        body: "Revisá que el plantel esté completo antes de que arranque el torneo.",
        url: "/mi-equipo",
      };

    case "INSCRIPCION_RECHAZADA":
      return {
        ...base,
        title: `${payload.tournamentName} rechazó la inscripción de ${payload.teamName}`,
        body: "El plantel que cargaste sigue guardado. Consultá con la liga el motivo.",
        url: "/mi-equipo",
      };

    case "RESULTADO_CARGADO":
      return {
        ...base,
        title: `${payload.homeTeamName} ${payload.homeScore} - ${payload.awayScore} ${payload.awayTeamName}`,
        body: `Se cargó el resultado en ${payload.tournamentName}.`,
        url: `/partidos/${payload.matchId}`,
      };

    case "JUGADOR_SUSPENDIDO":
      return {
        ...base,
        title: `${payload.playerName} está suspendido`,
        body: `${suspensionSummary(payload.matches, payload.reason)} en ${payload.tournamentName}. Si lo alineás igual, el partido puede darse por perdido.`,
        url: `/torneos/${payload.tournamentId}`,
      };

    case "SOLICITUD_DELEGADO_RECIBIDA":
      return {
        ...base,
        title: payload.isNewTeam
          ? `${payload.requesterName} propone el equipo ${payload.teamName}`
          : `${payload.requesterName} quiere ser delegado de ${payload.teamName}`,
        body: "Está esperando tu respuesta para poder inscribirlo en torneos.",
        url: "/admin/delegados",
      };

    case "INSCRIPCION_RECIBIDA":
      return {
        ...base,
        title: `${payload.teamName} pidió inscribirse en ${payload.tournamentName}`,
        body: "Aprobala o rechazala desde el torneo.",
        url: `/admin/torneos/${payload.tournamentId}`,
      };

    case "PAGO_APROBADO":
      return {
        ...base,
        title: `Tu pago del plan ${payload.planName} fue aprobado`,
        body: `El plan queda activo hasta el ${payload.periodEnd}.`,
        url: "/admin/plan",
      };

    case "PAGO_RECHAZADO":
      return {
        ...base,
        title: `Tu pago del plan ${payload.planName} fue rechazado`,
        body: payload.reason
          ? `Motivo: ${payload.reason}`
          : "Revisá el comprobante y volvé a informarlo.",
        url: "/admin/plan",
      };

    case "PAGO_INFORMADO":
      return {
        ...base,
        title: `${payload.orgName} informó un pago`,
        body: `Plan ${payload.planName} — ${payload.amount}. Esperando revisión.`,
        url: "/admin/pagos",
      };

    case "FICHA_DISPUTA_ABIERTA":
      return {
        ...base,
        title: `Disputa por la ficha de ${payload.playerName}`,
        body: `${payload.claimantName} dice que esa ficha es suya. Hay que revisar la evidencia de ambas partes.`,
        // Los reclamos de ficha se resuelven en la misma pantalla que las
        // solicitudes de delegado, no en /admin/jugadores.
        url: "/admin/delegados",
      };

    case "FICHA_APROBADA":
      return {
        ...base,
        title: `La ficha de ${payload.playerName} ya es tuya`,
        body: "Podés ver tu historial y mantener tus datos al día.",
        url: "/mi-ficha",
      };

    case "FICHA_RECHAZADA":
      return {
        ...base,
        title: `Rechazaron tu reclamo de la ficha de ${payload.playerName}`,
        body: "Si es tu ficha, hablá con tu liga o tu delegado para que la confirmen.",
        url: "/mi-ficha",
      };
  }
}

/** "2 fechas por roja" / "1 fecha por acumulación" — sin plural roto. */
function suspensionSummary(matches: number, reason: string): string {
  const fechas = matches === 1 ? "1 fecha" : `${matches} fechas`;
  const motivo = {
    ACUMULACION: "por acumulación de amarillas",
    ROJA: "por roja",
    MANUAL: "por decisión de la liga",
  }[reason];
  return motivo ? `${fechas} ${motivo}` : fechas;
}
