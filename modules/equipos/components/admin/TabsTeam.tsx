"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Trophy,
  Calendar,
  Settings,
  AlertTriangle,
  Play,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatDate";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PropsTabsTeam {
  teamData: any; // Using any for flexibility
}

export default function TabsTeam(props: PropsTabsTeam) {
  const { teamData } = props;
  const { estadisticas } = teamData;

  const getPositionAbbr = (position: string | null) => {
    if (!position) return "DIR";
    const positionMap: Record<string, string> = {
      ARQUERO: "ARQ",
      DEFENSOR_CENTRAL: "DC",
      LATERAL_DERECHO: "LD",
      LATERAL_IZQUIERDO: "LI",
      VOLANTE_DEFENSIVO: "VD",
      VOLANTE_CENTRAL: "VC",
      VOLANTE_OFENSIVO: "VO",
      ENGANCHE: "ENG",
      EXTREMO_DERECHO: "ED",
      EXTREMO_IZQUIERDO: "EI",
      DELANTERO_CENTRO: "DC9",
      SEGUNDO_DELANTERO: "SD",
    };
    return positionMap[position] || position.substring(0, 3).toUpperCase();
  };

  return (
    <Tabs defaultValue="plantel" className="space-y-6">
      <div className="flex overflow-x-auto pb-2 scrollbar-hide">
        <TabsList className="bg-white/50 dark:bg-gray-800/50 border border-white/20 p-1 backdrop-blur-md gap-2 w-full sm:w-auto flex justify-start">
          <TabsTrigger
            value="plantel"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm text-gray-600 dark:text-gray-300 gap-2 px-4"
          >
            <Users className="w-4 h-4" />
            Plantel
          </TabsTrigger>
          <TabsTrigger
            value="torneos"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm text-gray-600 dark:text-gray-300 gap-2 px-4"
          >
            <Trophy className="w-4 h-4" />
            Torneos
          </TabsTrigger>
          <TabsTrigger
            value="partidos"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm text-gray-600 dark:text-gray-300 gap-2 px-4"
          >
            <Calendar className="w-4 h-4" />
            Partidos
          </TabsTrigger>
          <TabsTrigger
            value="configuracion"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm text-gray-600 dark:text-gray-300 gap-2 px-4"
          >
            <Settings className="w-4 h-4" />
            Configuración
          </TabsTrigger>
        </TabsList>
      </div>

      {/* PLANTEL */}
      <TabsContent value="plantel" className="space-y-4">
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#ad45ff]" />
                  Plantel Actual
                </CardTitle>
                <CardDescription>
                  Jugadores registrados en el equipo
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Users className="w-4 h-4" />
                Gestionar Plantel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {teamData.jugadores.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50 text-yellow-500" />
                <p className="font-medium">No hay jugadores registrados</p>
                <p className="text-sm mt-1">
                  Gestiona el plantel para agregar jugadores
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {teamData.jugadores.map((jugador: any) => (
                  <div
                    key={jugador.id}
                    className="flex items-center p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-[#ad45ff]/30 hover:shadow-md transition-all bg-white dark:bg-gray-800"
                  >
                    <Avatar className="w-12 h-12 border-2 border-[#ad45ff]/20 mr-3">
                      <AvatarImage
                        src={jugador.imageUrlFace || jugador.imageUrl}
                        alt={jugador.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] text-white">
                        {jugador.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {jugador.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="text-xs border-[#ad45ff]/30 text-[#ad45ff] px-1.5 py-0"
                        >
                          {getPositionAbbr(jugador.position)}
                        </Badge>
                        {jugador.number && (
                          <span className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-700 px-1.5 rounded">
                            #{jugador.number}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* TORNEOS */}
      <TabsContent value="torneos" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {teamData.tournamentTeams.length === 0 ? (
            <Card className="col-span-full border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardContent className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50 text-[#ad45ff]" />
                <p className="font-medium">Sin participación en torneos</p>
                <p className="text-sm mt-1">
                  Este equipo no ha sido inscrito en ningún torneo
                </p>
              </CardContent>
            </Card>
          ) : (
            teamData.tournamentTeams.map((tt: any) => (
              <Card
                key={tt.id}
                className="hover:shadow-lg transition-shadow border-0 shadow-md bg-white dark:bg-gray-800"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-1">
                      {tt.tournament.logoUrl ? (
                        <img
                          src={tt.tournament.logoUrl}
                          alt={tt.tournament.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Trophy className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base font-bold text-gray-900 dark:text-white line-clamp-1">
                        {tt.tournament.name}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-1">
                        {tt.tournament.category} • {tt.tournament.locality}
                      </CardDescription>
                    </div>
                    <Link href={`/admin/torneos/${tt.tournament.id}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <Settings className="w-4 h-4 text-gray-500" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 text-center text-sm py-2">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                      <p className="font-bold text-[#ad45ff]">{tt.matchesPlayed}</p>
                      <p className="text-[10px] uppercase text-gray-500">PJ</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-2">
                      <p className="font-bold text-green-600">{tt.wins}</p>
                      <p className="text-[10px] uppercase text-gray-500">PG</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-2">
                      <p className="font-bold text-yellow-600">{tt.draws}</p>
                      <p className="text-[10px] uppercase text-gray-500">PE</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-2">
                      <p className="font-bold text-red-600">{tt.losses}</p>
                      <p className="text-[10px] uppercase text-gray-500">PP</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500 px-1">
                    <span>
                      {tt.goalsFor} GF • {tt.goalsAgainst} GC
                    </span>
                    <span className="font-bold text-[#ad45ff]">
                      {tt.points} Pts
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>

      {/* PARTIDOS */}
      <TabsContent value="partidos" className="space-y-4">
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#ad45ff]" />
              Historial de Partidos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamData.partidos.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay partidos registrados</p>
              </div>
            ) : (
              teamData.partidos.map((partido: any) => (
                <div
                  key={partido.id}
                  className="flex flex-col sm:flex-row items-center border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors gap-4"
                >
                  <div className="flex flex-col items-center sm:items-start min-w-[100px]">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(partido.dateTime, "dd/MM")}
                    </span>
                    <span className="text-xs text-gray-500">
                      {partido.status}
                    </span>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-[1fr,auto,1fr] items-center gap-4 w-full">
                    <div className="flex items-center justify-end gap-3 text-right">
                      <span className={`text-sm font-medium ${partido.esLocal ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                        {teamData.shortName || teamData.name}
                      </span>
                      {teamData.logoUrl && (
                        <img src={teamData.logoUrl} className="w-8 h-8 object-contain" alt="Home" />
                      )}
                    </div>
                    
                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      {partido.esLocal ? partido.homeScore ?? "-" : partido.awayScore ?? "-"}
                      {" : "}
                      {partido.esLocal ? partido.awayScore ?? "-" : partido.homeScore ?? "-"}
                    </div>

                    <div className="flex items-center justify-start gap-3 text-left">
                       {partido.equipoRival.logoUrl ? (
                        <img src={partido.equipoRival.logoUrl} className="w-8 h-8 object-contain" alt="Away" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      )}
                      <span className={`text-sm font-medium ${!partido.esLocal ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                        {partido.equipoRival.shortName || partido.equipoRival.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="hidden sm:block">
                    <Badge variant="outline" className="text-xs border-gray-200 text-gray-500">
                      {partido.torneoNombre}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* CONFIGURACION */}
      <TabsContent value="configuracion" className="space-y-4">
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
                <CardTitle>Configuración Avanzada</CardTitle>
                <CardDescription>Opciones de sistema para este equipo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Información de Sistema</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500 block">ID del Equipo</span>
                            <code className="bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">{teamData.id}</code>
                        </div>
                        <div>
                            <span className="text-gray-500 block">Creado el</span>
                            <span className="text-gray-900 dark:text-white">{formatDate(teamData.createdAt)}</span>
                        </div>
                        <div>
                             <span className="text-gray-500 block">Última actualización</span>
                             <span className="text-gray-900 dark:text-white">{formatDate(teamData.updatedAt)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

