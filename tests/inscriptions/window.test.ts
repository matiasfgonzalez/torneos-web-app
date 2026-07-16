import { describe, expect, it } from "vitest";
import {
  canRequestInscription,
  effectiveCapacity,
  isRegistrationClosed,
  remainingSlots,
} from "@/lib/inscriptions";

const AHORA = new Date(2026, 7, 15, 12, 0); // 15 ago 2026, 12:00

describe("isRegistrationClosed", () => {
  it("sin fecha límite nunca cierra por tiempo", () => {
    expect(isRegistrationClosed(null, AHORA)).toBe(false);
    expect(isRegistrationClosed(undefined, AHORA)).toBe(false);
  });

  it("abierto antes del límite", () => {
    expect(isRegistrationClosed(new Date(2026, 7, 20), AHORA)).toBe(false);
  });

  it("cerrado después del límite", () => {
    expect(isRegistrationClosed(new Date(2026, 7, 10), AHORA)).toBe(true);
  });

  it("un minuto antes sigue abierto; un minuto después ya no", () => {
    expect(isRegistrationClosed(new Date(2026, 7, 15, 12, 1), AHORA)).toBe(false);
    expect(isRegistrationClosed(new Date(2026, 7, 15, 11, 59), AHORA)).toBe(true);
  });

  it("acepta la fecha como string ISO (viene así del cliente)", () => {
    expect(isRegistrationClosed("2026-08-20T00:00:00", AHORA)).toBe(false);
    expect(isRegistrationClosed("2026-08-10T00:00:00", AHORA)).toBe(true);
  });

  it("una fecha inválida no cierra: mejor abierto que bloqueado por un dato roto", () => {
    expect(isRegistrationClosed("no soy una fecha", AHORA)).toBe(false);
  });
});

describe("remainingSlots", () => {
  it("sin cupo definido devuelve null (ilimitado)", () => {
    expect(remainingSlots(null, 5)).toBeNull();
    expect(remainingSlots(undefined, 5)).toBeNull();
  });

  it("cuenta los cupos libres", () => {
    expect(remainingSlots(10, 4)).toBe(6);
    expect(remainingSlots(10, 10)).toBe(0);
  });

  it("nunca devuelve negativo aunque se haya desbordado el cupo", () => {
    expect(remainingSlots(8, 12)).toBe(0);
  });
});

describe("effectiveCapacity", () => {
  it("sin cupo del torneo, manda el plan", () => {
    expect(effectiveCapacity(null, 8)).toEqual({ limit: 8, source: "plan" });
    expect(effectiveCapacity(undefined, 8)).toEqual({ limit: 8, source: "plan" });
  });

  it("manda el más chico de los dos", () => {
    // El organizador quiere 20 pero su plan da 8 → 8
    expect(effectiveCapacity(20, 8)).toEqual({ limit: 8, source: "plan" });
    // El plan da 30 pero el torneo es de 10 → 10
    expect(effectiveCapacity(10, 30)).toEqual({ limit: 10, source: "tournament" });
  });

  it("empatados, el torneo es el motivo: es lo que el organizador eligió", () => {
    expect(effectiveCapacity(8, 8)).toEqual({ limit: 8, source: "tournament" });
  });

  it("distingue el motivo, que es lo que decide a quién se le cuenta qué", () => {
    // `source: "plan"` → al organizador se le ofrece mejorar el plan;
    // al delegado solo se le dice que no hay lugar.
    expect(effectiveCapacity(50, 8).source).toBe("plan");
    expect(effectiveCapacity(4, 8).source).toBe("tournament");
  });
});

describe("canRequestInscription", () => {
  const base = {
    status: "INSCRIPCION",
    maxTeams: 10,
    registrationDeadline: new Date(2026, 7, 20),
    takenSlots: 4,
  };

  it("abierto: estado correcto, con fecha por delante y cupos libres", () => {
    expect(canRequestInscription(base, AHORA)).toEqual({ open: true });
  });

  it("cierra si el torneo no está en inscripción", () => {
    const result = canRequestInscription({ ...base, status: "ACTIVO" }, AHORA);
    expect(result.open).toBe(false);
    if (!result.open) expect(result.reason).toBe("status");
  });

  it("cierra si pasó la fecha límite", () => {
    const result = canRequestInscription(
      { ...base, registrationDeadline: new Date(2026, 7, 1) },
      AHORA,
    );
    expect(result.open).toBe(false);
    if (!result.open) {
      expect(result.reason).toBe("deadline");
      expect(result.message).toMatch(/cerraron/i);
    }
  });

  it("cierra si se cubrieron los cupos", () => {
    const result = canRequestInscription({ ...base, takenSlots: 10 }, AHORA);
    expect(result.open).toBe(false);
    if (!result.open) {
      expect(result.reason).toBe("full");
      expect(result.message).toMatch(/10 cupos/);
    }
  });

  it("sin cupo definido no cierra por lleno, por más equipos que haya", () => {
    const result = canRequestInscription(
      { ...base, maxTeams: null, takenSlots: 99 },
      AHORA,
    );
    expect(result).toEqual({ open: true });
  });

  it("el estado manda sobre todo lo demás", () => {
    // Torneo finalizado, sin cupos y vencido: el motivo tiene que ser el estado
    const result = canRequestInscription(
      {
        status: "FINALIZADO",
        maxTeams: 10,
        takenSlots: 10,
        registrationDeadline: new Date(2026, 7, 1),
      },
      AHORA,
    );
    expect(result.open).toBe(false);
    if (!result.open) expect(result.reason).toBe("status");
  });
});
