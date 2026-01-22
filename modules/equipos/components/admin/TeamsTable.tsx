"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
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
  Search,
  Eye,
  Users,
  MapPin,
  Calendar,
  Trophy,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ITeam } from "@modules/equipos/types/types";
import Link from "next/link";
import TeamForm from "./team-form";
import DeleteTeamButton from "./DeleteTeamButton";

interface PropsTeamsTable {
  teams: ITeam[];
}

const TeamsTable = (props: PropsTeamsTable) => {
  const { teams } = props;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.homeCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.coach?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && team.enabled) ||
      (statusFilter === "disabled" && !team.enabled);

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (enabled: boolean) => {
    if (enabled) {
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600">
          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
          Activo
        </Badge>
      );
    }
    return (
      <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0">
        Deshabilitado
      </Badge>
    );
  };

  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "active", label: "Activos" },
    { value: "disabled", label: "Deshabilitados" },
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
              Lista de Equipos
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Gestiona todos los equipos registrados en la plataforma
            </CardDescription>
          </div>
        </div>

        {/* Filtros mejorados */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Buscar equipos por nombre, ciudad, categoría o DT..."
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
            <span className="font-semibold">{filteredTeams.length}</span> de{" "}
            {teams.length} equipos
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
                    <Trophy className="w-4 h-4" />
                    <span>Equipo</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-white">
                  Ciudad
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-white">
                  DT
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-white">
                  Colores
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-white">
                  Jugadores
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
              {filteredTeams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                        <Trophy className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {searchTerm || statusFilter !== "all"
                          ? "No se encontraron equipos con los filtros aplicados"
                          : "No se encontraron equipos"}
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        {searchTerm || statusFilter !== "all"
                          ? "Intenta modificar los filtros de búsqueda"
                          : "Comienza registrando tu primer equipo"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeams.map((team: ITeam) => (
                  <TableRow
                    key={team.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <img
                            src={team.logoUrl || "/placeholder.svg"}
                            alt={`Escudo ${team.name}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {team.name}
                          </div>
                          {team.yearFounded && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              Fundado en {team.yearFounded}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {team.homeCity && (
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <MapPin className="mr-1 h-4 w-4 text-gray-400" />
                          {team.homeCity}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {team.coach || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-lg border-2 border-white shadow-md"
                          style={{ backgroundColor: team.homeColor }}
                          title="Color Local"
                        />
                        <div
                          className="w-6 h-6 rounded-lg border-2 border-gray-300 shadow-md"
                          style={{ backgroundColor: team.awayColor }}
                          title="Color Visitante"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <Users className="mr-1 h-4 w-4 text-gray-400" />
                        {team.players?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(team.enabled)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="hover:bg-[#ad45ff] hover:text-white hover:border-[#ad45ff] transition-all duration-200"
                        >
                          <Link href={`/equipos/${team.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <TeamForm isEditMode={true} team={team} />
                        <DeleteTeamButton team={team} />
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

export default TeamsTable;
