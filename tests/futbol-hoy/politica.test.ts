import { describe, expect, it } from "vitest";

import {
  INTERVALO_LARGO_MS,
  INTERVALO_MS,
  PRESUPUESTO_DIARIO,
  avisoDeError,
  avisoDeFrescura,
  decidirRefresco,
  type ContextoRefresco,
} from "@/lib/futbol-hoy/politica";

const AHORA = new Date("2026-08-02T18:00:00Z");
const HOY = "2026-08-02";

/** Contexto por defecto: hoy, con datos guardados y partidos por jugarse. */
const ctx = (extra: Partial<ContextoRefresco> = {}): ContextoRefresco => ({
  ahora: AHORA,
  matchDay: HOY,
  hoy: HOY,
  sync: {
    lastAttemptAt: new Date(AHORA.getTime() - 30 * 60_000), // hace 30 min
    lastSuccessAt: new Date(AHORA.getTime() - 30 * 60_000),
  },
  requestsHoy: 10,
  hayDatos: true,
  hayPendientes: true,
  ...extra,
});

describe("decidirRefresco — candado de 20 minutos", () => {
  it("refresca si pasó el intervalo", () => {
    expect(decidirRefresco(ctx()).refrescar).toBe(true);
  });

  it("NO refresca si se consultó recién", () => {
    const d = decidirRefresco(
      ctx({
        sync: {
          lastAttemptAt: new Date(AHORA.getTime() - 5 * 60_000),
          lastSuccessAt: new Date(AHORA.getTime() - 5 * 60_000),
        },
      }),
    );

    expect(d.refrescar).toBe(false);
    expect(d.motivo).toBe("RECIEN_ACTUALIZADO");
  });

  it("el candado mide contra el último INTENTO, no contra el último éxito", () => {
    // Proveedor caído: el último éxito es de ayer, pero se intentó hace 2
    // minutos. Reintentar en cada visita no lo levanta y sí quema la cuota.
    const d = decidirRefresco(
      ctx({
        sync: {
          lastAttemptAt: new Date(AHORA.getTime() - 2 * 60_000),
          lastSuccessAt: new Date(AHORA.getTime() - 24 * 60 * 60_000),
        },
      }),
    );

    expect(d.refrescar).toBe(false);
    expect(d.motivo).toBe("RECIEN_ACTUALIZADO");
  });

  it("justo en el límite del intervalo, refresca", () => {
    const d = decidirRefresco(
      ctx({
        sync: {
          lastAttemptAt: new Date(AHORA.getTime() - INTERVALO_MS),
          lastSuccessAt: null,
        },
      }),
    );

    expect(d.refrescar).toBe(true);
  });
});

describe("decidirRefresco — presupuesto diario", () => {
  it("con la cuota agotada no se llama, aunque haya pasado el intervalo", () => {
    const d = decidirRefresco(ctx({ requestsHoy: PRESUPUESTO_DIARIO }));

    expect(d.refrescar).toBe(false);
    expect(d.motivo).toBe("CUOTA_AGOTADA");
  });

  it("la cuota gana incluso cuando no hay ningún dato guardado", () => {
    // Es el caso que más tienta a saltear el límite ("la página está vacía,
    // dejame intentar"), y es justo cuando no hay que hacerlo: sin cuota la
    // llamada falla igual y deja al resto del día sin margen.
    const d = decidirRefresco(
      ctx({ sync: null, hayDatos: false, requestsHoy: PRESUPUESTO_DIARIO + 5 }),
    );

    expect(d.refrescar).toBe(false);
    expect(d.motivo).toBe("CUOTA_AGOTADA");
  });

  it("una llamada por debajo del techo todavía entra", () => {
    expect(
      decidirRefresco(ctx({ requestsHoy: PRESUPUESTO_DIARIO - 1 })).refrescar,
    ).toBe(true);
  });

  it("el techo propio queda por debajo de las 100 del plan gratuito", () => {
    expect(PRESUPUESTO_DIARIO).toBeLessThan(100);
  });
});

describe("decidirRefresco — primera vez", () => {
  it("sin fila de sincronización, se intenta", () => {
    expect(
      decidirRefresco(ctx({ sync: null, hayDatos: false })).refrescar,
    ).toBe(true);
  });

  it("con fila pero sin datos guardados, también", () => {
    // Un intento fallido dejó la fila creada y la página vacía: no puede
    // quedarse así esperando el intervalo.
    const d = decidirRefresco(
      ctx({
        hayDatos: false,
        sync: {
          lastAttemptAt: new Date(AHORA.getTime() - 60_000),
          lastSuccessAt: null,
        },
      }),
    );

    expect(d.refrescar).toBe(true);
  });
});

describe("decidirRefresco — días que no son hoy", () => {
  it("un día pasado y resuelto no se vuelve a pedir nunca", () => {
    const d = decidirRefresco(
      ctx({
        matchDay: "2026-08-01",
        hayPendientes: false,
        sync: {
          lastAttemptAt: new Date("2026-08-01T23:00:00Z"),
          lastSuccessAt: new Date("2026-08-01T23:00:00Z"),
        },
      }),
    );

    expect(d.refrescar).toBe(false);
    expect(d.motivo).toBe("DIA_CERRADO");
  });

  it("un día pasado con un partido sin resolver sí se revisa", () => {
    // Un suspendido de ayer que se reanudó tiene resultado nuevo.
    const d = decidirRefresco(
      ctx({
        matchDay: "2026-08-01",
        hayPendientes: true,
        sync: {
          lastAttemptAt: new Date("2026-08-01T00:00:00Z"),
          lastSuccessAt: new Date("2026-08-01T00:00:00Z"),
        },
      }),
    );

    expect(d.refrescar).toBe(true);
  });

  it("un día futuro usa el intervalo largo: no hay marcador que cambie", () => {
    const d = decidirRefresco(ctx({ matchDay: "2026-08-03" }));

    expect(d.intervaloMs).toBe(INTERVALO_LARGO_MS);
    // Hace 30 minutos es "recién" para un intervalo de 6 horas.
    expect(d.refrescar).toBe(false);
    expect(d.motivo).toBe("RECIEN_ACTUALIZADO");
  });

  it("hoy con todo terminado también pasa al intervalo largo", () => {
    const d = decidirRefresco(ctx({ hayPendientes: false }));
    expect(d.intervaloMs).toBe(INTERVALO_LARGO_MS);
  });

  it("hoy con partidos pendientes usa los 20 minutos", () => {
    expect(decidirRefresco(ctx()).intervaloMs).toBe(INTERVALO_MS);
  });
});

describe("avisoDeFrescura", () => {
  it("no avisa nada cuando los datos están al día", () => {
    const c = ctx({
      sync: {
        lastAttemptAt: new Date(AHORA.getTime() - 60_000),
        lastSuccessAt: new Date(AHORA.getTime() - 60_000),
      },
    });

    expect(avisoDeFrescura(c, decidirRefresco(c))).toBeNull();
  });

  it("avisa cuando nunca se pudo traer nada", () => {
    const c = ctx({ sync: null, hayDatos: false });
    expect(avisoDeFrescura(c, decidirRefresco(c))).toContain(
      "Todavía no pudimos traer",
    );
  });

  it("avisa cuando se agotó la cuota", () => {
    const c = ctx({ requestsHoy: PRESUPUESTO_DIARIO });
    expect(avisoDeFrescura(c, decidirRefresco(c))).toContain("límite diario");
  });

  it("un retraso apenas por encima del intervalo NO dispara alarma", () => {
    // El umbral es el doble del intervalo: si no, cualquier visita al minuto 21
    // vería un cartel por un minuto de atraso.
    const c = ctx({
      sync: {
        lastAttemptAt: new Date(AHORA.getTime() - 21 * 60_000),
        lastSuccessAt: new Date(AHORA.getTime() - 21 * 60_000),
      },
    });

    expect(avisoDeFrescura(c, decidirRefresco(c))).toBeNull();
  });

  it("un retraso de verdad sí se informa, con el número de minutos", () => {
    const c = ctx({
      sync: {
        lastAttemptAt: new Date(AHORA.getTime() - 90 * 60_000),
        lastSuccessAt: new Date(AHORA.getTime() - 90 * 60_000),
      },
    });

    expect(avisoDeFrescura(c, decidirRefresco(c))).toBe(
      "Los resultados se actualizaron por última vez hace 90 minutos.",
    );
  });
});

describe("avisoDeError", () => {
  it("la fecha fuera del plan se explica como tal, no como falla pasajera", () => {
    // Mensaje textual devuelto por API-Football el 2026-08-02. Un genérico
    // "no pudimos actualizar" invitaría a recargar una página que no va a
    // funcionar nunca para esa fecha.
    const real =
      "API-Football: plan: Free plans do not have access to this date, try from 2026-08-02 to 2026-08-04.";

    expect(avisoDeError(real)).toBe(
      "Esa fecha no está disponible: el plan contratado con el proveedor de datos solo cubre los próximos días.",
    );
  });

  it("la cuota agotada del proveedor se distingue del resto", () => {
    expect(
      avisoDeError(
        "API-Football: requests: You have reached the request limit for the day",
      ),
    ).toContain("límite diario");
  });

  it("una clave rechazada se reporta como problema de configuración", () => {
    expect(avisoDeError("API-Football: token: Invalid API key")).toContain(
      "no está bien configurada",
    );
  });

  it("cualquier otro error cae en el genérico", () => {
    expect(avisoDeError("API-Football respondió 502.")).toBe(
      "No pudimos actualizar los resultados en este momento.",
    );
    expect(avisoDeError("No se pudo contactar a API-Football: timeout")).toBe(
      "No pudimos actualizar los resultados en este momento.",
    );
  });

  it("no depende de mayúsculas ni del prefijo del proveedor", () => {
    expect(avisoDeError("PLAN: ... DATE ...")).toContain("Esa fecha no está");
  });
});
