import { describe, it, expect } from "vitest";
import {
  groupMatchesByCup,
  hasMultipleCups,
} from "@/lib/standings/cup-groups";

/** Partido mínimo: lo único que mira el agrupador es su fase. */
const partido = (
  id: string,
  phase: { order: number; type?: string | null; cupName?: string | null } | null,
) => ({ id, tournamentPhase: phase });

/** El caso real del cliente: cuartos → Copa de Oro / Copa de Plata. */
const torneoDosCopas = [
  partido("c1", { order: 2, type: "KNOCKOUT", cupName: null }),
  partido("oro-semi", { order: 3, type: "KNOCKOUT", cupName: "Copa de Oro" }),
  partido("plata-semi", {
    order: 4,
    type: "KNOCKOUT",
    cupName: "Copa de Plata",
  }),
  partido("oro-final", { order: 5, type: "KNOCKOUT", cupName: "Copa de Oro" }),
  partido("plata-final", {
    order: 6,
    type: "KNOCKOUT",
    cupName: "Copa de Plata",
  }),
];

describe("groupMatchesByCup", () => {
  it("separa las copas y deja los cruces sin copa en su propio grupo", () => {
    const groups = groupMatchesByCup(torneoDosCopas);

    expect(groups.map((g) => g.cupName)).toEqual([
      null, // los cuartos, que alimentan a las dos copas
      "Copa de Oro",
      "Copa de Plata",
    ]);
    expect(groups[1].matches.map((m) => m.id)).toEqual([
      "oro-semi",
      "oro-final",
    ]);
    expect(groups[2].matches.map((m) => m.id)).toEqual([
      "plata-semi",
      "plata-final",
    ]);
  });

  it("ordena las copas por su fase más temprana, no alfabéticamente", () => {
    // "Copa de Plata" arranca antes que "Copa de Oro": manda el `order`.
    const groups = groupMatchesByCup([
      partido("a", { order: 9, type: "KNOCKOUT", cupName: "Copa de Oro" }),
      partido("b", { order: 3, type: "KNOCKOUT", cupName: "Copa de Plata" }),
    ]);
    expect(groups.map((g) => g.cupName)).toEqual([
      "Copa de Plata",
      "Copa de Oro",
    ]);
  });

  it("ignora los partidos que no son de eliminación directa", () => {
    const groups = groupMatchesByCup([
      partido("liga", { order: 1, type: "LEAGUE", cupName: null }),
      partido("grupos", { order: 1, type: "GROUP", cupName: null }),
      partido("sin-fase", null),
      partido("cruce", { order: 2, type: "KNOCKOUT", cupName: "Copa de Oro" }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].matches.map((m) => m.id)).toEqual(["cruce"]);
  });

  it("devuelve [] si no hay eliminación directa", () => {
    expect(
      groupMatchesByCup([partido("liga", { order: 1, type: "LEAGUE" })]),
    ).toEqual([]);
  });

  it("trata un `cupName` vacío o de solo espacios como 'sin copa'", () => {
    const groups = groupMatchesByCup([
      partido("a", { order: 1, type: "KNOCKOUT", cupName: "" }),
      partido("b", { order: 2, type: "KNOCKOUT", cupName: "   " }),
      partido("c", { order: 3, type: "KNOCKOUT", cupName: null }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].cupName).toBeNull();
    expect(groups[0].matches).toHaveLength(3);
  });

  it("normaliza los espacios del nombre para no duplicar la copa", () => {
    const groups = groupMatchesByCup([
      partido("a", { order: 1, type: "KNOCKOUT", cupName: "Copa de Oro" }),
      partido("b", { order: 2, type: "KNOCKOUT", cupName: " Copa de Oro " }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].cupName).toBe("Copa de Oro");
  });

  it("acepta `type` en minúsculas (isKnockoutPhaseType normaliza)", () => {
    const groups = groupMatchesByCup([
      partido("a", { order: 1, type: "knockout", cupName: "Copa de Oro" }),
    ]);
    expect(groups).toHaveLength(1);
  });
});

describe("hasMultipleCups", () => {
  it("es true con dos copas y false con una fase final única", () => {
    expect(hasMultipleCups(torneoDosCopas)).toBe(true);
    expect(
      hasMultipleCups([
        partido("a", { order: 1, type: "KNOCKOUT", cupName: null }),
        partido("b", { order: 2, type: "KNOCKOUT", cupName: null }),
      ]),
    ).toBe(false);
  });

  it("es false si no hay fase final", () => {
    expect(hasMultipleCups([partido("liga", { order: 1, type: "LEAGUE" })])).toBe(
      false,
    );
  });
});
