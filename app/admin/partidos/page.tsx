"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  Trophy,
  Clock,
  MoreVertical,
  Shield,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FullscreenLoading } from "@/components/fullscreen-loading";
import { MatchDialog } from "@/components/admin/match-dialog";

interface Match {
  id: string;
  dateTime: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: {
    team: {
      name: string;
      logoUrl: string | null;
    };
  };
  awayTeam: {
    team: {
      name: string;
      logoUrl: string | null;
    };
  };
  tournament: {
    name: string;
  };
}

export default function PartidosPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | undefined>(undefined);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      // scope=panel (N3): solo partidos de las organizaciones del usuario
      const res = await fetch("/api/matches?scope=panel");
      const data = await res.json();
      if (Array.isArray(data)) {
        setMatches(data);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedMatch(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (match: Match) => {
    setSelectedMatch(match);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este partido?")) return;
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchMatches();
      } else {
        alert("Error al eliminar el partido");
      }
    } catch {
      alert("Error al eliminar el partido");
    }
  };

  const filteredMatches = matches.filter((match) => {
    const matchesSearch =
      match.homeTeam.team.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      match.awayTeam.team.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      match.tournament.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "TODOS" || match.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = matches.filter((m) => m.status === "PROGRAMADO").length;
  const liveCount = matches.filter((m) => m.status === "EN_JUEGO").length;
  const finishedCount = matches.filter((m) => m.status === "FINALIZADO").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROGRAMADO":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
          >
            Programado
          </Badge>
        );
      case "EN_JUEGO":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white animate-pulse">
            En Juego
          </Badge>
        );
      case "FINALIZADO":
        return (
          <Badge
            variant="secondary"
            className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            Finalizado
          </Badge>
        );
      case "SUSPENDIDO":
        return <Badge variant="destructive">Suspendido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return <FullscreenLoading isVisible={true} />;

  return (
    <div className="space-y-8 p-6 sm:p-8">
      {/* Header mejorado */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff]/5 to-[#a3b3ff]/5 dark:from-[#ad45ff]/10 dark:to-[#a3b3ff]/10 rounded-3xl -z-10" />

        <Card className="border-2 border-[#ad45ff]/20 dark:border-[#ad45ff]/30 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-2xl flex items-center justify-center shadow-lg">
                    <CalendarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                      Gestión de Partidos
                    </h1>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-gray-600 dark:text-gray-300 font-medium">
                        Sistema activo - {matches.length} partidos registrados
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                  Administra los encuentros, resultados y horarios de todos tus
                  torneos.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {pendingCount} programados
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                    <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      {liveCount} en juego
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full">
                    <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      {finishedCount} finalizados
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-auto">
                <Button
                  onClick={handleCreate}
                  className="w-full lg:w-auto bg-gradient-to-r from-[#ad45ff] to-[#c77dff] hover:from-[#9c3ee6] hover:to-[#b66de6] text-white shadow-lg shadow-[#ad45ff]/25 rounded-xl px-6"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Partido
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por equipo o torneo..."
                className="pl-9 bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:border-[#ad45ff]/50 focus:ring-[#ad45ff]/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los estados</SelectItem>
                <SelectItem value="PROGRAMADO">Programado</SelectItem>
                <SelectItem value="EN_JUEGO">En Juego</SelectItem>
                <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                <SelectItem value="SUSPENDIDO">Suspendido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Matches Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMatches.map((match) => (
          <Card
            key={match.id}
            className="group relative overflow-hidden border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:bg-white dark:hover:bg-gray-800 transition-all hover:border-[#ad45ff]/50 hover:shadow-lg hover:shadow-[#ad45ff]/10"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs"
                >
                  {match.tournament.name}
                </Badge>
                {getStatusBadge(match.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-4">
                {/* Home Team */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600">
                    {match.homeTeam.team.logoUrl ? (
                      <img
                        src={match.homeTeam.team.logoUrl}
                        alt={match.homeTeam.team.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Shield className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-center line-clamp-2 h-10 flex items-center text-gray-900 dark:text-white">
                    {match.homeTeam.team.name}
                  </span>
                </div>

                {/* Score / VS */}
                <div className="flex flex-col items-center px-4">
                  {match.status === "FINALIZADO" || match.status === "EN_JUEGO" ? (
                    <div className="text-2xl font-bold font-mono tracking-wider text-gray-900 dark:text-white">
                      {match.homeScore} - {match.awayScore}
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-3 py-1 rounded-full">
                      VS
                    </span>
                  )}
                  <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="mr-1 h-3 w-3" />
                    {format(new Date(match.dateTime), "HH:mm")}
                  </div>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600">
                    {match.awayTeam.team.logoUrl ? (
                      <img
                        src={match.awayTeam.team.logoUrl}
                        alt={match.awayTeam.team.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Shield className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-center line-clamp-2 h-10 flex items-center text-gray-900 dark:text-white">
                    {match.awayTeam.team.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                  {format(new Date(match.dateTime), "PPP", { locale: es })}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="-mr-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => handleEdit(match)}>
                      Editar Detalles
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500" onClick={() => handleDelete(match.id)}>
                      Eliminar Partido
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Acción principal: pantalla única mobile-first (N10) */}
              <Button
                asChild
                className="mt-3 w-full gap-2 bg-gradient-to-r from-[#ad45ff] to-[#c77dff] hover:from-[#9c3ee6] hover:to-[#b66de6] text-white shadow-md shadow-[#ad45ff]/20"
              >
                <Link href={`/admin/partidos/${match.id}/cargar`}>
                  <Zap className="h-4 w-4" />
                  Cargar resultado
                </Link>
              </Button>
            </CardContent>

            {/* Hover Gradient Effect */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#ad45ff] to-[#c77dff] opacity-0 transition-opacity group-hover:opacity-100" />
          </Card>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-4">
            <Trophy className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No se encontraron partidos
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
            No hay partidos que coincidan con tu búsqueda. Intenta ajustar los
            filtros o crea un nuevo partido.
          </p>
        </div>
      )}

      <MatchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        matchToEdit={selectedMatch}
        onSuccess={fetchMatches}
      />
    </div>
  );
}
