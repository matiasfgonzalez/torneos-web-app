"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Eye, Filter, Calendar, MapPin, Trophy } from "lucide-react";
import { useState } from "react";
import { ITorneo } from "@/components/torneos/types";
import { formatDate } from "@/lib/formatDate";
import Link from "next/link";
import { DeleteTournamentButton } from "./DeleteTournamentButton";
import DialogAddTournaments from "./DialogAddTournaments";

interface PropsListTournaments {
  tournaments: ITorneo[];
}

const ListTournaments = (props: PropsListTournaments) => {
  const { tournaments } = props;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch =
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.locality?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || tournament.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "En curso":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            En curso
          </Badge>
        );
      case "Finalizado":
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0">
            <Trophy className="w-3 h-3 mr-1" />
            Finalizado
          </Badge>
        );
      case "Inscripciones":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 hover:from-green-600 hover:to-green-700">
            <Calendar className="w-3 h-3 mr-1" />
            Inscripciones
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

  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "En curso", label: "En curso" },
    { value: "Inscripciones", label: "Inscripciones" },
    { value: "Finalizado", label: "Finalizado" },
  ];

  return (
    <Card className="border-2 border-gray-100 shadow-xl bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Lista de Torneos
            </CardTitle>
            <CardDescription className="text-gray-600">
              Gestiona todos los torneos registrados en la plataforma
            </CardDescription>
          </div>
        </div>

        {/* Filtros mejorados */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, categoría o localidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-gray-200 focus:border-[#ad45ff] focus:ring-0 transition-all duration-300"
            />
          </div>

          <div className="relative min-w-48">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-md focus:border-[#ad45ff] focus:outline-none transition-all duration-300 bg-white"
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
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            <span className="font-semibold">{filteredTournaments.length}</span>{" "}
            de {tournaments.length} torneos
          </div>
          {searchTerm && (
            <div className="text-sm text-[#ad45ff] bg-[#ad45ff]/10 px-3 py-1 rounded-full">
              Filtrado: "{searchTerm}"
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-xl border-2 border-gray-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <TableRow className="hover:bg-gray-100/50">
                <TableHead className="font-semibold text-gray-900">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4" />
                    <span>Torneo</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  Categoría
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  Estado
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Inicio</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Fin</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  Próximo Partido
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-900">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTournaments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        {searchTerm || statusFilter !== "all"
                          ? "No se encontraron torneos con los filtros aplicados"
                          : "No hay torneos registrados"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {searchTerm || statusFilter !== "all"
                          ? "Intenta modificar los filtros de búsqueda"
                          : "Crea tu primer torneo para comenzar"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTournaments.map((tournament) => (
                  <TableRow
                    key={tournament.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200"
                  >
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">
                          {tournament.name}
                        </div>
                        {tournament.locality && (
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>{tournament.locality}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {tournament.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(tournament.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(tournament.startDate, "dd 'de' MMMM yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(tournament.endDate, "dd 'de' MMMM yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(tournament.nextMatch)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="hover:bg-[#ad45ff] hover:text-white hover:border-[#ad45ff] transition-all duration-200"
                        >
                          <Link href={`/admin/torneos/${tournament.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DialogAddTournaments tournament={tournament} />
                        <DeleteTournamentButton tournament={tournament} />
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

export default ListTournaments;
