"use client";

import type React from "react";

import { useEffect, useMemo, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Hash,
  Trophy,
  ClipboardPen,
  Info,
  Shield,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ITeam } from "@modules/equipos/types/types";
import { ITournamentTeam } from "@modules/torneos/types/tournament-teams.types";
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
    [teams, values.teamId],
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
    method: "POST" | "PATCH" = "POST",
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
            : "Equipo actualizado correctamente",
        );
        router.refresh();
      } else {
        const errorData = await res.json();
        console.error("Error del servidor:", errorData);
        toast.error(
          method === "POST" ? "Error al asociar" : "Error al actualizar",
        );
      }
    } catch (error) {
      console.error(
        `${method} === "POST" ? "Error al asociar" : "Error al actualizar": ${error}`,
      );
      toast.error(
        `${method} === "POST" ? "Error al asociar" : "Error al actualizar": ${error}`,
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
      return;
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
      {/* Team Selection and Group - Premium Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-[#ad45ff] to-[#c77dff] rounded-lg">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Equipo y Grupo
          </h3>
        </div>

        <div className="space-y-4">
          {/* Team Selection */}
          <div>
            <Label
              htmlFor="teamId"
              className="text-gray-700 dark:text-gray-300 font-medium"
            >
              Equipo{" "}
              {mode === "create" && <span className="text-red-500">*</span>}
            </Label>
            {mode === "edit" && tournamentTeam?.team?.name && (
              <div className="mt-2 flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white dark:border-gray-700 shadow-md">
                  <img
                    src={tournamentTeam.team.logoUrl || "/placeholder.svg"}
                    alt={tournamentTeam.team.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {tournamentTeam.team.name}
                  </p>
                  {tournamentTeam.team.shortName && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {tournamentTeam.team.shortName}
                    </p>
                  )}
                </div>
              </div>
            )}
            {mode === "create" && (
              <Select
                value={values.teamId}
                onValueChange={(v) => update("teamId", v)}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="teamId"
                  className="mt-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-[#ad45ff] focus:border-[#ad45ff] h-12"
                >
                  <SelectValue placeholder="Selecciona un equipo" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl max-h-[300px]">
                  {availableTeams.map((t) => (
                    <SelectItem
                      key={t.id}
                      value={t.id}
                      className="py-3 cursor-pointer hover:bg-[#ad45ff]/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                          <img
                            src={t.logoUrl || "/placeholder.svg"}
                            alt={`Logo ${t.name}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {t.name}
                        </span>
                        {t.shortName && (
                          <Badge className="bg-[#ad45ff]/10 text-[#ad45ff] border-0 text-xs">
                            {t.shortName}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {selectedTeam && mode === "create" && (
              <div className="mt-3 flex items-center gap-3 p-3 bg-[#ad45ff]/5 dark:bg-[#ad45ff]/10 rounded-xl border border-[#ad45ff]/20">
                <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white dark:border-gray-700 shadow-md">
                  <img
                    src={selectedTeam.logoUrl || "/placeholder.svg"}
                    alt={selectedTeam.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedTeam.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedTeam.homeColor && (
                      <div className="flex items-center gap-1">
                        <span
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: selectedTeam.homeColor }}
                        />
                        <span className="text-xs text-gray-500">Local</span>
                      </div>
                    )}
                    {selectedTeam.awayColor && (
                      <div className="flex items-center gap-1">
                        <span
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: selectedTeam.awayColor }}
                        />
                        <span className="text-xs text-gray-500">Visitante</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Group Input */}
          <div>
            <Label
              htmlFor="group"
              className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2"
            >
              <Users className="h-4 w-4 text-[#c77dff]" />
              Grupo
            </Label>
            <Input
              id="group"
              placeholder='Ej: "A", "B"'
              maxLength={2}
              value={values.group ?? ""}
              onChange={(e) => update("group", e.target.value.toUpperCase())}
              disabled={isLoading}
              className="mt-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-[#ad45ff] focus:border-[#ad45ff] h-12 text-center text-lg font-bold uppercase"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Deja vacío si el torneo no tiene grupos.
            </p>
          </div>

          {/* Eliminated Switch */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  values.isEliminated
                    ? "bg-red-100 dark:bg-red-900/30"
                    : "bg-green-100 dark:bg-green-900/30",
                )}
              >
                <Shield
                  className={cn(
                    "h-4 w-4",
                    values.isEliminated
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400",
                  )}
                />
              </div>
              <div>
                <Label
                  htmlFor="isEliminated"
                  className="text-gray-900 dark:text-white font-medium cursor-pointer"
                >
                  Estado del equipo
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {values.isEliminated
                    ? "Eliminado del torneo"
                    : "En competencia activa"}
                </p>
              </div>
            </div>
            <Switch
              id="isEliminated"
              checked={!!values.isEliminated}
              onCheckedChange={(checked) => update("isEliminated", checked)}
              disabled={isLoading}
              className="data-[state=checked]:bg-red-500"
            />
          </div>
        </div>
      </div>

      {/* Stats - Premium Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-[#c77dff] to-[#a3b3ff] rounded-lg">
            <Hash className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Estadísticas
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Partidos Jugados */}
          <div className="space-y-2">
            <Label
              htmlFor="matchesPlayed"
              className="text-xs font-medium text-gray-600 dark:text-gray-400"
            >
              Partidos Jugados
            </Label>
            <Input
              id="matchesPlayed"
              type="number"
              min={0}
              value={values.matchesPlayed}
              onChange={(e) =>
                handleNumberChange("matchesPlayed", e.target.value)
              }
              disabled={isLoading}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-[#ad45ff] focus:border-[#ad45ff] h-12 text-center font-bold text-lg"
            />
          </div>

          {/* Ganados */}
          <div className="space-y-2">
            <Label
              htmlFor="wins"
              className="text-xs font-medium text-green-600 dark:text-green-400"
            >
              Ganados
            </Label>
            <Input
              id="wins"
              type="number"
              min={0}
              value={values.wins}
              onChange={(e) => handleNumberChange("wins", e.target.value)}
              disabled={isLoading}
              className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 rounded-xl focus:ring-green-500 focus:border-green-500 h-12 text-center font-bold text-lg text-green-700 dark:text-green-400"
            />
          </div>

          {/* Empatados */}
          <div className="space-y-2">
            <Label
              htmlFor="draws"
              className="text-xs font-medium text-gray-600 dark:text-gray-400"
            >
              Empatados
            </Label>
            <Input
              id="draws"
              type="number"
              min={0}
              value={values.draws}
              onChange={(e) => handleNumberChange("draws", e.target.value)}
              disabled={isLoading}
              className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-gray-500 focus:border-gray-500 h-12 text-center font-bold text-lg"
            />
          </div>

          {/* Perdidos */}
          <div className="space-y-2">
            <Label
              htmlFor="losses"
              className="text-xs font-medium text-red-600 dark:text-red-400"
            >
              Perdidos
            </Label>
            <Input
              id="losses"
              type="number"
              min={0}
              value={values.losses}
              onChange={(e) => handleNumberChange("losses", e.target.value)}
              disabled={isLoading}
              className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 rounded-xl focus:ring-red-500 focus:border-red-500 h-12 text-center font-bold text-lg text-red-700 dark:text-red-400"
            />
          </div>

          {/* Goles a Favor */}
          <div className="space-y-2">
            <Label
              htmlFor="goalsFor"
              className="text-xs font-medium text-blue-600 dark:text-blue-400"
            >
              Goles a Favor
            </Label>
            <Input
              id="goalsFor"
              type="number"
              min={0}
              value={values.goalsFor}
              onChange={(e) => handleNumberChange("goalsFor", e.target.value)}
              disabled={isLoading}
              className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 rounded-xl focus:ring-blue-500 focus:border-blue-500 h-12 text-center font-bold text-lg text-blue-700 dark:text-blue-400"
            />
          </div>

          {/* Goles en Contra */}
          <div className="space-y-2">
            <Label
              htmlFor="goalsAgainst"
              className="text-xs font-medium text-orange-600 dark:text-orange-400"
            >
              Goles en Contra
            </Label>
            <Input
              id="goalsAgainst"
              type="number"
              min={0}
              value={values.goalsAgainst}
              onChange={(e) =>
                handleNumberChange("goalsAgainst", e.target.value)
              }
              disabled={isLoading}
              className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 rounded-xl focus:ring-orange-500 focus:border-orange-500 h-12 text-center font-bold text-lg text-orange-700 dark:text-orange-400"
            />
          </div>

          {/* Diferencia de Gol - Computed */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Diferencia de Gol
            </Label>
            <div
              className={cn(
                "h-12 px-3 rounded-xl border flex items-center justify-center text-lg font-bold",
                computed.goalDifference > 0
                  ? "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                  : computed.goalDifference < 0
                    ? "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
                    : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400",
              )}
            >
              {computed.goalDifference > 0 ? "+" : ""}
              {computed.goalDifference}
            </div>
          </div>

          {/* Puntos - Computed Premium */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-[#ad45ff]">Puntos</Label>
            <div className="h-12 px-3 rounded-xl bg-gradient-to-r from-[#ad45ff] to-[#c77dff] flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-[#ad45ff]/25">
              {computed.points}
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-4 flex items-start gap-3 p-3 bg-[#ad45ff]/5 dark:bg-[#ad45ff]/10 rounded-xl border border-[#ad45ff]/20">
          <Info className="h-4 w-4 text-[#ad45ff] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Los <span className="font-semibold text-[#ad45ff]">puntos</span> se
            calculan automáticamente:{" "}
            <span className="font-medium">3 por victoria</span> y{" "}
            <span className="font-medium">1 por empate</span>. La diferencia de
            gol se calcula como GF - GC.
          </p>
        </div>
      </div>

      {/* Notes - Premium Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-[#a3b3ff] to-[#ad45ff] rounded-lg">
            <ClipboardPen className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Notas</h3>
        </div>

        <Textarea
          id="notes"
          placeholder='Ejemplo: "Equipo registrado por el capitán.", "Capitán: Juan Pérez"...'
          value={values.notes ?? ""}
          onChange={(e) => update("notes", e.target.value)}
          rows={3}
          disabled={isLoading}
          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-[#ad45ff] focus:border-[#ad45ff] resize-none"
        />
      </div>

      {/* Action Buttons - Premium Style */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="cursor-pointer border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl px-6"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="cursor-pointer bg-gradient-to-r from-[#ad45ff] to-[#c77dff] hover:from-[#9c3ee6] hover:to-[#b66de6] text-white shadow-lg shadow-[#ad45ff]/25 hover:shadow-xl hover:shadow-[#ad45ff]/30 transition-all duration-300 rounded-xl px-6"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Procesando...
            </span>
          ) : mode === "edit" ? (
            "Guardar cambios"
          ) : (
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Asociar equipo
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}

export default TournamentTeamForm;
