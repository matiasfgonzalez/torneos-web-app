"use client";

import { useCallback, useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
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
import {
  MatchFormSheet,
  type MatchToEdit,
} from "@modules/partidos/components/admin/MatchFormSheet";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "sonner";

interface Match extends MatchToEdit {
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: { team: { name: string; logoUrl: string | null } };
  awayTeam: { team: { name: string; logoUrl: string | null } };
  tournament: { name: string };
}

interface MatchesResponse {
  data: Match[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Summary {
  total: number;
  byStatus: Record<string, number>;
}

const PAGE_SIZE = 12;

export default function PartidosPage() {
  const [list, setList] = useState<MatchesResponse | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [, startFetch] = useTransition();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Match | null>(null);

  // Debounce del buscador: no dispara un fetch por tecla.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Cambiar filtro o búsqueda vuelve a la página 1 (ajuste durante el render,
  // no un effect con setState en cascada).
  const filterKey = `${debouncedSearch}|${statusFilter}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setPage(1);
  }

  // Declarada ANTES de los effects que la usan (react-hooks/immutability) y con
  // el fetch dentro de una transición (react-hooks/set-state-in-effect).
  const fetchList = useCallback(() => {
    startFetch(async () => {
      try {
        const qs = new URLSearchParams({
          scope: "panel",
          page: String(page),
          limit: String(PAGE_SIZE),
        });
        if (debouncedSearch) qs.set("q", debouncedSearch);
        if (statusFilter !== "TODOS") qs.set("status", statusFilter);
        const res = await fetch(`/api/matches?${qs.toString()}`);
        const data: MatchesResponse = await res.json();
        setList(data);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    });
  }, [page, debouncedSearch, statusFilter]);

  const fetchSummary = useCallback(() => {
    startFetch(async () => {
      try {
        const res = await fetch("/api/matches/summary?scope=panel");
        setSummary(await res.json());
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    });
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const refreshAll = () => {
    fetchList();
    fetchSummary();
  };

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
        refreshAll();
      } else {
        toast.error("Error al eliminar el partido");
      }
    } catch {
      toast.error("Error al eliminar el partido");
    }
  };

  const matches = list?.data ?? [];
  const totalPages = list?.totalPages ?? 1;
  const pendingCount = summary?.byStatus?.PROGRAMADO ?? 0;
  const liveCount = summary?.byStatus?.EN_JUEGO ?? 0;
  const finishedCount = summary?.byStatus?.FINALIZADO ?? 0;
  const totalCount = summary?.total ?? 0;

  if (list === null) return <FullscreenLoading isVisible={true} />;

  return (
    <div className="space-y-8 p-6 sm:p-8">
      {/* Header - componente compartido (patrón §3 variante A) */}
      <PageHeader
        icon={CalendarIcon}
        title="Gestión de Partidos"
        statusText={`Sistema activo - ${totalCount} partidos registrados`}
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
                placeholder="Buscar por equipo, torneo o estadio..."
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
        {matches.map((match) => (
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

      {matches.length === 0 && (
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

      {/* Paginación (A3): la lista se pide por página al server */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Página {list.page} de {totalPages} · {list.total} partidos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={list.page <= 1}
              className="rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={list.page >= totalPages}
              className="rounded-xl"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* `key`: cada partido seleccionado monta un formulario nuevo, así los
          valores iniciales salen siempre del partido actual (sin resetear a
          mano en un effect). */}
      <MatchFormSheet
        key={selectedMatch?.id ?? "new"}
        mode={selectedMatch ? "edit" : "create"}
        match={selectedMatch}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refreshAll}
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
