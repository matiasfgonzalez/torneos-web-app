"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Trophy,
  Calendar,
  Goal,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { formatDate } from "@/lib/formatDate";

interface MatchCardProps {
  partido: any;
  teamId: string;
  teamLogo?: string | null;
}

export default function MatchCard({ partido, teamId, teamLogo }: MatchCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isLocal = partido.esLocal;

  // Calcular resultado desde la perspectiva del equipo visible
  const myScore = isLocal ? partido.homeScore : partido.awayScore;
  const rivalScore = isLocal ? partido.awayScore : partido.homeScore;

  const isPlayed = partido.status === "FINALIZADO";
  const isWin =
    isPlayed && myScore !== null && rivalScore !== null && myScore > rivalScore;
  const isLoss =
    isPlayed && myScore !== null && rivalScore !== null && myScore < rivalScore;
  const isDraw =
    isPlayed &&
    myScore !== null &&
    rivalScore !== null &&
    myScore === rivalScore;

  // Goles del partido ordenados por minuto
  const allGoals = partido.goals || [];
  const allCards = partido.cards || [];

  // Función para obtener si un evento pertenece al equipo LOCAL del partido
  const isHomeEvent = (event: any) => {
    if (event.teamPlayer?.tournamentTeamId) {
      return event.teamPlayer.tournamentTeamId === partido.homeTeamId;
    }
    // Fallback: si no tenemos ID de torneo, difícil saber sin más contexto.
    // Asumimos false si falla.
    return false;
  };

  const hasDetails = (allGoals.length > 0 || allCards.length > 0) && isPlayed;

  return (
    <Card className="group relative bg-white dark:bg-gray-900 overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-[#ad45ff]/50 transition-all duration-300 hover:shadow-lg rounded-2xl">
      {/* Top Banner Status Strip */}
      <div
        className={`h-1.5 w-full ${
          !isPlayed
            ? "bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600"
            : isWin
              ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
              : isLoss
                ? "bg-gradient-to-r from-rose-500 to-red-600"
                : "bg-gradient-to-r from-amber-400 to-amber-600"
        }`}
      />

      <CardContent className="p-0">
        {/* Header: Date & Tournament */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800/50">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(partido.dateTime, "dd MMM yyyy")}</span>
            {partido.time && (
              <>
                <span>•</span>
                <Clock className="w-3.5 h-3.5" />
                <span>{partido.time}</span>
              </>
            )}
          </div>
          {partido.torneoNombre && (
            <Badge
              variant="outline"
              className="text-[10px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-[#ad45ff] font-bold px-2 py-0.5"
            >
              <Trophy className="w-3 h-3 mr-1" />
              {partido.torneoNombre}
            </Badge>
          )}
        </div>

        {/* Match Content */}
        <div className="p-5">
          <div className="flex items-center justify-between gap-4">
            {/* Local Team (Left) */}
            <div className="flex-1 flex flex-col items-center text-center gap-2 min-w-0">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                <div className="absolute -inset-2 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-full blur-sm opacity-50" />
                <div className="relative w-full h-full p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                  <img
                    src={
                      (partido.esLocal
                        ? teamLogo
                        : partido.equipoRival?.logoUrl) ||
                      (partido.esLocal
                        ? partido.homeTeam?.team?.logoUrl
                        : partido.awayTeam?.team?.logoUrl) ||
                      "/placeholder.svg"
                    }
                    alt="Home Team"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight truncate w-full px-1">
                {partido.esLocal
                  ? "Tu Equipo"
                  : partido.equipoRival?.name || "Rival"}
              </span>
            </div>

            {/* Score / VS (Center) */}
            <div className="flex flex-col items-center justify-center gap-1 min-w-[80px]">
              {isPlayed ? (
                <div className="flex items-center gap-2">
                  <span
                    className={`text-3xl sm:text-4xl font-black tracking-tighter ${
                      isPlayed
                        ? isLocal
                          ? isWin
                            ? "text-emerald-500"
                            : isLoss
                              ? "text-rose-500"
                              : "text-amber-500"
                          : !isWin
                            ? "text-gray-900 dark:text-gray-100"
                            : "text-gray-400"
                        : "text-gray-400"
                    }`}
                  >
                    {partido.homeScore ?? 0}
                  </span>
                  <span className="text-gray-300 dark:text-gray-600 font-light text-2xl">
                    -
                  </span>
                  <span className="text-3xl sm:text-4xl font-black tracking-tighter text-gray-900 dark:text-gray-100">
                    {partido.awayScore ?? 0}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black text-gray-300 dark:text-gray-700">
                    VS
                  </span>
                </div>
              )}

              <Badge
                variant={isPlayed ? "default" : "outline"}
                className={`text-[10px] px-2 py-0.5 h-5 uppercase tracking-wider font-bold border-0 ${
                  !isPlayed
                    ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    : isWin
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                      : isLoss
                        ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                        : isDraw
                          ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                          : "bg-gray-100 text-gray-600"
                }`}
              >
                {partido.status === "FINALIZADO"
                  ? isWin
                    ? "Victoria"
                    : isLoss
                      ? "Derrota"
                      : "Empate"
                  : partido.status}
              </Badge>
            </div>

            {/* Away Team (Right) */}
            <div className="flex-1 flex flex-col items-center text-center gap-2 min-w-0">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                <div className="absolute -inset-2 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-full blur-sm opacity-50" />
                <div className="relative w-full h-full p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                  <img
                    src={
                      (!partido.esLocal
                        ? teamLogo
                        : partido.equipoRival?.logoUrl) ||
                      "/placeholder.svg"
                    }
                    alt="Away Team"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight truncate w-full px-1">
                {!partido.esLocal
                  ? "Tu Equipo"
                  : partido.equipoRival?.name || "Rival"}
              </span>
            </div>
          </div>
        </div>

        {/* Detail Toggle & Content */}
        {hasDetails && (
          <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-4 space-y-6 text-sm">
                
                {/* Referees */}
                {partido.referees && partido.referees.length > 0 && (
                   <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 p-2 rounded-lg w-full">
                      <div className="p-1 bg-gray-200 dark:bg-gray-700 rounded-md">
                        <Trophy className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                      </div>
                      <span className="font-medium">Árbitro:</span>
                      <span className="text-gray-900 dark:text-gray-200 font-semibold">
                        {partido.referees.find((r: any) => r.role === "Principal")?.referee?.name || partido.referees[0]?.referee?.name}
                      </span>
                   </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Goals */}
                    {allGoals.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-1">
                          <Goal className="w-3.5 h-3.5" /> Goles
                        </div>
                        <div className="space-y-2">
                          {allGoals.map((goal: any) => {
                            const isHomeGoal = isHomeEvent(goal);
                            return (
                              <div
                                key={goal.id}
                                className={`flex items-center gap-2 ${
                                  isHomeGoal ? "flex-row" : "flex-row-reverse"
                                }`}
                              >
                                <span className="font-mono text-xs text-gray-500 font-bold min-w-[24px] text-center">
                                  {goal.minute}&apos;
                                </span>
                                <div
                                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md w-full ${isHomeGoal ? "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 justify-start" : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 justify-end"}`}
                                >
                                  <span className="font-medium text-gray-900 dark:text-gray-100 truncate text-xs sm:text-sm">
                                    {goal.teamPlayer?.player?.name || "Jugador"}
                                  </span>
                                  {goal.isOwnGoal && (
                                    <span className="text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-900/20 px-1 rounded">
                                      AG
                                    </span>
                                  )}
                                  {goal.isPenalty && (
                                    <span className="text-[10px] text-gray-500 font-bold bg-gray-100 dark:bg-gray-800 px-1 rounded">
                                      P
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Cards */}
                    {allCards.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Tarjetas
                        </div>
                        <div className="space-y-2">
                          {allCards.map((card: any) => {
                             const isHomeCard = isHomeEvent(card);
                             // Asumimos 'AMARILLA' o 'ROJA'
                             const isYellow = card.type === 'AMARILLA';
                             
                             return (
                              <div
                                key={card.id}
                                className={`flex items-center gap-2 ${
                                  isHomeCard ? "flex-row" : "flex-row-reverse"
                                }`}
                              >
                                <span className="font-mono text-xs text-gray-500 font-bold min-w-[24px] text-center">
                                  {card.minute}&apos;
                                </span>
                                <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md w-full ${isHomeCard ? "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 justify-start" : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 justify-end"}`}>
                                    <div className={`w-3 h-4 rounded-[2px] shadow-sm ${isYellow ? "bg-yellow-400 border border-yellow-500" : "bg-red-500 border border-red-600"}`} />
                                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate text-xs sm:text-sm">
                                        {card.teamPlayer?.player?.name || "Jugador"}
                                    </span>
                                </div>
                              </div>
                             )
                          })}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-[#ad45ff] hover:bg-gray-100 dark:hover:bg-gray-800 h-8 rounded-none border-t border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
            >
              {isOpen ? "Ocultar detalles" : "Ver detalles"}
              {isOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
