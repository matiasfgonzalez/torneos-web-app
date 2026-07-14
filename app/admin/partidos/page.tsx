"use client";

import { useCallback, useState, useEffect, useTransition } from "react";
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
import { PageHeader } from "@/components/shared/PageHeader";
import { MatchDialog, type MatchToEdit } from "@/components/admin/match-dialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "sonner";

interface Match extends MatchToEdit {
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
  const [, startFetch] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Match | null>(null);

  // Declarada ANTES del effect que la usa (si no, el effect la lee en la zona
  // muerta temporal: react-hooks/immutability) y con el fetch dentro de una
  // transición, para que el setState no quede en el cuerpo del effect
  // (react-hooks/set-state-in-effect).
  const fetchMatches = useCallback(() => {
    startFetch(async () => {
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
    });
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleCreate = () => {
    setSelectedMatch(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (match: Match) => {
    setSelectedMatch(match);
    setDialogOpen(true);
  };

  const performDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/matches/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Partido eliminado");
        fetchMatches();
      } else {
        toast.error("Error al eliminar el partido");
      }
    } catch {
      toast.error("Error al eliminar el partido");
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

  if (loading) return <FullscreenLoading isVisible={true} />;

  return (
    <div className="space-y-8 p-6 sm:p-8">
      {/* Header - componente compartido (patrón §3 variante A) */}
      <PageHeader
        icon={CalendarIcon}
        title="Gestión de Partidos"
        statusText={`Sistema activo - ${matches.length} partidos registrados`}
        description="Administra los encuentros, resultados y horarios de todos tus torneos."
        quickStats={[
          {
            icon: Clock,
            text: `${pendingCount} programados`,
            colorClass:
              "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
          },
          {
            icon: Zap,
            text: `${liveCount} en juego`,
            colorClass:
              "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
          },
          {
            icon: Trophy,
            text: `${finishedCount} finalizados`,
            colorClass:
              "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
          },
        ]}
        actions={
          <Button
            variant="brand"
            onClick={handleCreate}
            className="w-full lg:w-auto px-6"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Partido
          </Button>
        }
      />

      {/* Filters */}
      <Card className="border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por equipo o torneo..."
                className="pl-9 bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:border-brand/50 focus:ring-brand/20 transition-all"
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
            className="group relative overflow-hidden border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:bg-white dark:hover:bg-gray-800 transition-all hover:border-brand/50 hover:shadow-lg hover:shadow-brand/10"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs"
                >
                  {match.tournament.name}
                </Badge>
                <StatusBadge entity="match" status={match.status} />
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
                    {/* Cómo lo ve el hincha */}
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href={`/partidos/${match.id}`}>
                        Ver ficha pública
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500" onClick={() => setDeleteTarget(match)}>
                      Eliminar Partido
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Acción principal: pantalla única mobile-first (N10) */}
              <Button
                asChild
                className="mt-3 w-full gap-2 bg-gradient-to-r from-brand to-brand-mid hover:from-brand-hover hover:to-brand-mid-hover text-white shadow-md shadow-brand/20"
              >
                <Link href={`/admin/partidos/${match.id}/cargar`}>
                  <Zap className="h-4 w-4" />
                  Cargar resultado
                </Link>
              </Button>
            </CardContent>

            {/* Hover Gradient Effect */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-brand to-brand-mid opacity-0 transition-opacity group-hover:opacity-100" />
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

      {/* Confirmación de eliminación (F0: ConfirmDialog en vez de confirm()) */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="¿Eliminar partido?"
        description={
          deleteTarget ? (
            <>
              Se va a eliminar el partido{" "}
              <b>
                {deleteTarget.homeTeam.team.name} vs{" "}
                {deleteTarget.awayTeam.team.name}
              </b>{" "}
              ({deleteTarget.tournament.name}) junto con sus goles y tarjetas.
              Esta acción no se puede deshacer.
            </>
          ) : (
            ""
          )
        }
        confirmLabel="Eliminar"
        onConfirm={performDelete}
      />
    </div>
  );
}
