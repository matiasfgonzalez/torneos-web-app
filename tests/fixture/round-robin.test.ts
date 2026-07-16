import { describe, expect, it } from "vitest";
import { roundRobinRounds } from "@/lib/fixture/round-robin";
import type { PlannedMatch } from "@/lib/fixture/types";

const teams = (n: number) =>
  Array.from({ length: n }, (_, i) => `t${i + 1}`);

/** Clave del cruce sin importar quién fue local: detecta pares repetidos. */
const pairKey = (m: PlannedMatch) =>
  [m.homeTeamId, m.awayTeamId].sort((a, b) => a.localeCompare(b)).join("|");

describe("roundRobinRounds — cantidad par", () => {
  it("genera n-1 jornadas de n/2 partidos", () => {
    const rounds = roundRobinRounds(teams(6));
    expect(rounds).toHaveLength(5);
    rounds.forEach((round) => expect(round).toHaveLength(3));
  });

  it("cada par se cruza exactamente una vez", () => {
    const matches = roundRobinRounds(teams(6)).flat();
    const keys = matches.map(pairKey);

    // 6 equipos → C(6,2) = 15 cruces distintos
    expect(matches).toHaveLength(15);
    expect(new Set(keys).size).toBe(15);
  });

  it("ningún equipo juega dos veces en la misma jornada", () => {
    roundRobinRounds(teams(8)).forEach((round) => {
      const playing = round.flatMap((m) => [m.homeTeamId, m.awayTeamId]);
      expect(new Set(playing).size).toBe(playing.length);
    });
  });

  it("todos los equipos juegan en cada jornada", () => {
    roundRobinRounds(teams(8)).forEach((round) => {
      const playing = new Set(round.flatMap((m) => [m.homeTeamId, m.awayTeamId]));
      expect(playing.size).toBe(8);
    });
  });
});

describe("roundRobinRounds — cantidad impar", () => {
  it("genera n jornadas y cada equipo descansa exactamente una vez", () => {
    const rounds = roundRobinRounds(teams(5));
    expect(rounds).toHaveLength(5);

    // Cada jornada: 2 partidos (4 equipos) y uno libre
    rounds.forEach((round) => expect(round).toHaveLength(2));

    const restsPerTeam = new Map<string, number>();
    rounds.forEach((round) => {
      const playing = new Set(round.flatMap((m) => [m.homeTeamId, m.awayTeamId]));
      teams(5)
        .filter((t) => !playing.has(t))
        .forEach((t) => restsPerTeam.set(t, (restsPerTeam.get(t) ?? 0) + 1));
    });

    teams(5).forEach((t) => expect(restsPerTeam.get(t)).toBe(1));
  });

  it("no inventa partidos contra el equipo fantasma", () => {
    const matches = roundRobinRounds(teams(5)).flat();
    const ids = matches.flatMap((m) => [m.homeTeamId, m.awayTeamId]);
    expect(ids).not.toContain("__BYE__");
    // C(5,2) = 10 cruces
    expect(matches).toHaveLength(10);
  });
});

describe("roundRobinRounds — localía", () => {
  // Cada equipo juega n-1 partidos (impar), así que el reparto perfecto no
  // existe: el mínimo alcanzable es 1 de diferencia. Un bug real de la primera
  // versión (alternar por jornada + índice de cruce) dejaba a un equipo con los
  // 5 partidos de visitante y este test lo agarró.
  it.each([4, 6, 8, 10, 12])(
    "con %i equipos nadie se desbalancea más de un partido",
    (n) => {
      const matches = roundRobinRounds(teams(n)).flat();

      teams(n).forEach((team) => {
        const home = matches.filter((m) => m.homeTeamId === team).length;
        const away = matches.filter((m) => m.awayTeamId === team).length;
        expect(home + away).toBe(n - 1);
        expect(Math.abs(home - away)).toBeLessThanOrEqual(1);
      });
    },
  );

  it("con cantidad impar tampoco se desbalancea más de un partido", () => {
    const matches = roundRobinRounds(teams(7)).flat();
    teams(7).forEach((team) => {
      const home = matches.filter((m) => m.homeTeamId === team).length;
      const away = matches.filter((m) => m.awayTeamId === team).length;
      expect(Math.abs(home - away)).toBeLessThanOrEqual(1);
    });
  });
});

describe("roundRobinRounds — ida y vuelta", () => {
  it("duplica las jornadas y numera la vuelta a continuación", () => {
    const rounds = roundRobinRounds(teams(4), { homeAndAway: true });
    expect(rounds).toHaveLength(6); // (4-1) * 2

    const numbers = rounds.flat().map((m) => m.roundNumber);
    expect(Math.min(...numbers)).toBe(1);
    expect(Math.max(...numbers)).toBe(6);
  });

  it("cada par se cruza dos veces, una de local cada uno", () => {
    const matches = roundRobinRounds(teams(4), { homeAndAway: true }).flat();
    expect(matches).toHaveLength(12); // C(4,2) * 2

    teams(4).forEach((team) => {
      const home = matches.filter((m) => m.homeTeamId === team).length;
      const away = matches.filter((m) => m.awayTeamId === team).length;
      // Ida y vuelta sí reparte exacto: 3 de local y 3 de visitante
      expect(home).toBe(3);
      expect(away).toBe(3);
    });
  });

  it("el cruce de vuelta invierte la localía de la ida", () => {
    const rounds = roundRobinRounds(teams(4), { homeAndAway: true });
    const firstLeg = rounds.slice(0, 3).flat();
    const secondLeg = rounds.slice(3).flat();

    firstLeg.forEach((match) => {
      const reverse = secondLeg.find(
        (m) =>
          m.homeTeamId === match.awayTeamId && m.awayTeamId === match.homeTeamId,
      );
      expect(reverse).toBeDefined();
    });
  });
});

describe("roundRobinRounds — bordes", () => {
  it("menos de 2 equipos no genera nada", () => {
    expect(roundRobinRounds([])).toEqual([]);
    expect(roundRobinRounds(["solo"])).toEqual([]);
  });

  it("2 equipos: una jornada de un partido", () => {
    const rounds = roundRobinRounds(teams(2));
    expect(rounds).toHaveLength(1);
    expect(rounds[0]).toHaveLength(1);
  });

  it("escala a 20 equipos sin repetir cruces", () => {
    const matches = roundRobinRounds(teams(20)).flat();
    expect(matches).toHaveLength(190); // C(20,2)
    expect(new Set(matches.map(pairKey)).size).toBe(190);
  });
});
