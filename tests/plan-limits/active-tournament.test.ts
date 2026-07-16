import { describe, expect, it } from "vitest";
import { isActiveTournamentStatus } from "@/lib/planLimits";

/**
 * Qué torneo consume cupo del plan (N4).
 *
 * No es trivia: esta regla la tienen que compartir **el conteo** y **todos los
 * caminos que activan un torneo**. Cuando solo la sabía el conteo, reactivar un
 * archivado o restaurar un eliminado esquivaban el límite.
 */
describe("isActiveTournamentStatus", () => {
  it.each(["PENDIENTE", "INSCRIPCION", "ACTIVO", "PAUSADO"])(
    "%s ocupa cupo: el torneo está vivo",
    (status) => {
      expect(isActiveTournamentStatus(status)).toBe(true);
    },
  );

  it.each(["FINALIZADO", "CANCELADO", "ARCHIVADO"])(
    "%s no ocupa cupo: el torneo terminó",
    (status) => {
      expect(isActiveTournamentStatus(status)).toBe(false);
    },
  );

  it("un estado desconocido ocupa cupo (falla del lado seguro para el negocio)", () => {
    // Si mañana se agrega un estado al enum y nadie toca esta lista, conviene
    // que cuente: cobrar de más se corrige, regalar el producto no se detecta.
    expect(isActiveTournamentStatus("ESTADO_NUEVO")).toBe(true);
  });
});
