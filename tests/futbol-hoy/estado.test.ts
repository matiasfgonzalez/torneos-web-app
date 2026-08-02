import { describe, expect, it } from "vitest";

import {
  estaEnVivo,
  estaTerminado,
  estadoDeFixture,
  mostrarMarcador,
} from "@/lib/futbol-hoy/estado";

const estado = (statusShort: string) => estadoDeFixture({ statusShort });

describe("estadoDeFixture", () => {
  it("traduce los códigos de partido no empezado", () => {
    expect(estado("NS")).toBe("PROGRAMADO");
    expect(estado("TBD")).toBe("PROGRAMADO");
  });

  it("traduce los códigos de partido en curso", () => {
    expect(estado("1H")).toBe("EN_JUEGO");
    expect(estado("2H")).toBe("EN_JUEGO");
    expect(estado("ET")).toBe("EN_JUEGO");
    expect(estado("P")).toBe("EN_JUEGO");
    expect(estado("LIVE")).toBe("EN_JUEGO");
  });

  it("separa el entretiempo del juego", () => {
    expect(estado("HT")).toBe("ENTRETIEMPO");
    expect(estado("BT")).toBe("ENTRETIEMPO");
  });

  it("traduce los códigos de partido terminado", () => {
    expect(estado("FT")).toBe("FINALIZADO");
    expect(estado("AET")).toBe("FINALIZADO");
    expect(estado("PEN")).toBe("FINALIZADO");
  });

  it("distingue suspendido, postergado y cancelado", () => {
    // Son tres cosas distintas para el hincha: "se frenó", "se juega otro día"
    // y "no se juega". Aplastarlas en un solo estado sería mentirle.
    expect(estado("SUSP")).toBe("SUSPENDIDO");
    expect(estado("INT")).toBe("SUSPENDIDO");
    expect(estado("ABD")).toBe("SUSPENDIDO");
    expect(estado("PST")).toBe("POSTERGADO");
    expect(estado("CANC")).toBe("CANCELADO");
  });

  it("traduce el ganado en los escritorios", () => {
    expect(estado("AWD")).toBe("WALKOVER");
    expect(estado("WO")).toBe("WALKOVER");
  });

  it("no distingue mayúsculas", () => {
    expect(estado("ft")).toBe("FINALIZADO");
    expect(estado("1h")).toBe("EN_JUEGO");
  });

  it("ante un código nuevo del proveedor, deduce del dato en vez de adivinar", () => {
    // Sin rastro de juego: no empezó.
    expect(estadoDeFixture({ statusShort: "XYZ" })).toBe("PROGRAMADO");
    expect(
      estadoDeFixture({ statusShort: "XYZ", elapsed: null, homeGoals: null }),
    ).toBe("PROGRAMADO");

    // Con minuto o con goles: algo pasó, ya no está por jugarse. Mostrar
    // "hoy 20:00" sobre un partido terminado es la mentira más visible.
    expect(estadoDeFixture({ statusShort: "XYZ", elapsed: 67 })).toBe(
      "FINALIZADO",
    );
    expect(
      estadoDeFixture({ statusShort: "XYZ", homeGoals: 0, awayGoals: 0 }),
    ).toBe("FINALIZADO");
  });
});

describe("estaEnVivo", () => {
  it("incluye el entretiempo: el partido no terminó", () => {
    expect(estaEnVivo("EN_JUEGO")).toBe(true);
    expect(estaEnVivo("ENTRETIEMPO")).toBe(true);
  });

  it("deja afuera todo lo demás", () => {
    expect(estaEnVivo("PROGRAMADO")).toBe(false);
    expect(estaEnVivo("FINALIZADO")).toBe(false);
    expect(estaEnVivo("SUSPENDIDO")).toBe(false);
    expect(estaEnVivo("POSTERGADO")).toBe(false);
  });
});

describe("estaTerminado", () => {
  it("marca lo que ya tiene resultado definitivo", () => {
    expect(estaTerminado("FINALIZADO")).toBe(true);
    expect(estaTerminado("WALKOVER")).toBe(true);
    expect(estaTerminado("CANCELADO")).toBe(true);
  });

  it("un postergado NO está terminado: se va a jugar", () => {
    expect(estaTerminado("POSTERGADO")).toBe(false);
  });

  it("un suspendido tampoco: puede reanudarse", () => {
    expect(estaTerminado("SUSPENDIDO")).toBe(false);
  });
});

describe("mostrarMarcador", () => {
  it("un partido que no arrancó muestra la hora, no un 0-0", () => {
    // El bug clásico: la API manda goals en null y la UI los pinta como 0.
    expect(mostrarMarcador("PROGRAMADO")).toBe(false);
    expect(mostrarMarcador("POSTERGADO")).toBe(false);
    expect(mostrarMarcador("CANCELADO")).toBe(false);
  });

  it("desde el pitazo inicial se muestra el marcador", () => {
    expect(mostrarMarcador("EN_JUEGO")).toBe(true);
    expect(mostrarMarcador("ENTRETIEMPO")).toBe(true);
    expect(mostrarMarcador("FINALIZADO")).toBe(true);
    expect(mostrarMarcador("SUSPENDIDO")).toBe(true);
  });
});
