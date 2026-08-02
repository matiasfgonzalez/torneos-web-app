import { describe, expect, it } from "vitest";
import {
  tournamentCreateSchema,
  tournamentUpdateSchema,
} from "@/lib/validators/tournament";

/**
 * A8 — validadores de torneo.
 *
 * Dos reglas que no son evidentes al leer el esquema y que rompen cosas visibles
 * si se caen:
 *  - las fechas date-only se interpretan **en hora local** (si no, un torneo que
 *    arranca el 1 de julio aparece arrancando el 30 de junio al oeste de UTC);
 *  - `endDate >= startDate` (M11).
 */

const base = {
  name: "Apertura 2025",
  locality: "Rosario",
  format: "LIGA",
  startDate: "2025-07-01",
};

describe("tournamentCreateSchema — campos obligatorios", () => {
  it("acepta el mínimo: nombre, localidad, formato y fecha de inicio", () => {
    expect(tournamentCreateSchema.safeParse(base).success).toBe(true);
  });

  it.each(["name", "locality", "format", "startDate"])(
    "rechaza si falta %s",
    (campo) => {
      const payload: Record<string, unknown> = { ...base };
      delete payload[campo];
      expect(tournamentCreateSchema.safeParse(payload).success).toBe(false);
    },
  );

  it("rechaza un nombre en blanco", () => {
    expect(
      tournamentCreateSchema.safeParse({ ...base, name: "   " }).success,
    ).toBe(false);
  });

  it("rechaza un formato que no existe", () => {
    expect(
      tournamentCreateSchema.safeParse({ ...base, format: "PLAYOFF" }).success,
    ).toBe(false);
  });

  it("status y enabled se fijan server-side: no se aceptan del cliente", () => {
    const result = tournamentCreateSchema.parse({
      ...base,
      status: "ACTIVO",
      enabled: true,
    });
    expect(result).not.toHaveProperty("status");
    expect(result).not.toHaveProperty("enabled");
  });
});

describe("tournamentCreateSchema — fechas date-only en hora local", () => {
  it('"2025-07-01" es el 1 de julio a las 00:00 locales, no UTC', () => {
    const result = tournamentCreateSchema.parse(base);
    // `new Date("2025-07-01")` sería medianoche **UTC**: al oeste de Greenwich
    // eso es el 30 de junio y el torneo se muestra arrancando un día antes.
    // El esquema le agrega "T00:00:00" justamente para evitarlo.
    expect(result.startDate.getTime()).toBe(new Date(2025, 6, 1).getTime());
    expect(result.startDate.getHours()).toBe(0);
    expect(result.startDate.getDate()).toBe(1);
  });

  it("una fecha con hora explícita pasa sin tocarse", () => {
    const result = tournamentCreateSchema.parse({
      ...base,
      startDate: "2025-07-01T18:30:00.000Z",
    });
    expect(result.startDate.toISOString()).toBe("2025-07-01T18:30:00.000Z");
  });

  it("las fechas opcionales vacías quedan en null", () => {
    const result = tournamentCreateSchema.parse({
      ...base,
      endDate: "",
      registrationDeadline: "",
    });
    expect(result.endDate).toBeNull();
    expect(result.registrationDeadline).toBeNull();
  });

  it("rechaza una fecha que no se puede interpretar", () => {
    expect(
      tournamentCreateSchema.safeParse({ ...base, startDate: "el 1 de julio" })
        .success,
    ).toBe(false);
    expect(
      tournamentCreateSchema.safeParse({ ...base, startDate: "2025-13-45" })
        .success,
    ).toBe(false);
  });

  it("⚠️ una fecha DD/MM/AAAA se acepta y se interpreta al revés (hallazgo #30)", () => {
    // "01/07/2025" para un usuario argentino es el 1 de julio; `new Date()` lo
    // lee como formato de EE.UU. y devuelve el **7 de enero**, sin error.
    // El formulario manda ISO desde el date picker, así que hoy no se dispara,
    // pero un cliente de API que mande DD/MM/AAAA guarda una fecha equivocada
    // en silencio. Queda fijado acá para que el día que se endurezca el esquema
    // este test lo avise. Ver TODO.md, hallazgo #30.
    const result = tournamentCreateSchema.parse({
      ...base,
      startDate: "01/07/2025",
    });
    expect(result.startDate.getMonth()).toBe(0); // enero, no julio
    expect(result.startDate.getDate()).toBe(7);
  });
});

describe("tournamentCreateSchema — fin no anterior al inicio (M11)", () => {
  it("rechaza un fin anterior al inicio y señala el campo endDate", () => {
    const result = tournamentCreateSchema.safeParse({
      ...base,
      endDate: "2025-06-30",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0].path).toEqual(["endDate"]);
  });

  it("acepta que empiece y termine el mismo día", () => {
    expect(
      tournamentCreateSchema.safeParse({ ...base, endDate: "2025-07-01" })
        .success,
    ).toBe(true);
  });

  it("acepta un fin posterior", () => {
    expect(
      tournamentCreateSchema.safeParse({ ...base, endDate: "2025-12-15" })
        .success,
    ).toBe(true);
  });
});

describe("tournamentCreateSchema — configuración deportiva (N7)", () => {
  it("acepta un puntaje distinto del 3-1-0", () => {
    const result = tournamentCreateSchema.safeParse({
      ...base,
      pointsWin: 2,
      pointsDraw: 1,
      pointsLoss: 0,
    });
    expect(result.success).toBe(true);
  });

  it("permite puntos negativos por derrota, pero acotados", () => {
    expect(
      tournamentCreateSchema.safeParse({ ...base, pointsLoss: -10 }).success,
    ).toBe(true);
    expect(
      tournamentCreateSchema.safeParse({ ...base, pointsLoss: -11 }).success,
    ).toBe(false);
  });

  it("rechaza un puntaje por victoria fuera de rango", () => {
    expect(
      tournamentCreateSchema.safeParse({ ...base, pointsWin: 11 }).success,
    ).toBe(false);
    expect(
      tournamentCreateSchema.safeParse({ ...base, pointsWin: -1 }).success,
    ).toBe(false);
  });

  it("acepta una lista de desempates válida", () => {
    const result = tournamentCreateSchema.safeParse({
      ...base,
      tiebreakers: ["PTS", "DIF", "GF"],
    });
    expect(result.success).toBe(true);
  });

  it("rechaza una lista de desempates vacía (la tabla necesita al menos uno)", () => {
    expect(
      tournamentCreateSchema.safeParse({ ...base, tiebreakers: [] }).success,
    ).toBe(false);
  });

  it("rechaza un criterio de desempate que el ordenamiento no sabe calcular", () => {
    // H2H y FairPlay todavía no están soportados (ver lib/standings/config.ts):
    // aceptarlos acá haría que la tabla ordenara por un criterio inexistente.
    expect(
      tournamentCreateSchema.safeParse({ ...base, tiebreakers: ["H2H"] })
        .success,
    ).toBe(false);
  });

  it("rechaza más de 5 criterios", () => {
    expect(
      tournamentCreateSchema.safeParse({
        ...base,
        tiebreakers: ["PTS", "DIF", "GF", "GA", "WINS", "PTS"],
      }).success,
    ).toBe(false);
  });

  it("acepta 0 en las sanciones automáticas (0 las desactiva, N8)", () => {
    const result = tournamentCreateSchema.safeParse({
      ...base,
      yellowsForSuspension: 0,
      matchesPerRedCard: 0,
    });
    expect(result.success).toBe(true);
  });
});

describe("tournamentCreateSchema — inscripción (S3)", () => {
  it("el cupo mínimo es 2 equipos", () => {
    expect(
      tournamentCreateSchema.safeParse({ ...base, maxTeams: 1 }).success,
    ).toBe(false);
    expect(
      tournamentCreateSchema.safeParse({ ...base, maxTeams: 2 }).success,
    ).toBe(true);
  });

  it("sin cupo declarado queda en null (sin límite)", () => {
    const result = tournamentCreateSchema.parse({ ...base, maxTeams: "" });
    expect(result.maxTeams).toBeNull();
  });

  it("arancel 0 es válido (torneo gratis)", () => {
    const result = tournamentCreateSchema.parse({ ...base, inscriptionFee: 0 });
    expect(result.inscriptionFee).toBe(0);
  });

  it("rechaza un arancel negativo", () => {
    expect(
      tournamentCreateSchema.safeParse({ ...base, inscriptionFee: -1 }).success,
    ).toBe(false);
  });
});

describe("tournamentUpdateSchema", () => {
  it("acepta una edición parcial", () => {
    expect(tournamentUpdateSchema.safeParse({ name: "Clausura" }).success).toBe(
      true,
    );
    expect(tournamentUpdateSchema.safeParse({}).success).toBe(true);
  });

  it("acepta cambiar solo la fecha de fin (el PATCH compara con la base)", () => {
    // La regla M11 solo puede evaluarse si las dos fechas están en el payload;
    // el caso de editar una sola lo cierra el handler con el valor guardado.
    expect(
      tournamentUpdateSchema.safeParse({ endDate: "2020-01-01" }).success,
    ).toBe(true);
  });

  it("sigue aplicando M11 cuando vienen las dos fechas", () => {
    expect(
      tournamentUpdateSchema.safeParse({
        startDate: "2025-07-01",
        endDate: "2025-06-01",
      }).success,
    ).toBe(false);
  });

  it("acepta status y enabled (a diferencia del create)", () => {
    const result = tournamentUpdateSchema.parse({
      status: "FINALIZADO",
      enabled: false,
    });
    expect(result.status).toBe("FINALIZADO");
    expect(result.enabled).toBe(false);
  });
});
