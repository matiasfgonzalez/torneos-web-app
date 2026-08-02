import { describe, expect, it } from "vitest";

import { agruparPorLiga, totalizar, type FilaAgrupable } from "@/lib/futbol-hoy/agrupar";

/** Fila con los valores mínimos; se sobrescribe lo que importa en cada caso. */
const fila = (extra: Partial<FilaAgrupable> = {}): FilaAgrupable => ({
  fixtureId: 1,
  kickoff: new Date("2026-08-02T20:00:00Z"),
  statusShort: "NS",
  statusLong: "Not Started",
  elapsed: null,
  leagueId: 128,
  leagueName: "Liga Profesional Argentina",
  leagueCountry: "Argentina",
  leagueLogo: null,
  leagueFlag: null,
  leagueRound: "Regular Season - 5",
  homeTeamName: "River Plate",
  homeTeamLogo: null,
  awayTeamName: "Boca Juniors",
  awayTeamLogo: null,
  homeGoals: null,
  awayGoals: null,
  venueName: null,
  venueCity: null,
  ...extra,
});

describe("agruparPorLiga", () => {
  it("junta los partidos de una misma liga en un bloque", () => {
    const grupos = agruparPorLiga([
      fila({ fixtureId: 1 }),
      fila({ fixtureId: 2 }),
      fila({ fixtureId: 3, leagueId: 39, leagueName: "Premier League" }),
    ]);

    expect(grupos).toHaveLength(2);
    expect(grupos.find((g) => g.leagueId === 128)?.partidos).toHaveLength(2);
    expect(grupos.find((g) => g.leagueId === 39)?.partidos).toHaveLength(1);
  });

  it("ordena los partidos de cada liga por hora de comienzo", () => {
    const grupos = agruparPorLiga([
      fila({ fixtureId: 1, kickoff: new Date("2026-08-02T22:00:00Z") }),
      fila({ fixtureId: 2, kickoff: new Date("2026-08-02T18:00:00Z") }),
      fila({ fixtureId: 3, kickoff: new Date("2026-08-02T20:00:00Z") }),
    ]);

    expect(grupos[0].partidos.map((p) => p.fixtureId)).toEqual([2, 3, 1]);
  });

  it("las ligas con partidos en vivo van primero, por encima de la prioridad", () => {
    // Aunque la Liga Profesional (128) está antes que la Premier (39) en la
    // lista de destacadas, si la Premier tiene un partido en vivo va arriba:
    // es lo que el hincha abrió la página a mirar.
    const grupos = agruparPorLiga([
      fila({ fixtureId: 1, leagueId: 128 }),
      fila({
        fixtureId: 2,
        leagueId: 39,
        leagueName: "Premier League",
        leagueCountry: "England",
        statusShort: "1H",
        elapsed: 23,
      }),
    ]);

    expect(grupos[0].leagueId).toBe(39);
    expect(grupos[0].enVivo).toBe(1);
    expect(grupos[1].enVivo).toBe(0);
  });

  it("sin partidos en vivo manda el orden de LIGAS_DESTACADAS", () => {
    const grupos = agruparPorLiga([
      fila({ fixtureId: 1, leagueId: 39, leagueName: "Premier League" }),
      fila({ fixtureId: 2, leagueId: 13, leagueName: "CONMEBOL Libertadores" }),
      fila({ fixtureId: 3, leagueId: 128 }),
    ]);

    expect(grupos.map((g) => g.leagueId)).toEqual([128, 13, 39]);
  });

  it("las ligas no destacadas van al final, ordenadas por país y nombre", () => {
    const grupos = agruparPorLiga([
      fila({ fixtureId: 1, leagueId: 900, leagueName: "Liga Z", leagueCountry: "Zambia" }),
      fila({ fixtureId: 2, leagueId: 901, leagueName: "Liga A", leagueCountry: "Albania" }),
      fila({ fixtureId: 3, leagueId: 128 }),
    ]);

    expect(grupos.map((g) => g.leagueId)).toEqual([128, 901, 900]);
  });

  it("el minuto solo viaja con el partido en curso", () => {
    const grupos = agruparPorLiga([
      fila({ fixtureId: 1, statusShort: "1H", elapsed: 34 }),
      // Un `elapsed: 90` pegado a un partido terminado se leería como "va 90'".
      fila({ fixtureId: 2, statusShort: "FT", elapsed: 90, homeGoals: 2, awayGoals: 1 }),
    ]);

    const [enJuego, terminado] = grupos[0].partidos;
    expect(enJuego.minuto).toBe(34);
    expect(terminado.minuto).toBeNull();
  });

  it("las fechas salen como ISO para poder cruzar al cliente", () => {
    const grupos = agruparPorLiga([fila()]);
    expect(grupos[0].partidos[0].kickoff).toBe("2026-08-02T20:00:00.000Z");
  });

  it("una lista vacía devuelve cero grupos, no explota", () => {
    expect(agruparPorLiga([])).toEqual([]);
  });
});

describe("totalizar", () => {
  it("cuenta partidos, en vivo, finalizados y ligas", () => {
    const grupos = agruparPorLiga([
      fila({ fixtureId: 1, statusShort: "1H", elapsed: 12 }),
      fila({ fixtureId: 2, statusShort: "HT", homeGoals: 1, awayGoals: 0 }),
      fila({ fixtureId: 3, statusShort: "FT", homeGoals: 2, awayGoals: 2 }),
      fila({ fixtureId: 4, statusShort: "NS" }),
      fila({ fixtureId: 5, leagueId: 39, leagueName: "Premier League", statusShort: "FT", homeGoals: 0, awayGoals: 0 }),
    ]);

    expect(totalizar(grupos)).toEqual({
      partidos: 5,
      enVivo: 2, // el entretiempo cuenta: el partido no terminó
      finalizados: 2,
      ligas: 2,
    });
  });

  it("sin partidos, todo en cero", () => {
    expect(totalizar([])).toEqual({
      partidos: 0,
      enVivo: 0,
      finalizados: 0,
      ligas: 0,
    });
  });
});
