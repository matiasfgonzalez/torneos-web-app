"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  Filter,
  Trophy,
  MapPin,
  Clock,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
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
      const res = await fetch("/api/matches");
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
    } catch (error) {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROGRAMADO":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Programado</Badge>;
      case "EN_JUEGO":
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 animate-pulse">En Juego</Badge>;
      case "FINALIZADO":
        return <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">Finalizado</Badge>;
      case "SUSPENDIDO":
        return <Badge variant="destructive">Suspendido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return <FullscreenLoading isVisible={true} />;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Gestión de Partidos
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra los encuentros, resultados y horarios.
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/20">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Partido
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por equipo o torneo..."
                className="pl-9 bg-zinc-950/50 border-zinc-800 focus:border-violet-500/50 focus:ring-violet-500/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-zinc-950/50 border-zinc-800">
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
            className="group relative overflow-hidden border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 transition-all hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-zinc-700 bg-zinc-800/50 text-xs">
                  {match.tournament.name}
                </Badge>
                {getStatusBadge(match.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-4">
                {/* Home Team */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
                    {match.homeTeam.team.logoUrl ? (
                      <img
                        src={match.homeTeam.team.logoUrl}
                        alt={match.homeTeam.team.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Shield className="h-6 w-6 text-zinc-500" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-center line-clamp-2 h-10 flex items-center">
                    {match.homeTeam.team.name}
                  </span>
                </div>

                {/* Score / VS */}
                <div className="flex flex-col items-center px-4">
                  {match.status === "FINALIZADO" || match.status === "EN_JUEGO" ? (
                    <div className="text-2xl font-bold font-mono tracking-wider">
                      {match.homeScore} - {match.awayScore}
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground bg-zinc-800/50 px-3 py-1 rounded-full">
                      VS
                    </span>
                  )}
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {format(new Date(match.dateTime), "HH:mm")}
                  </div>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
                    {match.awayTeam.team.logoUrl ? (
                      <img
                        src={match.awayTeam.team.logoUrl}
                        alt={match.awayTeam.team.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Shield className="h-6 w-6 text-zinc-500" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-center line-clamp-2 h-10 flex items-center">
                    {match.awayTeam.team.name}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                  {format(new Date(match.dateTime), "PPP", { locale: es })}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="-mr-2 hover:bg-zinc-800">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => handleEdit(match)}>
                      Editar Detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => handleEdit(match)}>
                      Cargar Resultado
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500" onClick={() => handleDelete(match.id)}>
                      Eliminar Partido
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
            
            {/* Hover Gradient Effect */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 transition-opacity group-hover:opacity-100" />
          </Card>
        ))}
      </div>
      
      {filteredMatches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-zinc-900 p-4 mb-4">
            <Trophy className="h-8 w-8 text-zinc-500" />
          </div>
          <h3 className="text-lg font-medium">No se encontraron partidos</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            No hay partidos que coincidan con tu búsqueda. Intenta ajustar los filtros o crea un nuevo partido.
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
