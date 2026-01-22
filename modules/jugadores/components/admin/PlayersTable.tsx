"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Trash2, MapPinHouse, Users, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IPlayer } from "@modules/jugadores/types";
import PlayerForm from "./player-form";

interface PropsPlayersTable {
  players: IPlayer[];
}

const PlayersTable = (props: PropsPlayersTable) => {
  const { players } = props;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.nationality?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || player.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            Activo
          </Badge>
        );
      case "SUSPENDED":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0">
            Suspendido
          </Badge>
        );
      case "INJURED":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">
            Lesionado
          </Badge>
        );
      case "UNAVAILABLE":
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0">
            No Disponible
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white border-0">
            {status}
          </Badge>
        );
    }
  };

  const getPositionBadge = (position: string) => {
    switch (position) {
      case "Portero":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
            Portero
          </Badge>
        );
      case "Defensa":
      case "Defensa Central":
      case "Lateral Derecho":
      case "Lateral Izquierdo":
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0">
            Defensa
          </Badge>
        );
      case "Mediocampista":
      case "Mediocampista Defensivo":
      case "Mediocampista Central":
      case "Mediocampista Ofensivo":
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-violet-500 text-white border-0">
            Mediocampista
          </Badge>
        );
      case "Delantero":
      case "Delantera":
      case "Delantero Centro":
      case "Extremo Derecho":
      case "Extremo Izquierdo":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
            Delantero
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white border-0">
            {position}
          </Badge>
        );
    }
  };

  const getDominantFootIcon = (foot: string) => {
    switch (foot) {
      case "DERECHA":
        return "🦶";
      case "IZQUIERDA":
        return "🦵";
      case "AMBOS":
        return "👣";
      default:
        return "❓";
    }
  };

  function calcularEdad(fechaNacimiento: string | Date): number {
    const fecha = new Date(fechaNacimiento);
    const hoy = new Date();

    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    const dia = hoy.getDate() - fecha.getDate();

    if (mes < 0 || (mes === 0 && dia < 0)) {
      edad--;
    }

    return edad;
  }

  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "ACTIVE", label: "Activos" },
    { value: "SUSPENDED", label: "Suspendidos" },
    { value: "INJURED", label: "Lesionados" },
    { value: "UNAVAILABLE", label: "No disponibles" },
  ];

  return (
    <Card className="glass-card border-0 shadow-xl">
      <CardHeader className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Lista de Jugadores
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Gestiona todos los jugadores registrados en la plataforma
            </CardDescription>
          </div>
        </div>

        {/* Filtros mejorados */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Buscar jugadores por nombre, equipo, posición o nacionalidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] focus:ring-0 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="relative min-w-48">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:border-[#ad45ff] focus:outline-none transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="flex flex-wrap gap-2">
          <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
            <span className="font-semibold">{filteredPlayers.length}</span> de{" "}
            {players.length} jugadores
          </div>
          {searchTerm && (
            <div className="text-sm text-[#ad45ff] bg-[#ad45ff]/10 dark:bg-[#ad45ff]/20 px-3 py-1 rounded-full">
              Filtrado: {searchTerm}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden">
          <Table>
            <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <TableRow className="hover:bg-gray-100/50 dark:hover:bg-gray-700/50">
                <TableHead className="font-semibold text-gray-900 dark:text-white">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Jugador</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-white">
                  Posición
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-white">
                  Físico
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-white">
                  Lugar de nacimiento
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-white">
                  Estado
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-900 dark:text-white">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                        <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {searchTerm || statusFilter !== "all"
                          ? "No se encontraron jugadores con los filtros aplicados"
                          : "No se encontraron jugadores"}
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        {searchTerm || statusFilter !== "all"
                          ? "Intenta modificar los filtros de búsqueda"
                          : "Comienza registrando tu primer jugador"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlayers.map((player) => (
                  <TableRow
                    key={player.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                            <img
                              src={player.imageUrlFace || "/placeholder.svg"}
                              alt={player.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white flex items-center justify-center text-xs font-bold shadow-lg">
                            {player.number}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {player.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            🌍 {player.nationality} •{" "}
                            {calcularEdad(player.birthDate)} años
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getPositionBadge(player.position)}
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          {getDominantFootIcon(player.dominantFoot)}{" "}
                          {player.dominantFoot?.toLowerCase()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          📏 {player.height} cm
                        </div>
                        <div className="flex items-center gap-1">
                          ⚖️ {player.weight} kg
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                          <MapPinHouse className="h-4 w-4 text-green-600" />
                          <span className="font-medium">
                            {player.birthPlace}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(player.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <PlayerForm isEditMode={true} player={player} />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:border-red-800 dark:hover:bg-red-900/20"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white dark:bg-gray-800 border-0 shadow-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-gray-900 dark:text-white">
                                ¿Eliminar jugador?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                                Esta acción eliminará permanentemente a{" "}
                                <strong>{player.name}</strong> del sistema. Esta
                                acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-2 border-gray-300 dark:border-gray-600">
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white border-0">
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayersTable;
