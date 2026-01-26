"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { IPartidos } from "@modules/partidos/types";
import { getTournamentTeamPlayers } from "@modules/equipos/actions/getTournamentTeamPlayers";
import { addGoal, deleteGoal } from "@modules/partidos/actions/goals";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ManageGoalsProps {
  match: IPartidos;
  onUpdate: () => void;
}

interface PlayerOption {
  id: string; // TeamPlayer ID
  name: string;
  number: number | null;
}

export default function ManageGoals({ match, onUpdate }: ManageGoalsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPlayers, setIsFetchingPlayers] = useState(false);

  const [homePlayers, setHomePlayers] = useState<PlayerOption[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<PlayerOption[]>([]);

  // Form states
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    match.homeTeamId,
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [minute, setMinute] = useState<string>("");
  const [isOwnGoal, setIsOwnGoal] = useState(false);
  const [isPenalty, setIsPenalty] = useState(false);

  const goals = match.goals || [];
  const sortedGoals = [...goals].sort((a, b) => a.minute - b.minute);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setIsFetchingPlayers(true);
    try {
      const [home, away] = await Promise.all([
        getTournamentTeamPlayers(match.homeTeamId),
        getTournamentTeamPlayers(match.awayTeamId),
      ]);

      setHomePlayers(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        home.map((tp: any) => ({
          id: tp.id,
          name: tp.player.name,
          number: tp.number,
        })),
      );

      setAwayPlayers(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        away.map((tp: any) => ({
          id: tp.id,
          name: tp.player.name,
          number: tp.number,
        })),
      );
    } catch (error) {
      console.error("Error fetching players:", error);
      toast.error("Error al cargar jugadores");
    } finally {
      setIsFetchingPlayers(false);
    }
  };

  const handleAddGoal = async () => {
    if (!selectedPlayerId || !minute) {
      toast.warning("Faltan datos obligatorios");
      return;
    }

    setIsLoading(true);
    try {
      const res = await addGoal({
        matchId: match.id,
        teamPlayerId: selectedPlayerId,
        teamId: selectedTeamId,
        minute: parseInt(minute),
        isOwnGoal,
        isPenalty,
      });

      if (res.success) {
        toast.success("Gol agregado");
        setMinute("");
        setIsOwnGoal(false);
        setIsPenalty(false);
        onUpdate();
      } else {
        toast.error(res.error || "Error al agregar");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("¿Estás seguro de eliminar este gol?")) return;

    setIsLoading(true);
    try {
      const res = await deleteGoal(goalId);
      if (res.success) {
        toast.success("Gol eliminado");
        onUpdate();
      } else {
        toast.error(res.error || "Error al eliminar");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const currentPlayers =
    selectedTeamId === match.homeTeamId ? homePlayers : awayPlayers;

  return (
    <div className="space-y-6 py-2">
      {/* Marcador Actual dentro del Tab */}
      <div className="flex justify-center items-center gap-8 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
        <div className="text-center">
          <span className="block text-sm text-muted-foreground">
            {match.homeTeam.team.name}
          </span>
          <span className="text-4xl font-bold">{match.homeScore ?? 0}</span>
        </div>
        <div className="text-2xl text-muted-foreground font-light">-</div>
        <div className="text-center">
          <span className="block text-sm text-muted-foreground">
            {match.awayTeam.team.name}
          </span>
          <span className="text-4xl font-bold">{match.awayScore ?? 0}</span>
        </div>
      </div>

      <div className="space-y-4 border rounded-lg p-4 bg-slate-50/50 dark:bg-slate-900/50">
        <h4 className="font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Gol
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Equipo</Label>
            <Select
              value={selectedTeamId}
              onValueChange={(v) => {
                setSelectedTeamId(v);
                setSelectedPlayerId("");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={match.homeTeamId}>
                  {match.homeTeam.team.name}
                </SelectItem>
                <SelectItem value={match.awayTeamId}>
                  {match.awayTeam.team.name}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Minuto</Label>
            <Input
              type="number"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              placeholder="Ej: 45"
              min="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Jugador</Label>
          <Select
            value={selectedPlayerId}
            onValueChange={setSelectedPlayerId}
            disabled={isFetchingPlayers}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isFetchingPlayers ? "Cargando..." : "Selecciona jugador"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {currentPlayers.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.number ? `#${player.number} ` : ""}
                  {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isOwnGoal"
              checked={isOwnGoal}
              onCheckedChange={(c) => setIsOwnGoal(!!c)}
            />
            <Label htmlFor="isOwnGoal" className="cursor-pointer">
              En contra
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPenalty"
              checked={isPenalty}
              onCheckedChange={(c) => setIsPenalty(!!c)}
            />
            <Label htmlFor="isPenalty" className="cursor-pointer">
              Penal
            </Label>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleAddGoal}
          disabled={isLoading || !selectedPlayerId || !minute}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Agregar Gol
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Historial de Goles
        </h4>
        {sortedGoals.length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center py-4">
            Sin goles registrados
          </p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {sortedGoals.map((goal) => {
              const p =
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (goal as any).teamPlayer?.player?.name || "Jugador desconocido";
              return (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-2 rounded border bg-card text-card-foreground text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-10 justify-center">
                      {goal.minute}&apos;
                    </Badge>
                    <div className="flex flex-col">
                      <span className="font-medium">{p}</span>
                      <div className="flex gap-1">
                        {goal.isPenalty && (
                          <span className="text-xs text-blue-600 bg-blue-100 px-1 rounded">
                            Penal
                          </span>
                        )}
                        {goal.isOwnGoal && (
                          <span className="text-xs text-red-600 bg-red-100 px-1 rounded">
                            En contra
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteGoal(goal.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
