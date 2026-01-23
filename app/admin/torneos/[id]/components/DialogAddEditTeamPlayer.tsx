"use client";

import { useEffect, useState } from "react";
import { ITournamentTeam } from "@modules/torneos/types/tournament-teams.types";
import { ITorneo } from "@modules/torneos/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Edit,
  Trophy,
  UserPlus,
  Users,
  Calendar,
  Shield,
  Loader2,
  CalendarX,
  CalendarCheck,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { IPlayer, IPlayerTeam } from "@modules/jugadores/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DialogAddEditTeamPlayerProps {
  mode: "create" | "edit";
  tournamentData: ITorneo;
  teamData: ITournamentTeam;
}

interface TeamPlayerFormValues {
  tournamentTeamId: string;
  playerId: string;
  joinedAt: string;
  leftAt?: string;
}

const DialogAddEditTeamPlayer = (
  props: Readonly<DialogAddEditTeamPlayerProps>,
) => {
  const { mode, tournamentData, teamData } = props;

  const router = useRouter();
  const [createAssocOpen, setCreateAssocOpen] = useState(false);
  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [playersAs, setPlayersAs] = useState<IPlayerTeam[]>([]);
  const [values, setValues] = useState<TeamPlayerFormValues>({
    tournamentTeamId: teamData.id,
    playerId: "",
    joinedAt: "",
    leftAt: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<IPlayerTeam | null>(
    null,
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const res = await fetch("/api/players");
        if (!res.ok) throw new Error("Error al obtener los jugadores");

        const data: IPlayer[] = await res.json();
        console.log(data);
        setPlayers(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
      } finally {
        setIsLoading(false);
      }
    }
    async function fetchPlayersAs() {
      try {
        const res = await fetch(`/api/team-player/${teamData.id}`);
        if (!res.ok)
          throw new Error("Error al obtener los jugadores asociados");

        const data: IPlayerTeam[] = await res.json();
        setPlayersAs(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlayers();
    fetchPlayersAs();
  }, [teamData.id]);

  const refreshPlayersAs = async () => {
    try {
      const res = await fetch(`/api/team-player/${teamData.id}`);
      if (!res.ok) throw new Error("Error al obtener los jugadores asociados");
      const data: IPlayerTeam[] = await res.json();
      setPlayersAs(data);
    } catch (err) {
      console.error("Error al refrescar jugadores:", err);
    }
  };

  const handleDeleteClick = (playerTeam: IPlayerTeam) => {
    setPlayerToDelete(playerTeam);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!playerToDelete) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/team-player/${playerToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(
          `${playerToDelete.player.name} desasociado correctamente`,
        );
        await refreshPlayersAs();
        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Error al desasociar el jugador");
      }
    } catch (error) {
      console.error("Error al desasociar:", error);
      toast.error("Error al desasociar el jugador");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setPlayerToDelete(null);
    }
  };

  const update = (field: string, newValue: number | string | boolean) => {
    console.log(newValue);
    setValues((prev: TeamPlayerFormValues) => ({ ...prev, [field]: newValue }));
  };

  const onSubmitLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = mode === "create" ? "POST" : "PATCH";
    try {
      setIsLoading(true);
      const url =
        method === "POST"
          ? "/api/team-player"
          : `/api/team-player/${teamData?.id}`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        setIsLoading(false);
        toast.success(
          method === "POST"
            ? "Agregado correctamente"
            : "Actualizado correctamente",
        );
        router.refresh();
      } else {
        const errorData = await res.json();
        console.error("Error del servidor:", errorData);
        toast.error(
          method === "POST" ? "Error al agregar" : "Error al actualizar",
        );
      }
    } catch (error) {
      console.error(
        `${method} === "POST" ? "Error al cargar" : "Error al actualizar": ${error}`,
      );
      toast.error(
        `${method} === "POST" ? "Error al cargar" : "Error al actualizar": ${error}`,
      );
    } finally {
      setIsLoading(false);
      setCreateAssocOpen(false);
    }
  };

  if (error) return <div>{error}</div>;

  console.log("playersAs: ", playersAs);
  const arrayPlayersAs = playersAs.map((p) => p.player);

  const merged = [...players, ...arrayPlayersAs];

  const uniqueExclusive = merged.filter(
    (player) =>
      !(
        players.some((p) => p.id === player.id) &&
        arrayPlayersAs.some((p) => p.id === player.id)
      ),
  );

  return (
    <Dialog open={createAssocOpen} onOpenChange={setCreateAssocOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button
            className="cursor-pointer bg-gradient-to-r from-[#ad45ff] to-[#c77dff] hover:from-[#9c3ee6] hover:to-[#b66de6] text-white shadow-lg shadow-[#ad45ff]/25 hover:shadow-xl hover:shadow-[#ad45ff]/30 transition-all duration-300"
            size="sm"
            title="Agregar jugador al equipo"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            title="Editar asociación"
            className="cursor-pointer hover:bg-[#ad45ff]/10 hover:text-[#ad45ff] transition-colors"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-[400px] sm:max-w-[550px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl shadow-black/50 rounded-2xl p-0">
        {/* Barra de acento dorada Premium Golazo */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-t-2xl" />
        <div className="h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />

        {/* Header con gradiente */}
        <div className="relative px-6 pt-6 pb-4">
          {/* Efectos de fondo decorativos */}
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-[#ad45ff]/20 to-[#c77dff]/10 rounded-full blur-2xl pointer-events-none" />

          <DialogHeader className="space-y-3 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[#ad45ff] to-[#c77dff] rounded-xl shadow-lg shadow-[#ad45ff]/30">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                  {mode === "create"
                    ? "Asociar Jugador al Equipo"
                    : "Editar Asociación"}
                </DialogTitle>
                <DialogDescription className="text-gray-400 mt-1">
                  Da de alta y actualiza jugadores asociados al equipo
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={onSubmitLocal} className="space-y-6 px-6 pb-6">
          {/* Card: Torneo y Equipo */}
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-amber-500/20 rounded-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-amber-400">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Trophy className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-lg font-bold">Torneo y Equipo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Info del Torneo */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Torneo
                </Label>
                <p className="text-xl font-bold text-white">
                  {tournamentData.name}
                </p>
              </div>

              {/* Info del Equipo */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Equipo
                </Label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-700 overflow-hidden flex items-center justify-center border border-slate-600">
                    {teamData?.team?.logoUrl ? (
                      <img
                        src={teamData.team.logoUrl}
                        alt={teamData.team.name}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <Shield className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <span className="text-xl font-bold text-white">
                    {teamData?.team?.name}
                  </span>
                </div>
              </div>

              {/* Jugadores ya en el equipo */}
              {playersAs.length > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Jugadores en el equipo ({playersAs.length})
                  </Label>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-700/50 divide-y divide-slate-700/50">
                    {playersAs.map((j) => (
                      <div
                        key={j.id}
                        className="flex items-center justify-between gap-3 p-3 hover:bg-slate-700/30 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 border border-slate-600">
                            <img
                              src={j.player.imageUrlFace || "/placeholder.svg"}
                              alt={j.player.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-sm font-medium text-white">
                            {j.player.name}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(j)}
                          disabled={isDeleting}
                          className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                          title="Desasociar jugador"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card: Seleccionar Jugador */}
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-[#ad45ff]/20 rounded-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#ad45ff] to-[#c77dff]" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-[#ad45ff]">
                <div className="p-2 bg-[#ad45ff]/20 rounded-lg">
                  <Users className="h-5 w-5 text-[#ad45ff]" />
                </div>
                <span className="text-lg font-bold">Seleccionar Jugador</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {uniqueExclusive.length ? (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Jugador disponible
                  </Label>
                  <Select
                    onValueChange={(v) => update("playerId", v)}
                    disabled={isLoading}
                    name="playerId"
                  >
                    <SelectTrigger className="w-full h-12 bg-slate-800/50 border-2 border-slate-600 hover:border-[#ad45ff]/50 focus:border-[#ad45ff] rounded-xl text-white transition-colors">
                      <SelectValue placeholder="Seleccione un jugador..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {uniqueExclusive.map((p) => (
                        <SelectItem
                          key={p.id}
                          value={p.id}
                          className="text-white hover:bg-[#ad45ff]/20 focus:bg-[#ad45ff]/20 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 border border-slate-600">
                              <img
                                src={p.imageUrlFace || "/placeholder.svg"}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-medium">{p.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                  <p className="text-red-400 font-medium">
                    No existen más jugadores registrados en el sistema para
                    poder asociar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card: Fechas */}
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-emerald-500/20 rounded-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-emerald-400">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-lg font-bold">Fechas de Asociación</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha de ingreso */}
                <div className="space-y-2">
                  <Label
                    htmlFor="joinedAt"
                    className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"
                  >
                    <CalendarCheck className="w-4 h-4 text-emerald-400" />
                    Fecha de ingreso
                  </Label>
                  <Input
                    type="date"
                    id="joinedAt"
                    name="joinedAt"
                    value={values.joinedAt}
                    onChange={(e) => update("joinedAt", e.target.value)}
                    required
                    className="h-12 bg-slate-800/50 border-2 border-slate-600 hover:border-emerald-500/50 focus:border-emerald-500 rounded-xl text-white transition-colors [color-scheme:dark]"
                  />
                </div>

                {/* Fecha de salida */}
                <div className="space-y-2">
                  <Label
                    htmlFor="leftAt"
                    className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"
                  >
                    <CalendarX className="w-4 h-4 text-slate-400" />
                    Fecha de salida (opcional)
                  </Label>
                  <Input
                    type="date"
                    id="leftAt"
                    name="leftAt"
                    value={values.leftAt}
                    onChange={(e) => update("leftAt", e.target.value)}
                    className="h-12 bg-slate-800/50 border-2 border-slate-600 hover:border-slate-500 focus:border-slate-400 rounded-xl text-white transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateAssocOpen(false)}
              disabled={isLoading}
              className="px-6 h-12 bg-transparent border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 rounded-xl font-semibold transition-all duration-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !values.playerId}
              className="px-6 h-12 bg-gradient-to-r from-[#ad45ff] to-[#c77dff] hover:from-[#9c3ee6] hover:to-[#b66de6] text-white shadow-lg shadow-[#ad45ff]/25 hover:shadow-xl hover:shadow-[#ad45ff]/30 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : mode === "edit" ? (
                "Guardar cambios"
              ) : (
                "Asociar jugador"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Diálogo de confirmación para desasociar */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-red-500/30 shadow-2xl shadow-black/50 rounded-2xl">
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500 rounded-t-2xl absolute top-0 left-0 right-0" />

          <AlertDialogHeader className="pt-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-white">
                Confirmar desasociación
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-400 mt-4 leading-relaxed">
              ¿Estás seguro de que deseas desasociar a{" "}
              <span className="font-semibold text-white">
                {playerToDelete?.player.name}
              </span>{" "}
              del equipo{" "}
              <span className="font-semibold text-amber-400">
                {teamData?.team?.name}
              </span>
              ?
              <br />
              <span className="text-red-400 text-sm mt-2 block">
                ⚠️ Esta acción también eliminará los goles y tarjetas
                registradas de este jugador en este equipo.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-3 mt-4">
            <AlertDialogCancel
              disabled={isDeleting}
              className="px-6 h-11 bg-transparent border-2 border-slate-600 text-gray-300 hover:bg-slate-700 hover:border-slate-500 rounded-xl font-medium transition-all duration-300"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="px-6 h-11 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Desasociar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default DialogAddEditTeamPlayer;
