"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Swords, Calendar, MapPin } from "lucide-react";
import { IMatch } from "@modules/torneos/types/tournament-teams.types";
import {
  getKnockoutPhaseOrder,
  getLegacyPhaseName,
  isKnockoutPhase,
} from "@/lib/standings/phase-utils";

interface KnockoutBracketProps {
  matches: IMatch[];
  className?: string;
  title?: string;
  description?: string;
}

interface GroupedMatch {
  phaseName: string;
  phaseOrder: number;
  matches: IMatch[];
}

const formatMatchDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
};

/**
 * Componente para visualizar partidos de eliminación directa
 * Agrupa los partidos por fase (octavos, cuartos, semi, final)
 */
export function KnockoutBracket({
  matches,
  className = "",
  title = "Fase Final",
  description = "Partidos de eliminación directa",
}: Readonly<KnockoutBracketProps>) {
  // Filtrar solo partidos de eliminación directa y agrupar por fase
  const groupedMatches = useMemo((): GroupedMatch[] => {
    const knockoutMatches = matches.filter((match) =>
      isKnockoutPhase(match.phase?.name),
    );

    const grouped = new Map<string, IMatch[]>();

    knockoutMatches.forEach((match) => {
      const phaseName = match.phase?.name || "CRUCES";
      const phaseMatches = grouped.get(phaseName) || [];
      phaseMatches.push(match);
      grouped.set(phaseName, phaseMatches);
    });

    return Array.from(grouped.entries())
      .map(([phaseName, phaseMatches]) => ({
        phaseName,
        phaseOrder: getKnockoutPhaseOrder(phaseName),
        matches: [...phaseMatches].sort(
          (a, b) =>
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
        ),
      }))
      .sort((a, b) => a.phaseOrder - b.phaseOrder);
  }, [matches]);

  if (groupedMatches.length === 0) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "FINALIZADO":
        return (
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
            Finalizado
          </Badge>
        );
      case "EN_JUEGO":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 animate-pulse">
            En Juego
          </Badge>
        );
      case "PROGRAMADO":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Programado
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card
      className={`relative bg-white dark:bg-gray-900/80 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden rounded-2xl backdrop-blur-sm ${className}`}
    >
      {/* Gradient accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500" />

      <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-500/25">
            <Swords className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-gray-900 dark:text-white text-xl">
              {title}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-8">
          {groupedMatches.map((group) => (
            <div key={group.phaseName}>
              {/* Encabezado de fase */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
                <Badge
                  className={`px-4 py-1.5 text-sm font-bold ${
                    group.phaseName === "FINAL"
                      ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0"
                      : group.phaseName === "SEMIFINAL"
                        ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0"
                        : "bg-gradient-to-r from-[#ad45ff] to-[#c77dff] text-white border-0"
                  }`}
                >
                  {group.phaseName === "FINAL" && (
                    <Trophy className="w-4 h-4 mr-1" />
                  )}
                  {getLegacyPhaseName(group.phaseName)}
                </Badge>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
              </div>

              {/* Partidos de esta fase */}
              <div
                className={`grid gap-4 ${
                  group.phaseName === "FINAL"
                    ? "grid-cols-1 max-w-2xl mx-auto"
                    : group.matches.length === 1
                      ? "grid-cols-1 max-w-2xl mx-auto"
                      : "grid-cols-1 md:grid-cols-2"
                }`}
              >
                {group.matches.map((match) => {
                  const homeScore = match.homeScore ?? 0;
                  const awayScore = match.awayScore ?? 0;
                  const isHomeWinner =
                    match.status === "FINALIZADO" && homeScore > awayScore;
                  const isAwayWinner =
                    match.status === "FINALIZADO" && awayScore > homeScore;
                  const hasPenalties = match.penaltyWinnerTeamId != null;

                  return (
                    <div
                      key={match.id}
                      className={`relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 border ${
                        group.phaseName === "FINAL"
                          ? "border-yellow-300 dark:border-yellow-600/50 shadow-lg shadow-yellow-500/10"
                          : "border-gray-100 dark:border-gray-700"
                      } hover:shadow-xl transition-all duration-300`}
                    >
                      {/* Fecha y estado */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>{formatMatchDate(match.dateTime)}</span>
                        </div>
                        {getStatusBadge(match.status)}
                      </div>

                      {/* Equipos y marcador */}
                      <div className="space-y-2">
                        {/* Equipo Local */}
                        <div
                          className={`flex items-center justify-between p-2 rounded-xl ${
                            isHomeWinner ||
                            (hasPenalties &&
                              match.penaltyWinnerTeamId === match.homeTeamId)
                              ? "bg-green-50 dark:bg-green-900/20 ring-1 ring-green-400/50"
                              : "bg-gray-50 dark:bg-gray-800"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white dark:bg-gray-700 shadow-sm">
                              <img
                                src={
                                  match.homeTeam?.team?.logoUrl ||
                                  "/placeholder.svg"
                                }
                                alt={match.homeTeam?.team?.name || "Local"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span
                              className={`font-medium text-sm ${
                                isHomeWinner ||
                                (hasPenalties &&
                                  match.penaltyWinnerTeamId ===
                                    match.homeTeamId)
                                  ? "text-green-700 dark:text-green-400"
                                  : "text-gray-900 dark:text-white"
                              }`}
                            >
                              {match.homeTeam?.team?.name || "Por definir"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {match.status === "FINALIZADO" && (
                              <span
                                className={`font-bold text-lg ${
                                  isHomeWinner
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {homeScore}
                              </span>
                            )}
                            {hasPenalties &&
                              match.penaltyWinnerTeamId ===
                                match.homeTeamId && (
                                <Trophy className="w-4 h-4 text-yellow-500" />
                              )}
                          </div>
                        </div>

                        {/* Equipo Visitante */}
                        <div
                          className={`flex items-center justify-between p-2 rounded-xl ${
                            isAwayWinner ||
                            (hasPenalties &&
                              match.penaltyWinnerTeamId === match.awayTeamId)
                              ? "bg-green-50 dark:bg-green-900/20 ring-1 ring-green-400/50"
                              : "bg-gray-50 dark:bg-gray-800"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white dark:bg-gray-700 shadow-sm">
                              <img
                                src={
                                  match.awayTeam?.team?.logoUrl ||
                                  "/placeholder.svg"
                                }
                                alt={match.awayTeam?.team?.name || "Visitante"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span
                              className={`font-medium text-sm ${
                                isAwayWinner ||
                                (hasPenalties &&
                                  match.penaltyWinnerTeamId ===
                                    match.awayTeamId)
                                  ? "text-green-700 dark:text-green-400"
                                  : "text-gray-900 dark:text-white"
                              }`}
                            >
                              {match.awayTeam?.team?.name || "Por definir"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {match.status === "FINALIZADO" && (
                              <span
                                className={`font-bold text-lg ${
                                  isAwayWinner
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {awayScore}
                              </span>
                            )}
                            {hasPenalties &&
                              match.penaltyWinnerTeamId ===
                                match.awayTeamId && (
                                <Trophy className="w-4 h-4 text-yellow-500" />
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Penales si aplica */}
                      {hasPenalties && (
                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>Penales:</span>
                            <span className="font-bold">
                              {match.penaltyScoreHome} -{" "}
                              {match.penaltyScoreAway}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Estadio */}
                      {match.stadium && (
                        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{match.stadium}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default KnockoutBracket;
