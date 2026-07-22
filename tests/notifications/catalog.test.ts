import { describe, expect, it } from "vitest";

import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY,
  CATEGORY_LABELS,
  renderNotification,
  type NotificationPayload,
} from "@/lib/notifications/catalog";

/**
 * El catálogo es la parte del sistema de notificaciones que se puede probar de
 * verdad: es puro. Lo que se testea acá no es la redacción (cambia), son las
 * invariantes que el resto asume — que todo tipo tiene categoría, que las URLs
 * apuntan a algo, y que los datos del payload llegan al texto.
 */

/** Un payload de cada tipo: la lista viva contra la que se chequea cobertura. */
const SAMPLES: NotificationPayload[] = [
  { type: "SOLICITUD_DELEGADO_APROBADA", teamName: "Racing", teamId: "t1" },
  { type: "SOLICITUD_DELEGADO_RECHAZADA", teamName: "Racing" },
  {
    type: "INSCRIPCION_APROBADA",
    teamName: "Racing",
    tournamentName: "Apertura",
    tournamentId: "to1",
  },
  {
    type: "INSCRIPCION_RECHAZADA",
    teamName: "Racing",
    tournamentName: "Apertura",
  },
  {
    type: "EQUIPO_INSCRIPTO_POR_OTRA_LIGA",
    teamName: "Racing",
    tournamentName: "Apertura",
    tournamentId: "to1",
    organizationName: "Liga del Sur",
  },
  {
    type: "RESULTADO_CARGADO",
    matchId: "m1",
    tournamentName: "Apertura",
    homeTeamName: "Racing",
    awayTeamName: "Boca",
    homeScore: 2,
    awayScore: 1,
  },
  {
    type: "JUGADOR_SUSPENDIDO",
    playerName: "Juan Pérez",
    tournamentName: "Apertura",
    tournamentId: "to1",
    matches: 2,
    reason: "ROJA",
  },
  {
    type: "SOLICITUD_DELEGADO_RECIBIDA",
    teamName: "Racing",
    requesterName: "Ana",
    isNewTeam: false,
  },
  {
    type: "INSCRIPCION_RECIBIDA",
    teamName: "Racing",
    tournamentName: "Apertura",
    tournamentId: "to1",
  },
  { type: "PAGO_APROBADO", planName: "PRO", periodEnd: "1 de agosto de 2026" },
  { type: "PAGO_RECHAZADO", planName: "PRO", reason: "Comprobante ilegible" },
  {
    type: "PAGO_INFORMADO",
    orgName: "Liga Municipal",
    planName: "PRO",
    amount: "ARS 5000.00",
  },
  { type: "FICHA_DISPUTA_ABIERTA", playerName: "Juan Pérez", claimantName: "Ana" },
  { type: "FICHA_APROBADA", playerName: "Juan Pérez" },
  { type: "FICHA_RECHAZADA", playerName: "Juan Pérez" },
];

describe("renderNotification", () => {
  it("cubre todos los tipos del enum sin faltar ninguno", () => {
    // Si mañana se agrega un tipo al schema y no se agrega acá, esto falla:
    // es el recordatorio de que también hay que darle texto.
    const covered = new Set(SAMPLES.map((s) => s.type));
    const declared = Object.keys(NOTIFICATION_CATEGORY);
    expect([...covered].sort()).toEqual(declared.sort());
  });

  it("siempre devuelve un título no vacío", () => {
    for (const payload of SAMPLES) {
      const rendered = renderNotification(payload);
      expect(rendered.title.trim().length).toBeGreaterThan(0);
    }
  });

  it("las URLs son rutas internas absolutas", () => {
    // Una URL relativa rompe el <Link> de la campana, y una absoluta a otro
    // dominio sería un redirect abierto.
    for (const payload of SAMPLES) {
      const { url } = renderNotification(payload);
      if (url !== null) expect(url).toMatch(/^\/[^/]/);
    }
  });

  it("la categoría del render coincide con la del mapa", () => {
    for (const payload of SAMPLES) {
      const rendered = renderNotification(payload);
      expect(rendered.category).toBe(NOTIFICATION_CATEGORY[payload.type]);
    }
  });

  it("mete el marcador y los equipos en el título del resultado", () => {
    const r = renderNotification({
      type: "RESULTADO_CARGADO",
      matchId: "m1",
      tournamentName: "Apertura",
      homeTeamName: "Racing",
      awayTeamName: "Boca",
      homeScore: 2,
      awayScore: 1,
    });
    expect(r.title).toBe("Racing 2 - 1 Boca");
    expect(r.url).toBe("/partidos/m1");
    expect(r.category).toBe("PARTIDO");
  });

  it("distingue proponer un equipo nuevo de reclamar uno existente", () => {
    const nuevo = renderNotification({
      type: "SOLICITUD_DELEGADO_RECIBIDA",
      teamName: "Racing",
      requesterName: "Ana",
      isNewTeam: true,
    });
    const reclamo = renderNotification({
      type: "SOLICITUD_DELEGADO_RECIBIDA",
      teamName: "Racing",
      requesterName: "Ana",
      isNewTeam: false,
    });
    expect(nuevo.title).toContain("propone");
    expect(reclamo.title).toContain("delegado");
    expect(nuevo.title).not.toBe(reclamo.title);
  });

  it("el rechazo de pago dice el motivo cuando lo hay, y algo útil cuando no", () => {
    const conMotivo = renderNotification({
      type: "PAGO_RECHAZADO",
      planName: "PRO",
      reason: "Comprobante ilegible",
    });
    expect(conMotivo.body).toContain("Comprobante ilegible");

    const sinMotivo = renderNotification({
      type: "PAGO_RECHAZADO",
      planName: "PRO",
      reason: null,
    });
    // Sin motivo el cuerpo no puede quedar vacío: hay que decirle qué hacer.
    expect(sinMotivo.body?.trim().length).toBeGreaterThan(0);
  });

  it("singulariza las fechas de suspensión", () => {
    const una = renderNotification({
      type: "JUGADOR_SUSPENDIDO",
      playerName: "Juan",
      tournamentName: "Apertura",
      tournamentId: "to1",
      matches: 1,
      reason: "ACUMULACION",
    });
    expect(una.body).toContain("1 fecha por acumulación");
    expect(una.body).not.toContain("1 fechas");

    const dos = renderNotification({
      type: "JUGADOR_SUSPENDIDO",
      playerName: "Juan",
      tournamentName: "Apertura",
      tournamentId: "to1",
      matches: 2,
      reason: "ROJA",
    });
    expect(dos.body).toContain("2 fechas por roja");
  });
});

describe("categorías", () => {
  it("toda categoría usada por un tipo tiene etiqueta y está en la lista", () => {
    // Sin esto, un tipo con categoría nueva rompe la pantalla de preferencias
    // (que itera NOTIFICATION_CATEGORIES) sin que nadie se entere hasta prod.
    for (const category of Object.values(NOTIFICATION_CATEGORY)) {
      expect(NOTIFICATION_CATEGORIES).toContain(category);
      expect(CATEGORY_LABELS[category]?.label?.length).toBeGreaterThan(0);
    }
  });
});
