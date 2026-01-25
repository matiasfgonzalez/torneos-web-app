"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  Target,
  ShieldAlert,
  Users,
  Trophy,
  Clock,
  MapPin,
  Calendar,
} from "lucide-react";
import { IMatch } from "@modules/torneos/types/tournament-teams.types";
import { MatchStatus } from "@prisma/client";

interface MatchDetailModalProps {
  match: IMatch;
}

// Función helper para formatear fecha
const formatMatchDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Función helper para formatear hora
const formatMatchTime = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function MatchDetailModal({ match }: MatchDetailModalProps) {
  const [open, setOpen] = useState(false);

  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;

  const goals = match.goals || [];
  const cards = match.cards || [];
  const referees = match.referees || [];

  // Separar goles por equipo
  const homeGoals = goals.filter(
    (g) => g.teamPlayer?.tournamentTeam?.id === match.homeTeamId,
  );
  const awayGoals = goals.filter(
    (g) => g.teamPlayer?.tournamentTeam?.id === match.awayTeamId,
  );

  // Separar tarjetas por equipo
  const homeCards = cards.filter(
    (c: any) => c.teamPlayer?.tournamentTeam?.id === match.homeTeamId,
  );
  const awayCards = cards.filter(
    (c: any) => c.teamPlayer?.tournamentTeam?.id === match.awayTeamId,
  );

  const getRefereeRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      PRINCIPAL: "Árbitro Principal",
      ASISTENTE_1: "Asistente 1",
      ASISTENTE_2: "Asistente 2",
      CUARTO_ARBITRO: "Cuarto Árbitro",
    };
    return roles[role] || role;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#ad45ff] hover:text-[#ad45ff] hover:bg-[#ad45ff]/10"
        >
          <Eye className="w-4 h-4 mr-1" />
          Ver detalle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Detalle del Partido
          </DialogTitle>
        </DialogHeader>

        {/* Match Header */}
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          {/* Fecha y estado */}
          <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="capitalize">
                {formatMatchDate(match.dateTime)}
              </span>
              <Clock className="w-4 h-4 ml-2" />
              <span>{formatMatchTime(match.dateTime)}</span>
            </div>
            <Badge
              className={`rounded-full text-xs px-2.5 py-0.5 ${
                match.status === MatchStatus.FINALIZADO
                  ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  : match.status === MatchStatus.EN_JUEGO
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              }`}
            >
              {match.status}
            </Badge>
          </div>

          {/* Teams and Score */}
          <div className="flex items-center justify-center gap-4">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-gray-700 p-1 shadow-md">
                <img
                  src={match.homeTeam?.team?.logoUrl || "/placeholder.svg"}
                  alt={match.homeTeam?.team?.name || "Local"}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-semibold text-center text-gray-900 dark:text-white">
                {match.homeTeam?.team?.name || "Por definir"}
              </span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {homeScore}
              </span>
              <span className="text-2xl text-gray-400">-</span>
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {awayScore}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-gray-700 p-1 shadow-md">
                <img
                  src={match.awayTeam?.team?.logoUrl || "/placeholder.svg"}
                  alt={match.awayTeam?.team?.name || "Visitante"}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-semibold text-center text-gray-900 dark:text-white">
                {match.awayTeam?.team?.name || "Por definir"}
              </span>
            </div>
          </div>

          {/* Penalty info */}
          {match.penaltyWinnerTeamId && (
            <div className="mt-4 text-center">
              <Badge className="bg-[#ad45ff]/10 text-[#ad45ff]">
                <Trophy className="w-3 h-3 mr-1" />
                Penales: {match.penaltyScoreHome} - {match.penaltyScoreAway}
              </Badge>
            </div>
          )}

          {/* Venue */}
          {(match.stadium || match.city) && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>
                {[match.stadium, match.city].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* Tabs for Details */}
        <Tabs defaultValue="goals" className="mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <TabsTrigger
              value="goals"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-lg"
            >
              <Target className="w-4 h-4 mr-2" />
              Goles ({goals.length})
            </TabsTrigger>
            <TabsTrigger
              value="cards"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-lg"
            >
              <ShieldAlert className="w-4 h-4 mr-2" />
              Tarjetas ({cards.length})
            </TabsTrigger>
            <TabsTrigger
              value="referees"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-lg"
            >
              <Users className="w-4 h-4 mr-2" />
              Árbitros ({referees.length})
            </TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals" className="mt-4">
            {goals.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay goles registrados</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {/* Home Goals */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {match.homeTeam?.team?.name}
                  </h4>
                  {homeGoals.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Sin goles</p>
                  ) : (
                    homeGoals.map((goal) => (
                      <div
                        key={goal.id}
                        className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <Badge
                          variant="outline"
                          className="w-12 justify-center"
                        >
                          {goal.minute}'
                        </Badge>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {goal.teamPlayer?.player?.name || "Desconocido"}
                          </span>
                          {(goal.isPenalty || goal.isOwnGoal) && (
                            <span className="text-xs text-gray-500">
                              {goal.isPenalty && "⚽ Penal"}
                              {goal.isOwnGoal && "🔴 Autogol"}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Away Goals */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {match.awayTeam?.team?.name}
                  </h4>
                  {awayGoals.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Sin goles</p>
                  ) : (
                    awayGoals.map((goal) => (
                      <div
                        key={goal.id}
                        className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <Badge
                          variant="outline"
                          className="w-12 justify-center"
                        >
                          {goal.minute}'
                        </Badge>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {goal.teamPlayer?.player?.name || "Desconocido"}
                          </span>
                          {(goal.isPenalty || goal.isOwnGoal) && (
                            <span className="text-xs text-gray-500">
                              {goal.isPenalty && "⚽ Penal"}
                              {goal.isOwnGoal && "🔴 Autogol"}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Cards Tab */}
          <TabsContent value="cards" className="mt-4">
            {cards.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <ShieldAlert className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay tarjetas registradas</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {/* Home Cards */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {match.homeTeam?.team?.name}
                  </h4>
                  {homeCards.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Sin tarjetas</p>
                  ) : (
                    homeCards.map((card: any) => (
                      <div
                        key={card.id}
                        className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <Badge
                          variant="outline"
                          className="w-12 justify-center"
                        >
                          {card.minute}'
                        </Badge>
                        <div
                          className={`w-4 h-6 rounded-sm ${
                            card.type === "ROJA"
                              ? "bg-red-500"
                              : "bg-yellow-400"
                          } border border-black/10 shadow-sm`}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {card.teamPlayer?.player?.name || "Desconocido"}
                          </span>
                          {card.reason && (
                            <span className="text-xs text-gray-500">
                              {card.reason}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Away Cards */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {match.awayTeam?.team?.name}
                  </h4>
                  {awayCards.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Sin tarjetas</p>
                  ) : (
                    awayCards.map((card: any) => (
                      <div
                        key={card.id}
                        className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <Badge
                          variant="outline"
                          className="w-12 justify-center"
                        >
                          {card.minute}'
                        </Badge>
                        <div
                          className={`w-4 h-6 rounded-sm ${
                            card.type === "ROJA"
                              ? "bg-red-500"
                              : "bg-yellow-400"
                          } border border-black/10 shadow-sm`}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {card.teamPlayer?.player?.name || "Desconocido"}
                          </span>
                          {card.reason && (
                            <span className="text-xs text-gray-500">
                              {card.reason}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Referees Tab */}
          <TabsContent value="referees" className="mt-4">
            {referees.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay árbitros asignados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {referees.map((ref: any) => (
                  <div
                    key={ref.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ad45ff] to-[#c77dff] flex items-center justify-center text-white font-bold">
                        {ref.referee?.name?.charAt(0) || "A"}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {ref.referee?.name || "Desconocido"}
                        </span>
                        {ref.referee?.certificationLevel && (
                          <p className="text-xs text-gray-500">
                            {ref.referee.certificationLevel}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-[#ad45ff]/10 text-[#ad45ff]">
                      {getRefereeRoleLabel(ref.role)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
