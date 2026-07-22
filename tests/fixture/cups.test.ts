import { describe, it, expect } from "vitest";
import {
  CupSeedError,
  planCupRound,
  teamsFromRound,
  teamsFromStandings,
  type RoundMatchResult,
} from "@/lib/fixture/cups";

/** Tabla de N equipos: "t1" es el primero, "t2" el segundo, etc. */
const tabla = (n: number) =>
  Array.from({ length: n }, (_, i) => `t${i + 1}`);

/** Cruce con ganador ya resuelto. */
const cruce = (
  home: string,
  away: string,
  winner: string | null,
): RoundMatchResult => ({
  homeTeamId: home,
  awayTeamId: away,
  winnerTeamId: winner,
});

describe("teamsFromStandings", () => {
  it("toma el tramo 1-based inclusive", () => {
    expect(teamsFromStandings(tabla(20), 1, 8)).toEqual([
      "t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8",
    ]);
    expect(teamsFromStandings(tabla(20), 9, 16)).toEqual([
      "t9", "t10", "t11", "t12", "t13", "t14", "t15", "t16",
    ]);
    expect(teamsFromStandings(tabla(20), 17, 20)).toEqual([
      "t17", "t18", "t19", "t20",
    ]);
  });

  it("recorta si el torneo tiene menos equipos de los previstos", () => {
    // 18 equipos pero la copa de bronce pedía 17..20: entran los dos que hay.
    expect(teamsFromStandings(tabla(18), 17, 20)).toEqual(["t17", "t18"]);
  });

  it("rechaza rangos inválidos", () => {
    expect(() => teamsFromStandings(tabla(10), 0, 4)).toThrow(CupSeedError);
    expect(() => teamsFromStandings(tabla(10), 8, 4)).toThrow(CupSeedError);
    expect(() => teamsFromStandings(tabla(10), 1.5, 4)).toThrow(CupSeedError);
  });
});

describe("teamsFromRound", () => {
  const cuartos = [
    cruce("t1", "t8", "t1"),
    cruce("t4", "t5", "t5"),
    cruce("t2", "t7", "t2"),
    cruce("t3", "t6", "t6"),
  ];

  it("devuelve los ganadores en el orden de los cruces", () => {
    expect(teamsFromRound(cuartos, "WINNERS")).toEqual(["t1", "t5", "t2", "t6"]);
  });

  it("devuelve los perdedores en el orden de los cruces", () => {
    expect(teamsFromRound(cuartos, "LOSERS")).toEqual(["t8", "t4", "t7", "t3"]);
  });

  it("no propaga una ronda con partidos sin definir", () => {
    const conPendiente = [...cuartos, cruce("t9", "t10", null)];
    expect(() => teamsFromRound(conPendiente, "WINNERS")).toThrow(CupSeedError);
    expect(() => teamsFromRound(conPendiente, "WINNERS")).toThrow(/Faltan resultados/);
  });
});

describe("planCupRound — el caso del cliente (10 equipos)", () => {
  it("cuartos toma 1-8 y siembra 1v8, 4v5, 2v7, 3v6", () => {
    const plan = planCupRound({
      source: "STANDINGS",
      standings: tabla(10),
      from: 1,
      to: 8,
    });

    expect(plan.roundName).toBe("Cuartos de final");
    expect(plan.byes).toEqual([]);
    expect(plan.matches.map((m) => [m.homeTeamId, m.awayTeamId])).toEqual([
      ["t1", "t8"],
      ["t4", "t5"],
      ["t2", "t7"],
      ["t3", "t6"],
    ]);
  });

  it("los ganadores arman la semi de la Copa de Oro sin re-sembrar", () => {
    const cuartos = [
      cruce("t1", "t8", "t1"),
      cruce("t4", "t5", "t5"),
      cruce("t2", "t7", "t2"),
      cruce("t3", "t6", "t6"),
    ];

    const oro = planCupRound({ source: "WINNERS", results: cuartos });

    expect(oro.roundName).toBe("Semifinal");
    // Se emparejan en orden de cuadro: 0v1 y 2v3. Si se re-sembrara por tabla,
    // t1 (mejor) jugaría contra t6 (peor) y se rompería el cuadro.
    expect(oro.matches.map((m) => [m.homeTeamId, m.awayTeamId])).toEqual([
      ["t1", "t5"],
      ["t2", "t6"],
    ]);
  });

  it("los perdedores arman la semi de la Copa de Plata", () => {
    const cuartos = [
      cruce("t1", "t8", "t1"),
      cruce("t4", "t5", "t5"),
      cruce("t2", "t7", "t2"),
      cruce("t3", "t6", "t6"),
    ];

    const plata = planCupRound({ source: "LOSERS", results: cuartos });

    expect(plata.roundName).toBe("Semifinal");
    expect(plata.matches.map((m) => [m.homeTeamId, m.awayTeamId])).toEqual([
      ["t8", "t4"],
      ["t7", "t3"],
    ]);
  });

  it("de la semi salen la final y el tercer puesto", () => {
    const semi = [cruce("t1", "t5", "t1"), cruce("t2", "t6", "t6")];

    const final = planCupRound({ source: "WINNERS", results: semi });
    const tercer = planCupRound({ source: "LOSERS", results: semi });

    expect(final.roundName).toBe("Final");
    expect(final.matches.map((m) => [m.homeTeamId, m.awayTeamId])).toEqual([
      ["t1", "t6"],
    ]);
    // El tercer puesto es, literalmente, los perdedores de la semi.
    expect(tercer.matches.map((m) => [m.homeTeamId, m.awayTeamId])).toEqual([
      ["t5", "t2"],
    ]);
  });
});

describe("planCupRound — varias copas por posición (20 equipos)", () => {
  const standings = tabla(20);

  it("Oro 1-8, Plata 9-16 y Bronce 17-20 no comparten ningún equipo", () => {
    const oro = planCupRound({ source: "STANDINGS", standings, from: 1, to: 8 });
    const plata = planCupRound({ source: "STANDINGS", standings, from: 9, to: 16 });
    const bronce = planCupRound({ source: "STANDINGS", standings, from: 17, to: 20 });

    expect(oro.roundName).toBe("Cuartos de final");
    expect(plata.roundName).toBe("Cuartos de final");
    expect(bronce.roundName).toBe("Semifinal");

    const todos = [...oro.teamIds, ...plata.teamIds, ...bronce.teamIds];
    expect(new Set(todos).size).toBe(20);
  });

  it("cada copa se siembra dentro de su propio tramo", () => {
    const plata = planCupRound({ source: "STANDINGS", standings, from: 9, to: 16 });
    // El mejor del tramo (t9) contra el peor (t16), no contra el 1° general.
    expect(plata.matches.map((m) => [m.homeTeamId, m.awayTeamId])).toEqual([
      ["t9", "t16"],
      ["t12", "t13"],
      ["t10", "t15"],
      ["t11", "t14"],
    ]);
  });

  it("un tramo impar deja un bye en vez de fallar", () => {
    const plan = planCupRound({ source: "STANDINGS", standings, from: 1, to: 5 });
    expect(plan.matches.length + plan.byes.length).toBeGreaterThan(0);
    expect([...plan.matches.flatMap((m) => [m.homeTeamId, m.awayTeamId]), ...plan.byes].sort())
      .toEqual(["t1", "t2", "t3", "t4", "t5"].sort());
  });
});

describe("planCupRound — errores de configuración", () => {
  it("un tramo con menos de 2 equipos no arma llave", () => {
    expect(() =>
      planCupRound({ source: "STANDINGS", standings: tabla(10), from: 10, to: 10 }),
    ).toThrow(/al menos 2 equipos/);
  });

  it("STANDINGS sin rango falla con un mensaje accionable", () => {
    expect(() =>
      planCupRound({ source: "STANDINGS", standings: tabla(10) }),
    ).toThrow(/desde y hasta/);
  });

  it("WINNERS sin ronda de origen falla", () => {
    expect(() => planCupRound({ source: "WINNERS" })).toThrow(/ronda de origen/);
  });
});
