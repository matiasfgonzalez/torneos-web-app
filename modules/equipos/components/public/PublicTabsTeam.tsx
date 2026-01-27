"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Trophy, Calendar, Play, TrendingUp, Goal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatDate";
import { PLAYER_POSITION_LABELS } from "@/lib/constants";
import { PlayerPosition } from "@prisma/client";
import MatchCard from "./MatchCard";

interface PropsTabsTeam {
  readonly teamData: any;
}

export default function PublicTabsTeam({ teamData }: PropsTabsTeam) {
  // Get position label in Spanish from constants
  const getPositionLabel = (position: string | null): string => {
    if (!position) return "Jugador";
    return PLAYER_POSITION_LABELS[position as PlayerPosition] || position;
  };

  // Get position abbreviation
  const getPositionAbbr = (position: string | null): string => {
    if (!position) return "JUG";
    const positionMap: Record<string, string> = {
      ARQUERO: "ARQ",
      DEFENSOR_CENTRAL: "DEF",
      LATERAL_DERECHO: "LD",
      LATERAL_IZQUIERDO: "LI",
      CARRILERO_DERECHO: "CAR",
      CARRILERO_IZQUIERDO: "CAR",
      VOLANTE_DEFENSIVO: "VOL",
      PIVOTE: "PIV",
      VOLANTE_CENTRAL: "MC",
      VOLANTE_OFENSIVO: "MCO",
      INTERIOR_DERECHO: "INT",
      INTERIOR_IZQUIERDO: "INT",
      ENGANCHE: "ENG",
      EXTREMO_DERECHO: "EXT",
      EXTREMO_IZQUIERDO: "EXT",
      DELANTERO_CENTRO: "DC",
      SEGUNDO_DELANTERO: "SD",
      FALSO_9: "F9",
    };
    return positionMap[position] || position.substring(0, 3).toUpperCase();
  };

  // Get position color based on category
  const getPositionColor = (position: string | null): string => {
    if (!position) return "bg-gray-500";
    if (position === "ARQUERO") return "from-yellow-500 to-amber-600";
    if (
      position.includes("DEFENSOR") ||
      position.includes("LATERAL") ||
      position.includes("CARRILERO")
    )
      return "from-blue-500 to-blue-600";
    if (
      position.includes("VOLANTE") ||
      position.includes("PIVOTE") ||
      position.includes("INTERIOR") ||
      position === "ENGANCHE"
    )
      return "from-green-500 to-emerald-600";
    return "from-red-500 to-rose-600"; // Forwards
  };

  return (
    <Tabs defaultValue="plantel" className="space-y-8">
      {/* Premium Tab List */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] rounded-2xl blur opacity-20" />
        <TabsList className="relative flex flex-wrap sm:grid sm:grid-cols-3 w-full bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 gap-2 h-auto">
          <TabsTrigger
            value="plantel"
            className="flex-1 min-w-[calc(50%-0.5rem)] sm:min-w-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#c77dff] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#ad45ff]/25 rounded-xl py-3 px-3 font-medium transition-all duration-300 text-sm sm:text-base"
          >
            <Users className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Plantel</span>
          </TabsTrigger>
          <TabsTrigger
            value="torneos"
            className="flex-1 min-w-[calc(50%-0.5rem)] sm:min-w-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#c77dff] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#ad45ff]/25 rounded-xl py-3 px-3 font-medium transition-all duration-300 text-sm sm:text-base"
          >
            <Trophy className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Torneos</span>
          </TabsTrigger>
          <TabsTrigger
            value="partidos"
            className="flex-1 min-w-[calc(50%-0.5rem)] sm:min-w-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#c77dff] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#ad45ff]/25 rounded-xl py-3 px-3 font-medium transition-all duration-300 text-sm sm:text-base"
          >
            <Calendar className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Partidos</span>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* PLANTEL - Premium Golazo Style */}
      <TabsContent
        value="plantel"
        className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2"
      >
        {teamData.jugadores.length === 0 ? (
          <Card className="relative bg-white dark:bg-gray-900/80 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden rounded-2xl">
            <div className="h-1.5 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff]" />
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#ad45ff]/20 to-[#c77dff]/10 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-[#ad45ff]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Plantel no disponible
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Este equipo aún no ha registrado sus jugadores.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {teamData.jugadores.map((jugador: any) => (
              <div
                key={jugador.id}
                className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-[#ad45ff]/50 hover:-translate-y-1"
              >
                {/* Gradient accent bar based on position */}
                <div
                  className={`h-1 bg-gradient-to-r ${getPositionColor(jugador.position)}`}
                />

                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#ad45ff]/0 to-[#c77dff]/0 group-hover:from-[#ad45ff]/5 group-hover:to-[#c77dff]/5 transition-all duration-300 pointer-events-none" />

                <div className="p-5 relative z-10">
                  <div className="flex items-start gap-4">
                    {/* Player number badge */}
                    {jugador.number && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-[#ad45ff] to-[#c77dff] rounded-lg flex items-center justify-center shadow-lg shadow-[#ad45ff]/25">
                        <span className="text-white font-bold text-sm">
                          {jugador.number}
                        </span>
                      </div>
                    )}

                    {/* Avatar with glow */}
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#ad45ff] to-[#c77dff] rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity" />
                      <Avatar className="relative w-18 h-18 border-3 border-white dark:border-gray-700 shadow-xl rounded-2xl">
                        <AvatarImage
                          src={jugador.imageUrlFace || jugador.imageUrl}
                          alt={jugador.name}
                          className="object-cover rounded-xl"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-[#ad45ff] to-[#c77dff] text-white text-xl font-bold rounded-xl">
                          {jugador.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg truncate group-hover:text-[#ad45ff] transition-colors">
                        {jugador.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {getPositionLabel(jugador.position)}
                      </p>
                      <Badge
                        className={`mt-2 text-xs font-semibold bg-gradient-to-r ${getPositionColor(jugador.position)} text-white border-0`}
                      >
                        {getPositionAbbr(jugador.position)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      {/* TORNEOS - Premium Golazo Style */}
      <TabsContent
        value="torneos"
        className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {teamData.tournamentTeams.length === 0 ? (
            <Card className="col-span-full relative bg-white dark:bg-gray-900/80 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden rounded-2xl">
              <div className="h-1.5 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff]" />
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#ad45ff]/20 to-[#c77dff]/10 rounded-full flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-[#ad45ff]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Sin Torneos
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Este equipo no ha participado en torneos registrados.
                </p>
              </CardContent>
            </Card>
          ) : (
            teamData.tournamentTeams.map((tt: any) => (
              <Card
                key={tt.id}
                className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-[#ad45ff]/50 hover:-translate-y-1"
              >
                {/* Gradient accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff]" />

                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#ad45ff]/0 to-[#c77dff]/0 group-hover:from-[#ad45ff]/5 group-hover:to-[#c77dff]/5 transition-all duration-300 pointer-events-none" />

                <CardHeader className="pb-3 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#ad45ff] to-[#c77dff] rounded-2xl blur opacity-0 group-hover:opacity-40 transition-opacity" />
                      <div className="relative w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 p-2 flex items-center justify-center shadow-lg border border-gray-100 dark:border-gray-700">
                        {tt.tournament.logoUrl ? (
                          <img
                            src={tt.tournament.logoUrl}
                            alt={tt.tournament.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Trophy className="w-8 h-8 text-[#ad45ff]" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#ad45ff] transition-colors truncate">
                        {tt.tournament.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-[#ad45ff]/10 text-[#ad45ff] border-0"
                        >
                          {tt.tournament.category}
                        </Badge>
                        <span className="text-gray-400 dark:text-gray-500">
                          •
                        </span>
                        <span className="text-sm truncate">
                          {tt.tournament.locality}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center py-4 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-900/50 rounded-xl mb-4 border border-gray-100 dark:border-gray-700">
                    <div className="p-2">
                      <div className="text-xl font-black text-gray-900 dark:text-white">
                        {tt.matchesPlayed}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">
                        PJ
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="text-xl font-black text-green-500">
                        {tt.wins}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">
                        G
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="text-xl font-black text-amber-500">
                        {tt.draws}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">
                        E
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="text-xl font-black text-red-500">
                        {tt.losses}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">
                        P
                      </div>
                    </div>
                  </div>

                  {/* Goals and Points */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Goal className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          {tt.goalsFor}
                        </span>
                        <span className="text-gray-400 text-xs">GF</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Goal className="w-4 h-4 text-red-500" />
                        <span className="text-red-500 dark:text-red-400 font-semibold">
                          {tt.goalsAgainst}
                        </span>
                        <span className="text-gray-400 text-xs">GC</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp
                          className={`w-4 h-4 ${tt.goalsFor - tt.goalsAgainst >= 0 ? "text-green-500" : "text-red-500"}`}
                        />
                        <span
                          className={`font-semibold ${tt.goalsFor - tt.goalsAgainst >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}
                        >
                          {tt.goalsFor - tt.goalsAgainst > 0 ? "+" : ""}
                          {tt.goalsFor - tt.goalsAgainst}
                        </span>
                        <span className="text-gray-400 text-xs">DG</span>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-[#ad45ff] to-[#c77dff] hover:from-[#9d35ef] hover:to-[#b56dff] text-white px-4 py-1.5 text-sm font-bold shadow-lg shadow-[#ad45ff]/25 border-0">
                      {tt.points} Pts
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>

      {/* PARTIDOS - Premium Golazo Style */}
      <TabsContent
        value="partidos"
        className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2"
      >
        <Card className="relative bg-white dark:bg-gray-900/80 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden rounded-2xl">
          {/* Gradient accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff]" />

          <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-[#ad45ff] to-[#c77dff] rounded-xl shadow-lg shadow-[#ad45ff]/25">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-900 dark:text-white text-xl">
                  Historial de Partidos
                </CardTitle>
                <CardDescription>
                  Todos los partidos disputados por el equipo
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {teamData.partidos.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#ad45ff]/20 to-[#c77dff]/10 rounded-full flex items-center justify-center">
                  <Play className="w-10 h-10 text-[#ad45ff]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Sin partidos registrados
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Este equipo aún no tiene partidos en el sistema.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {teamData.partidos.map((partido: any) => (
                  <MatchCard
                    key={partido.id}
                    partido={partido}
                    teamId={teamData.id}
                    teamLogo={teamData.logoUrl}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
