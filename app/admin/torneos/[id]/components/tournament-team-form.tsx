"use client";

import type React from "react";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, Hash, Trophy, ClipboardPen, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ITeam } from "@/components/equipos/types";
import { ITournamentTeam } from "@/components/tournament-teams/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface TournamentTeamForm {
  teamId: string | undefined;
  group: string | undefined;
  isEliminated: boolean | undefined;
  notes: string | undefined;
  matchesPlayed: number | undefined;
  wins: number | undefined;
  draws: number | undefined;
  losses: number | undefined;
  goalsFor: number | undefined;
  goalsAgainst: number | undefined;
  goalDifference: number | undefined;
  points: number | undefined;
  tournamentId: string | undefined;
}

interface PropsTournamentTeamForm {
  mode: "create" | "edit";
  tournamentId: string;
  teams: ITeam[];
  tournamentTeam: ITournamentTeam | null;
  usedTeamIds?: string[];
  initialValues?: Partial<ITournamentTeam>;
  onCancel: () => void;
}

export interface TournamentTeamData {
  matchesPlayed: number;
  goalDifference: number;
  points: number;
  tournamentId: string;
  teamId?: string;
  group?: string;
  isEliminated?: boolean;
  notes?: string;
  wins?: number;
  draws?: number;
  losses?: number;
  goalsFor?: number;
  goalsAgainst?: number;
}

export function TournamentTeamForm({
  mode,
  tournamentId,
  teams,
  tournamentTeam,
  usedTeamIds = [],
  onCancel,
}: Readonly<PropsTournamentTeamForm>) {
  console.log(tournamentTeam);
  const isEdit = mode === "edit";

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [values, setValues] = useState<TournamentTeamForm>({
    teamId: isEdit ? tournamentTeam?.teamId : "",
    group: isEdit ? tournamentTeam?.group : "",
    isEliminated: isEdit ? tournamentTeam?.isEliminated : false,
    notes: isEdit ? tournamentTeam?.notes : "",
    matchesPlayed: isEdit ? tournamentTeam?.matchesPlayed : 0,
    wins: isEdit ? tournamentTeam?.wins : 0,
    draws: isEdit ? tournamentTeam?.draws : 0,
    losses: isEdit ? tournamentTeam?.losses : 0,
    goalsFor: isEdit ? tournamentTeam?.goalsFor : 0,
    goalsAgainst: isEdit ? tournamentTeam?.goalsAgainst : 0,
    // computed only for preview, we still pass them as part of values sent from parent for consistency
    goalDifference: isEdit ? tournamentTeam?.goalDifference : 0,
    points: isEdit ? tournamentTeam?.points : 0,
    tournamentId,
  });

  // Compute derived fields on the fly
  const computed = useMemo(() => {
    const goalDifference = (values.goalsFor || 0) - (values.goalsAgainst || 0);
    const points = (values.wins || 0) * 3 + (values.draws || 0) * 1;
    return { goalDifference, points };
  }, [values.goalsFor, values.goalsAgainst, values.wins, values.draws]);

  useEffect(() => {
    setValues((prev: TournamentTeamForm) => ({
      ...prev,
      tournamentId,
      goalDifference: computed.goalDifference,
      points: computed.points,
    }));
  }, [computed.goalDifference, computed.points, tournamentId]);

  const availableTeams = useMemo(() => {
    if (mode === "edit" && tournamentTeam?.teamId) {
      // Allow the current team on edit
      return teams;
    }
    const usedSet = new Set(usedTeamIds);
    return teams.filter((t) => !usedSet.has(t.id));
  }, [teams, usedTeamIds, mode, tournamentTeam?.teamId]);

  const selectedTeam = useMemo(
    () => teams.find((t) => t.id === values.teamId),
    [teams, values.teamId]
  );

  const update = (field: string, newValue: number | string | boolean) => {
    setValues((prev: TournamentTeamForm) => ({ ...prev, [field]: newValue }));
  };

  const clampNonNegative = (n: number) =>
    Number.isFinite(n) && n >= 0 ? n : 0;

  const handleNumberChange = (field: string, v: string) => {
    const n = clampNonNegative(Number.parseInt(v || "0", 10));
    update(field, n);
  };

  const asociarEquipo = async (
    formData: TournamentTeamData,
    method: "POST" | "PATCH" = "POST"
  ) => {
    try {
      setIsLoading(true);
      const url =
        method === "POST"
          ? "/api/tournament-teams"
          : `/api/tournament-teams/${tournamentTeam?.id}`; // PATCH necesita id

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsLoading(false);
        toast.success(
          method === "POST"
            ? "Equipo asociado correctamente"
            : "Equipo actualizado correctamente"
        );
        router.refresh();
      } else {
        const errorData = await res.json();
        console.error("Error del servidor:", errorData);
        toast.error(
          method === "POST" ? "Error al asociar" : "Error al actualizar"
        );
      }
    } catch (error) {
      console.error(
        `${method} === "POST" ? "Error al asociar" : "Error al actualizar": ${error}`
      );
      toast.error(
        `${method} === "POST" ? "Error al asociar" : "Error al actualizar": ${error}`
      );
    } finally {
      setIsLoading(false);
      onCancel();
    }
  };

  const onSubmitLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.teamId) {
      toast.error("Debe de seleccionar un equipo.");
    }
    // Optional: basic sanity for MP = W+D+L
    const mp = values.matchesPlayed || 0;
    const sum = (values.wins || 0) + (values.draws || 0) + (values.losses || 0);
    const fixed = sum > mp ? sum : mp;
    const data: TournamentTeamData = {
      ...values,
      matchesPlayed: fixed,
      goalDifference: computed.goalDifference,
      points: computed.points,
      tournamentId,
    };

    const method = mode === "create" ? "POST" : "PATCH";
    await asociarEquipo(data, method);
  };

  return (
    <form onSubmit={onSubmitLocal} className="space-y-6">
      {/* Team Selection and Group */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Equipo y Grupo
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-1 gap-4">
          <div>
            <Label htmlFor="teamId">
              Equipo{" "}
              {mode === "create" && <span className="text-red-500">*</span>}
              {mode === "edit" && tournamentTeam?.team.name}
            </Label>
            {mode === "create" && (
              <Select
                value={values.teamId}
                onValueChange={(v) => update("teamId", v)}
                disabled={isLoading}
              >
                <SelectTrigger id="teamId">
                  <SelectValue placeholder="Selecciona un equipo" />
                </SelectTrigger>
                <SelectContent>
                  {availableTeams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            t.logoUrl ||
                            "/placeholder.svg?height=16&width=16&query=team-logo"
                          }
                          alt={`Logo ${t.name}`}
                          className="w-4 h-4 rounded object-cover border"
                        />
                        <span>{t.name}</span>
                        {t.shortName && (
                          <Badge variant="outline" className="ml-1">
                            {t.shortName}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {selectedTeam && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Seleccionado:</span>
                <span className="font-medium">{selectedTeam.name}</span>
                {selectedTeam.homeColor && (
                  <span
                    className="inline-block w-3 h-3 rounded-full border"
                    style={{ backgroundColor: selectedTeam.homeColor }}
                    title="Color local"
                  />
                )}
                {selectedTeam.awayColor && (
                  <span
                    className="inline-block w-3 h-3 rounded-full border"
                    style={{ backgroundColor: selectedTeam.awayColor }}
                    title="Color visitante"
                  />
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="group" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Grupo
            </Label>
            <Input
              id="group"
              placeholder='Ej: "A", "B"'
              maxLength={2}
              value={values.group ?? ""}
              onChange={(e) => update("group", e.target.value.toUpperCase())}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Deja vacío si el torneo no tiene grupos.
            </p>
          </div>

          <div className="col-span-full flex items-center gap-3">
            <Switch
              id="isEliminated"
              checked={!!values.isEliminated}
              onCheckedChange={(checked) => update("isEliminated", checked)}
              disabled={isLoading}
            />
            <Label htmlFor="isEliminated">Equipo eliminado</Label>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Estadísticas
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="matchesPlayed">Partidos Jugados</Label>
            <Input
              id="matchesPlayed"
              type="number"
              min={0}
              value={values.matchesPlayed}
              onChange={(e) =>
                handleNumberChange("matchesPlayed", e.target.value)
              }
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="wins">Ganados</Label>
            <Input
              id="wins"
              type="number"
              min={0}
              value={values.wins}
              onChange={(e) => handleNumberChange("wins", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="draws">Empatados</Label>
            <Input
              id="draws"
              type="number"
              min={0}
              value={values.draws}
              onChange={(e) => handleNumberChange("draws", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="losses">Perdidos</Label>
            <Input
              id="losses"
              type="number"
              min={0}
              value={values.losses}
              onChange={(e) => handleNumberChange("losses", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="goalsFor">Goles a Favor</Label>
            <Input
              id="goalsFor"
              type="number"
              min={0}
              value={values.goalsFor}
              onChange={(e) => handleNumberChange("goalsFor", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="goalsAgainst">Goles en Contra</Label>
            <Input
              id="goalsAgainst"
              type="number"
              min={0}
              value={values.goalsAgainst}
              onChange={(e) =>
                handleNumberChange("goalsAgainst", e.target.value)
              }
              disabled={isLoading}
            />
          </div>
          <div>
            <Label>Diferencia de Gol</Label>
            <div
              className={cn(
                "h-10 px-3 rounded-md border flex items-center text-sm bg-muted",
                computed.goalDifference < 0 ? "text-red-600" : "text-foreground"
              )}
            >
              {computed.goalDifference}
            </div>
          </div>
          <div>
            <Label>Puntos</Label>
            <div className="h-10 px-3 rounded-md border flex items-center text-sm bg-muted">
              {computed.points}
            </div>
          </div>
          <div className="sm:col-span-2 flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5" />
            <p>
              Los puntos se calculan automáticamente: 3 por victoria y 1 por
              empate. La diferencia de gol se calcula como GF - GC.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardPen className="h-5 w-5" />
            Notas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="notes" className="sr-only">
            Notas
          </Label>
          <Textarea
            id="notes"
            placeholder='Ejemplo: "Equipo registrado por el capitán."'
            value={values.notes ?? ""}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            disabled={isLoading}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Cargando..."
            : mode === "edit"
            ? "Guardar cambios"
            : "Asociar equipo"}
        </Button>
      </div>
    </form>
  );
}

export default TournamentTeamForm;
