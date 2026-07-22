import { TournamentFormat } from "@prisma/client";
import { distributeIntoGroups, groupByExisting, groupName } from "./groups";
import { knockoutFirstRound } from "./knockout";
import { roundRobinRounds } from "./round-robin";
import { shuffle } from "./shuffle";
import { strategyFor, reasonWithoutGenerator } from "./formats";
import type { FixtureOptions, FixturePlan, PlannedMatch, PlannedPhase } from "./types";

/** Aplana jornadas en partidos (el `roundNumber` ya viaja en cada uno). */
const flatten = (rounds: PlannedMatch[][]): PlannedMatch[] => rounds.flat();

/**
 * Genera el plan de fixture de un torneo (S1).
 *
 * Puro: mismos ids + misma semilla = mismo plan. No escribe nada; el server
 * action decide si el torneo está en condiciones y persiste el resultado.
 *
 * Lanza si el formato no tiene generador o si faltan equipos: son errores del
 * llamador, y es preferible fallar acá que escribir medio fixture.
 */
export function generateFixture(
  format: TournamentFormat,
  teamIds: readonly string[],
  options: FixtureOptions,
): FixturePlan {
  const strategy = strategyFor(format);
  if (!strategy) {
    throw new Error(
      reasonWithoutGenerator(format) ??
        "Este formato no tiene generador de fixture.",
    );
  }

  if (teamIds.length < 2) {
    throw new Error("Se necesitan al menos 2 equipos inscriptos.");
  }

  // El sorteo se hace una sola vez, antes de repartir: así grupos y siembra
  // parten del mismo orden y la semilla reproduce el fixture completo.
  const drawn = shuffle(teamIds, options.seed);

  if (strategy === "ROUND_ROBIN") {
    const rounds = roundRobinRounds(drawn, {
      homeAndAway: options.homeAndAway,
    });
    const matches = flatten(rounds);

    return {
      phases: [
        {
          name: options.homeAndAway ? "Liga (ida y vuelta)" : "Liga",
          type: "LEAGUE",
          order: 1,
          matches,
        },
      ],
      byes: [],
      totalMatches: matches.length,
    };
  }

  if (strategy === "GROUPS") {
    // Dos caminos: o los grupos ya están asignados y se respetan, o el sistema
    // los reparte. La diferencia importa: repartir **pisa** la asignación
    // existente, y como los partidos se arman sobre los grupos resultantes,
    // corregirlos después no arregla el fixture.
    const zonas = options.existingGroups
      ? groupByExisting(drawn, options.existingGroups)
      : distributeIntoGroups(drawn, options.groupCount ?? 2).map(
          (teamIds, index) => ({ name: groupName(index), teamIds }),
        );

    const groupAssignments: Record<string, string> = {};
    const matches: PlannedMatch[] = [];

    zonas.forEach(({ name, teamIds: groupTeams }) => {
      groupTeams.forEach((teamId) => {
        groupAssignments[teamId] = name;
      });

      // Cada grupo corre su propio round-robin; las jornadas de todos los
      // grupos comparten numeración para que "fecha 3" sea la misma para todos.
      const groupRounds = roundRobinRounds(groupTeams, {
        homeAndAway: options.homeAndAway,
      });
      flatten(groupRounds).forEach((match) => {
        matches.push({ ...match, group: name });
      });
    });

    return {
      phases: [
        {
          name: "Fase de grupos",
          type: "GROUP",
          order: 1,
          matches,
        },
      ],
      // Si los grupos ya venían asignados no se devuelven: el server no tiene
      // nada que reescribir, y no mandarlos es la garantía de que no los pise.
      groupAssignments: options.existingGroups ? undefined : groupAssignments,
      byes: [],
      totalMatches: matches.length,
    };
  }

  // KNOCKOUT — solo la primera ronda (ver knockout.ts: no se puede crear una
  // semifinal antes de saber quién la juega).
  const { matches, byes, roundName } = knockoutFirstRound(drawn);

  return {
    phases: [
      {
        name: roundName,
        type: "KNOCKOUT",
        order: 1,
        matches,
      },
    ],
    byes,
    totalMatches: matches.length,
  };
}
