"use clinet";

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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trophy, UserPlus, Users } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
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
  const [error, setError] = useState<string | null>(null);

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
  }, []);

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
            className="cursor-pointer bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white shadow-lg hover:shadow-xl transition-all duration-200"
            size="sm"
            title="Agregar asociación"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            title="Editar asociación"
            className="cursor-pointer"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <div className="relative bg-gradient-to-r from-[#ad45ff]/10 to-[#a3b3ff]/10 p-6 border-b border-gray-100/50">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-lg shadow-lg">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-800 text-left">
                  {mode === "create"
                    ? "Asociar jugador al equipo"
                    : "Editar asociación"}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 text-left mt-1">
                  Da de alta y actualiza jugadores asociados al equipo
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Elementos decorativos */}
          <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-[#ad45ff]/20 to-[#a3b3ff]/20 rounded-full blur-xl pointer-events-none" />
        </div>

        <form onSubmit={onSubmitLocal} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Torneo y Equipo
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-1 space-y-2">
              <div className="col-span-2 gap-4">
                <Label htmlFor="torneoId" className="text-2xl">
                  Torneo: {tournamentData.name}
                </Label>
                <Label htmlFor="equipoId" className="text-2xl pt-2">
                  Equipo:{" "}
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        teamData?.team?.logoUrl ||
                        "/placeholder.svg?height=16&width=16&query=team-logo"
                      }
                      alt={`Logo ${teamData?.team?.name}`}
                      className="w-8 h-8 object-cover"
                    />
                    <span>{teamData?.team?.name}</span>
                  </div>
                </Label>
              </div>

              {playersAs.length > 0 && (
                <>
                  <Separator className="m-2" />
                  <div className="col-span-2 gap-4">
                    <Label className="pb-2"> Jugadores en el equipo</Label>
                    <div className="max-h-64 overflow-y-auto rounded-md border p-2">
                      {playersAs.map((j) => (
                        <div
                          key={j.id}
                          className="text-sm flex items-center gap-2 hover:bg-blue-300 p-2"
                        >
                          <img
                            src={
                              j.player.imageUrlFace ||
                              "/placeholder.svg?height=16&width=16&query=team-logo"
                            }
                            alt={`Logo ${j.player.name}`}
                            className="w-8 h-8 rounded object-cover border"
                          />
                          {j.player.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator className="m-2" />
              <div className="col-span-2 gap-4">
                <Label
                  htmlFor="playerId"
                  className="pb-1 flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <Users className="w-4 h-4 text-[#ad45ff]" />
                  Jugadores
                </Label>
                {uniqueExclusive.length ? (
                  <Select
                    onValueChange={(v) => update("playerId", v)}
                    disabled={isLoading}
                    name="playerId"
                  >
                    <SelectTrigger className="mt-1 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm">
                      <SelectValue placeholder="Seleccione un jugador" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueExclusive.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                p.imageUrlFace ||
                                "/placeholder.svg?height=16&width=16&query=team-logo"
                              }
                              alt={`Logo ${p.name}`}
                              className="w-6 h-6 rounded object-cover border"
                            />
                            {p.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-red-600 ">
                    No existen mas jugadores registrados en el sistema para
                    poder asociar
                  </p>
                )}
              </div>

              {/* Inputs de fecha */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="joinedAt" className="pb-1">
                    Fecha en la que se unió
                  </Label>
                  <Input
                    type="date"
                    id="joinedAt"
                    name="joinedAt"
                    value={values.joinedAt}
                    onChange={(e) => update("joinedAt", e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leftAt" className="pb-1">
                    Fecha en la que dejó el equipo (opcional)
                  </Label>
                  <Input
                    type="date"
                    id="leftAt"
                    name="leftAt"
                    value={values.leftAt}
                    onChange={(e) => update("leftAt", e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setCreateAssocOpen(false)}
              disabled={isLoading}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer"
            >
              {isLoading
                ? "Cargando..."
                : mode === "edit"
                  ? "Guardar cambios"
                  : "Asociar jugador"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogAddEditTeamPlayer;
