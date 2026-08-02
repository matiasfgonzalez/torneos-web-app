import { describe, expect, it } from "vitest";

import { erroresDeApi, mapearFixture, mapearRespuesta } from "@/lib/futbol-hoy/mapeo";
import type { ApiFootballFixture } from "@/lib/futbol-hoy/types";

/** Un partido crudo con la forma real de la respuesta de API-Football. */
const crudo = (extra: Partial<ApiFootballFixture> = {}): ApiFootballFixture => ({
  fixture: {
    id: 1386496,
    date: "2026-08-02T19:00:00-03:00",
    status: { short: "NS", long: "Not Started", elapsed: null },
    venue: { name: "Estadio Monumental", city: "Buenos Aires" },
  },
  league: {
    id: 128,
    name: "Liga Profesional Argentina",
    country: "Argentina",
    logo: "https://media.api-sports.io/football/leagues/128.png",
    flag: "https://media.api-sports.io/flags/ar.svg",
    round: "Regular Season - 5",
  },
  teams: {
    home: { id: 435, name: "River Plate", logo: "https://media.api-sports.io/football/teams/435.png" },
    away: { id: 451, name: "Boca Juniors", logo: "https://media.api-sports.io/football/teams/451.png" },
  },
  goals: { home: null, away: null },
  ...extra,
});

describe("mapearFixture", () => {
  it("traduce un partido completo", () => {
    const fila = mapearFixture(crudo());

    expect(fila).not.toBeNull();
    expect(fila?.fixtureId).toBe(1386496);
    expect(fila?.kickoff.toISOString()).toBe("2026-08-02T22:00:00.000Z");
    expect(fila?.leagueName).toBe("Liga Profesional Argentina");
    expect(fila?.homeTeamName).toBe("River Plate");
    expect(fila?.awayTeamName).toBe("Boca Juniors");
    expect(fila?.venueCity).toBe("Buenos Aires");
  });

  it("el día sale del instante, no del texto de la fecha", () => {
    // 21:00 de Buenos Aires del 2 = 00:00 UTC del 3. El día tiene que seguir
    // siendo el 2: es el criterio con el que se agrupa toda la sección.
    const fila = mapearFixture(
      crudo({
        fixture: {
          id: 1,
          date: "2026-08-02T21:00:00-03:00",
          status: { short: "NS" },
        },
      }),
    );

    expect(fila?.matchDay).toBe("2026-08-02");
  });

  it("normaliza el código de estado a mayúsculas", () => {
    const fila = mapearFixture(
      crudo({
        fixture: { id: 1, date: "2026-08-02T19:00:00Z", status: { short: "ft" } },
      }),
    );

    expect(fila?.statusShort).toBe("FT");
  });

  it("los campos de adorno faltantes viajan como null, no rompen la fila", () => {
    const fila = mapearFixture({
      fixture: { id: 7, date: "2026-08-02T19:00:00Z", status: { short: "NS" } },
      league: { id: 128, name: "Liga Profesional Argentina" },
      teams: { home: { name: "River Plate" }, away: { name: "Boca Juniors" } },
    });

    expect(fila).not.toBeNull();
    expect(fila?.leagueLogo).toBeNull();
    expect(fila?.homeTeamLogo).toBeNull();
    expect(fila?.venueName).toBeNull();
    expect(fila?.leagueCountry).toBeNull();
    // Sin id de equipo se usa 0: el nombre es lo que se muestra, y descartar el
    // partido entero por un id que la UI no usa sería peor.
    expect(fila?.homeTeamId).toBe(0);
  });

  it("los goles en null NO se convierten en cero", () => {
    // Un 0-0 y un partido sin empezar son cosas distintas; aplastarlos acá
    // haría que la UI mostrara un marcador inventado.
    const fila = mapearFixture(crudo());
    expect(fila?.homeGoals).toBeNull();
    expect(fila?.awayGoals).toBeNull();

    const jugado = mapearFixture(crudo({ goals: { home: 0, away: 0 } }));
    expect(jugado?.homeGoals).toBe(0);
    expect(jugado?.awayGoals).toBe(0);
  });

  it("los textos vacíos o en blanco cuentan como ausentes", () => {
    const fila = mapearFixture(
      crudo({
        fixture: {
          id: 1,
          date: "2026-08-02T19:00:00Z",
          status: { short: "NS" },
          venue: { name: "   ", city: "" },
        },
      }),
    );

    expect(fila?.venueName).toBeNull();
    expect(fila?.venueCity).toBeNull();
  });

  it("descarta el partido si le falta algo imprescindible", () => {
    expect(mapearFixture({})).toBeNull();
    expect(mapearFixture(crudo({ fixture: { date: "2026-08-02T19:00:00Z", status: { short: "NS" } } }))).toBeNull();
    expect(
      mapearFixture(crudo({ fixture: { id: 1, date: "no es una fecha", status: { short: "NS" } } })),
    ).toBeNull();
    expect(mapearFixture(crudo({ league: { name: "Sin id" } }))).toBeNull();
    expect(
      mapearFixture(crudo({ teams: { home: { name: "River Plate" }, away: {} } })),
    ).toBeNull();
  });
});

describe("mapearRespuesta", () => {
  it("descarta las filas rotas y conserva el resto", () => {
    // Un partido roto entre varios no puede dejar la página entera vacía.
    const filas = mapearRespuesta({
      response: [crudo(), {}, crudo({ fixture: { id: 2, date: "2026-08-02T20:00:00Z", status: { short: "FT" } } })],
    });

    expect(filas).toHaveLength(2);
    expect(filas.map((f) => f.fixtureId)).toEqual([1386496, 2]);
  });

  it("deduplica por fixtureId", () => {
    const filas = mapearRespuesta({ response: [crudo(), crudo()] });
    expect(filas).toHaveLength(1);
  });

  it("una respuesta sin `response` devuelve lista vacía, no explota", () => {
    expect(mapearRespuesta({})).toEqual([]);
    expect(mapearRespuesta({ response: undefined })).toEqual([]);
  });
});

describe("erroresDeApi", () => {
  it("el array vacío del caso feliz no es un error", () => {
    expect(erroresDeApi({ errors: [] })).toBeNull();
    expect(erroresDeApi({})).toBeNull();
  });

  it("detecta el objeto de errores que llega con status 200", () => {
    // Este es el caso que hace falta cubrir: API-Football responde 200 OK con
    // `errors` poblado y `response: []`. Mirar solo el status HTTP haría pasar
    // "se acabó la cuota" por "hoy no hay partidos".
    expect(
      erroresDeApi({
        errors: { requests: "You have reached the request limit for the day" },
        response: [],
      }),
    ).toBe("requests: You have reached the request limit for the day");
  });

  it("detecta la clave inválida", () => {
    expect(erroresDeApi({ errors: { token: "Invalid API key" } })).toBe(
      "token: Invalid API key",
    );
  });

  it("junta varios errores en un solo mensaje", () => {
    expect(erroresDeApi({ errors: ["uno", "dos"] })).toBe("uno · dos");
  });
});
