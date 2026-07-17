import "server-only";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { makeStandingsComparator } from "@/lib/standings/config";

/**
 * Exportables del torneo (S8): la fuente única de datos para el PDF imprimible
 * (tabla + fixture) y el CSV de planteles. Un solo `select` para las tres
 * salidas, así el documento y el CSV nunca muestran cosas distintas.
 *
 * Deliberadamente **no incluye el DNI** de los jugadores: la ficha es global y
 * el DNI nunca es público (regla N12 / legal). El CSV lleva nombre, dorsal,
 * posición y capitán — lo mismo que ya se ve en la web.
 */
const exportSelect = {
  id: true,
  name: true,
  logoUrl: true,
  locality: true,
  status: true,
  format: true,
  tiebreakers: true,
  startDate: true,
  endDate: true,
  organization: { select: { name: true, logoUrl: true, slug: true } },
  tournamentTeams: {
    select: {
      id: true,
      teamId: true,
      group: true,
      matchesPlayed: true,
      wins: true,
      draws: true,
      losses: true,
      goalsFor: true,
      goalsAgainst: true,
      goalDifference: true,
      points: true,
      team: { select: { name: true, logoUrl: true } },
      teamPlayer: {
        select: {
          number: true,
          position: true,
          isCaptain: true,
          player: { select: { name: true, number: true, position: true } },
        },
      },
    },
  },
  matches: {
    select: {
      id: true,
      dateTime: true,
      status: true,
      homeScore: true,
      awayScore: true,
      stadium: true,
      city: true,
      roundNumber: true,
      penaltyScoreHome: true,
      penaltyScoreAway: true,
      homeTeam: { select: { team: { select: { name: true } } } },
      awayTeam: { select: { team: { select: { name: true } } } },
      tournamentPhase: { select: { name: true, type: true } },
    },
    orderBy: { dateTime: "asc" },
  },
} satisfies Prisma.TournamentSelect;

export type TournamentExportData = Prisma.TournamentGetPayload<{
  select: typeof exportSelect;
}>;

type ExportTeam = TournamentExportData["tournamentTeams"][number];

export async function getTournamentExportData(
  id: string,
): Promise<TournamentExportData | null> {
  return db.tournament.findFirst({
    where: { id, deletedAt: null },
    select: exportSelect,
  });
}

// ---------------------------------------------------------------------------
// Tabla de posiciones
// ---------------------------------------------------------------------------

export interface ExportStandingRow {
  position: number;
  teamName: string;
  teamLogoUrl: string | null;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface StandingsGroup {
  /** null = torneo sin grupos (tabla única). */
  group: string | null;
  rows: ExportStandingRow[];
}

function teamToRow(team: ExportTeam): Omit<ExportStandingRow, "position"> {
  return {
    teamName: team.team?.name ?? "Equipo",
    teamLogoUrl: team.team?.logoUrl ?? null,
    matchesPlayed: team.matchesPlayed,
    wins: team.wins,
    draws: team.draws,
    losses: team.losses,
    goalsFor: team.goalsFor,
    goalsAgainst: team.goalsAgainst,
    goalDifference: team.goalDifference,
    points: team.points,
  };
}

/**
 * Ordena la tabla con el MISMO criterio de desempate del torneo que usa la web
 * (`makeStandingsComparator`) — así el PDF nunca contradice a la pantalla. Si el
 * torneo usa grupos, devuelve una tabla por grupo; si no, una sola (group=null).
 */
export function buildStandings(
  data: TournamentExportData,
): StandingsGroup[] {
  const comparator = makeStandingsComparator(data.tiebreakers);
  const teams = data.tournamentTeams;

  const distinctGroups = Array.from(
    new Set(teams.map((t) => t.group).filter((g): g is string => !!g)),
  ).sort((a, b) => a.localeCompare(b));

  const rankGroup = (subset: ExportTeam[]): ExportStandingRow[] =>
    [...subset]
      .map(teamToRow)
      .sort(comparator)
      .map((row, i) => ({ ...row, position: i + 1 }));

  if (distinctGroups.length >= 2) {
    const groups: StandingsGroup[] = distinctGroups.map((g) => ({
      group: g,
      rows: rankGroup(teams.filter((t) => t.group === g)),
    }));
    const ungrouped = teams.filter((t) => !t.group);
    if (ungrouped.length > 0) {
      groups.push({ group: "Sin grupo", rows: rankGroup(ungrouped) });
    }
    return groups;
  }

  return [{ group: null, rows: rankGroup(teams) }];
}

// ---------------------------------------------------------------------------
// CSV de planteles
// ---------------------------------------------------------------------------

/** Escapa una celda CSV: entrecomilla si tiene coma, comilla o salto de línea. */
function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * CSV de planteles del torneo. BOM inicial para que Excel lea los acentos como
 * UTF-8. Una fila por jugador, ordenado por equipo y luego por dorsal.
 */
export function buildRosterCsv(data: TournamentExportData): string {
  const header = ["Equipo", "Grupo", "N°", "Jugador", "Posición", "Capitán"];
  const rows: string[][] = [header];

  const teams = [...data.tournamentTeams].sort((a, b) =>
    (a.team?.name ?? "").localeCompare(b.team?.name ?? ""),
  );

  for (const tt of teams) {
    const teamName = tt.team?.name ?? "";
    const group = tt.group ?? "";
    const players = [...tt.teamPlayer].sort(
      (a, b) =>
        (a.number ?? a.player.number ?? 999) -
        (b.number ?? b.player.number ?? 999),
    );

    if (players.length === 0) {
      rows.push([teamName, group, "", "(sin jugadores cargados)", "", ""]);
      continue;
    }

    for (const tp of players) {
      const number = tp.number ?? tp.player.number;
      rows.push([
        teamName,
        group,
        number != null ? String(number) : "",
        tp.player.name,
        tp.position ?? tp.player.position ?? "",
        tp.isCaptain ? "Sí" : "",
      ]);
    }
  }

  const body = rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
  return `﻿${body}`; // BOM UTF-8 para Excel
}

/** Nombre de archivo seguro (sin acentos ni símbolos) para las descargas. */
export function exportFileSlug(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "torneo"
  );
}
