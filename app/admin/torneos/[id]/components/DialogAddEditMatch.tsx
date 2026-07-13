"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ITorneo } from "@modules/torneos/types";
import { Button } from "@/components/ui/button";
import {
  CalendarPlus,
  Edit,
  MapPin,
  Settings,
  Trophy,
  Target,
  Loader2,
  Calendar,
  Clock,
  Shield,
  Swords,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { IPartidos, MATCH_STATUS } from "@modules/partidos/types";
import { formatDateTimeLocal } from "@/lib/formatDate";

interface MatchFormValues {
  dateTime: string;
  stadium: string;
  city: string;
  description: string;
  status: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  tournamentPhaseId: string;
  homeScore: number | null;
  awayScore: number | null;
  penaltyWinnerTeamId: string | null;
  penaltyScoreHome: number | null;
  penaltyScoreAway: number | null;
  walkoverWinnerTeamId: string | null;
  roundNumber: number | null;
}

interface DialogAddEditMatchProps {
  mode: "create" | "edit";
  tournamentData: ITorneo;
  matchData?: IPartidos; // Puedes definir una interfaz para los datos del partido si la tienes
  onSuccess?: () => void; // Callback para refrescar la lista después de guardar
}

const DialogAddEditMatch = (props: DialogAddEditMatchProps) => {
  const { mode, tournamentData, matchData, onSuccess } = props;

  const isEdit = mode === "edit";

  const router = useRouter();

  const [open, setOpen] = useState(false);
  // Fases del torneo (TournamentPhase) — vienen con los datos del torneo
  const phases = tournamentData.tournamentPhases ?? [];
  const [isLoading, setIsLoading] = useState(false);
  const [values, setValues] = useState<MatchFormValues>({
    dateTime: isEdit
      ? formatDateTimeLocal(new Date(matchData?.dateTime ?? new Date()))
      : formatDateTimeLocal(new Date()),
    stadium: isEdit ? (matchData?.stadium ?? "") : "",
    city: isEdit ? (matchData?.city ?? "") : "",
    description: isEdit ? (matchData?.description ?? "") : "",
    status: isEdit ? (matchData?.status ?? "") : "",
    tournamentId: tournamentData.id,
    homeTeamId: isEdit ? (matchData?.homeTeamId ?? "") : "",
    awayTeamId: isEdit ? (matchData?.awayTeamId ?? "") : "",
    tournamentPhaseId: isEdit ? (matchData?.tournamentPhaseId ?? "") : "",
    homeScore: isEdit ? (matchData?.homeScore ?? null) : null,
    awayScore: isEdit ? (matchData?.awayScore ?? null) : null,
    penaltyWinnerTeamId: isEdit ? (matchData?.penaltyWinnerTeamId ?? "") : "",
    penaltyScoreHome: isEdit ? (matchData?.penaltyScoreHome ?? null) : null,
    penaltyScoreAway: isEdit ? (matchData?.penaltyScoreAway ?? null) : null,
    walkoverWinnerTeamId: isEdit
      ? (matchData?.walkoverWinnerTeamId ?? "")
      : "",
    roundNumber: isEdit ? (matchData?.roundNumber ?? null) : null,
  });

  // Walkover (N7): el marcador lo fija el server (walkoverScore-0)
  const isWalkover = values.status === "WALKOVER";
  const walkoverScore = tournamentData.walkoverScore ?? 3;

  const update = (field: string, newValue: number | string | boolean) => {
    setValues((prev: MatchFormValues) => ({ ...prev, [field]: newValue }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!values.dateTime) {
      toast.warning("Debe de cargar Fecha y Hora");
      return;
    }

    if (!values.homeTeamId) {
      toast.warning("Debe de cargar el equipo local");
      return;
    }

    if (!values.awayTeamId) {
      toast.warning("Debe de cargar el equipo visitante");
      return;
    }

    if (values.homeTeamId === values.awayTeamId) {
      toast.warning("Un equipo no puede jugar contra sí mismo");
      return;
    }

    // Walkover (N7): el organizador solo marca el ganador; el server fija el 3-0
    if (isWalkover && !values.walkoverWinnerTeamId) {
      toast.warning("Indicá el equipo ganador del walkover");
      return;
    }

    const method = mode === "create" ? "POST" : "PATCH";

    try {
      setIsLoading(true);
      const url =
        method === "POST" ? "/api/matches" : `/api/matches/${matchData?.id}`; // PATCH necesita id

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
        onSuccess?.(); // Llamar al callback para refrescar la lista
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
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button className="bg-gradient-to-r from-brand to-brand-mid hover:from-brand-hover hover:to-brand-mid-hover text-white shadow-lg shadow-brand/25 rounded-xl px-5 py-2.5 font-medium transition-all duration-300">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Programar Partido
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            title="Editar partido"
            className="hover:bg-brand/10 hover:text-brand rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-2xl p-0">
        {/* Barra de acento superior */}
        <div className="h-1.5 bg-gradient-to-r from-brand via-brand-mid to-brand-2 rounded-t-2xl" />

        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-brand to-brand-mid rounded-xl shadow-lg shadow-brand/30">
              <CalendarPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                {mode === "create" ? "Programar Partido" : "Editar Partido"}
              </DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400">
                {mode === "create"
                  ? "Programa un nuevo partido para el torneo"
                  : "Actualiza los detalles del partido"}
              </DialogDescription>
            </div>
          </div>

          {/* Badge del torneo */}
          <div className="mt-4 flex items-center gap-2 p-3 bg-gradient-to-r from-brand/10 to-brand-mid/10 rounded-xl border border-brand/20">
            <Trophy className="w-4 h-4 text-brand" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Torneo:{" "}
              <span className="text-brand">{tournamentData.name}</span>
            </span>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="px-6 pb-6 space-y-5">
          {/* Sección: Fecha y Hora */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-brand to-brand-mid rounded-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Fecha y Hora
              </h3>
            </div>

            <div className="relative">
              <Label
                htmlFor="dateTime"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
              >
                Fecha y Hora del Partido *
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="datetime-local"
                  id="dateTime"
                  name="dateTime"
                  value={values.dateTime}
                  onChange={(e) => update("dateTime", e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-brand focus:border-brand h-12"
                  required
                />
              </div>
            </div>
          </div>

          {/* Sección: Equipos */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-brand to-brand-mid rounded-lg">
                <Swords className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Enfrentamiento
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Equipo Local */}
              <div className="space-y-2">
                <Label
                  htmlFor="homeTeamId"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Equipo Local *
                </Label>
                <Select
                  value={values.homeTeamId}
                  onValueChange={(v) => update("homeTeamId", v)}
                  disabled={isLoading}
                  name="homeTeamId"
                  required
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl h-14">
                    <SelectValue placeholder="Selecciona equipo local" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-0 shadow-xl">
                    {tournamentData.tournamentTeams?.map((t) => (
                      <SelectItem
                        key={t.id}
                        value={t.id}
                        className="rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              t?.team?.logoUrl ||
                              "/placeholder.svg?height=32&width=32&query=team-logo"
                            }
                            alt={`Logo ${t?.team?.name}`}
                            className="w-8 h-8 rounded-lg object-cover border-2 border-gray-100 dark:border-gray-700"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{t?.team?.name}</span>
                            {t?.team?.shortName && (
                              <span className="text-xs text-gray-500">
                                {t?.team?.shortName}
                              </span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* VS Indicator */}
              <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-mid flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  VS
                </div>
              </div>

              {/* Equipo Visitante */}
              <div className="space-y-2">
                <Label
                  htmlFor="awayTeamId"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Equipo Visitante *
                </Label>
                <Select
                  value={values.awayTeamId}
                  onValueChange={(v) => update("awayTeamId", v)}
                  disabled={isLoading}
                  name="awayTeamId"
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl h-14">
                    <SelectValue placeholder="Selecciona equipo visitante" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-0 shadow-xl">
                    {tournamentData.tournamentTeams?.map((t) => (
                      <SelectItem
                        key={t.id}
                        value={t.id}
                        className="rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              t?.team?.logoUrl ||
                              "/placeholder.svg?height=32&width=32&query=team-logo"
                            }
                            alt={`Logo ${t?.team?.name}`}
                            className="w-8 h-8 rounded-lg object-cover border-2 border-gray-100 dark:border-gray-700"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{t?.team?.name}</span>
                            {t?.team?.shortName && (
                              <span className="text-xs text-gray-500">
                                {t?.team?.shortName}
                              </span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Sección: Ubicación */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-brand to-brand-mid rounded-lg">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Ubicación
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="stadium"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Estadio
                </Label>
                <Input
                  type="text"
                  id="stadium"
                  name="stadium"
                  placeholder="Nombre del estadio"
                  value={values.stadium}
                  onChange={(e) => update("stadium", e.target.value)}
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-brand focus:border-brand h-12"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="city"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Ciudad
                </Label>
                <Input
                  type="text"
                  id="city"
                  name="city"
                  placeholder="Ciudad del partido"
                  value={values.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-brand focus:border-brand h-12"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Descripción
              </Label>
              <textarea
                id="description"
                name="description"
                placeholder="Notas adicionales sobre el partido..."
                value={values.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-brand focus:border-brand px-4 py-3 resize-none text-sm"
              />
            </div>
          </div>

          {/* Sección: Configuración del Partido */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-brand to-brand-mid rounded-lg">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Configuración
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Estado */}
              <div className="space-y-2">
                <Label
                  htmlFor="status"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Estado
                </Label>
                <Select
                  value={values.status}
                  onValueChange={(v) => update("status", v)}
                  disabled={isLoading}
                  name="status"
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl h-12">
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-0 shadow-xl">
                    {MATCH_STATUS.map((m) => (
                      <SelectItem
                        key={m.value}
                        value={m.value}
                        className="rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              m.value === "PROGRAMADO"
                                ? "bg-blue-500"
                                : m.value === "EN_JUEGO"
                                  ? "bg-green-500"
                                  : m.value === "ENTRETIEMPO"
                                    ? "bg-yellow-500"
                                    : m.value === "FINALIZADO"
                                      ? "bg-gray-500"
                                      : m.value === "SUSPENDIDO"
                                        ? "bg-red-500"
                                        : m.value === "POSTERGADO"
                                          ? "bg-orange-500"
                                          : m.value === "CANCELADO"
                                            ? "bg-red-600"
                                            : "bg-purple-500"
                            }`}
                          ></div>
                          {m.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fase del torneo (opcional; sin fase suma a la tabla general) */}
              {phases.length > 0 && (
                <div className="space-y-2">
                  <Label
                    htmlFor="tournamentPhaseId"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Fase
                  </Label>
                  <Select
                    value={values.tournamentPhaseId}
                    onValueChange={(v) => update("tournamentPhaseId", v)}
                    disabled={isLoading}
                    name="tournamentPhaseId"
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl h-12">
                      <SelectValue placeholder="Seleccione fase" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-0 shadow-xl">
                      {phases.map((phase) => (
                        <SelectItem
                          key={phase.id}
                          value={phase.id}
                          className="rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Shield className="w-3 h-3 text-brand" />
                            {phase.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Número de Ronda */}
              <div className="space-y-2">
                <Label
                  htmlFor="roundNumber"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Número de Ronda
                </Label>
                <Input
                  type="number"
                  id="roundNumber"
                  name="roundNumber"
                  placeholder="Ej: 1"
                  value={values.roundNumber || ""}
                  onChange={(e) =>
                    update("roundNumber", Number(e.target.value))
                  }
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-brand focus:border-brand h-12"
                />
              </div>
            </div>

            {/* Walkover (N7): aparece al elegir estado WALKOVER */}
            {isWalkover && (
              <div className="mt-4 space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Label
                  htmlFor="walkoverWinnerTeamId"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-brand" />
                  Equipo ganador del walkover *
                </Label>
                <Select
                  value={values.walkoverWinnerTeamId || ""}
                  onValueChange={(v) => update("walkoverWinnerTeamId", v)}
                  disabled={isLoading}
                  name="walkoverWinnerTeamId"
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-brand/30 rounded-xl h-12">
                    <SelectValue placeholder="Selecciona el equipo que se presentó" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-0 shadow-xl">
                    {tournamentData.tournamentTeams
                      ?.filter(
                        (t) =>
                          t.id === values.homeTeamId ||
                          t.id === values.awayTeamId,
                      )
                      .map((t) => (
                        <SelectItem
                          key={t.id}
                          value={t.id}
                          className="rounded-lg"
                        >
                          <span className="font-medium">{t?.team?.name}</span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  El marcador se fija automáticamente a {walkoverScore}-0 a favor
                  del ganador. No hace falta cargar goles.
                </p>
              </div>
            )}
          </div>

          {/* Sección: Resultado (solo en modo edición) */}
          {mode === "edit" && (
            <div className="bg-gradient-to-br from-brand/5 to-brand-mid/5 dark:from-brand/10 dark:to-brand-mid/10 rounded-xl p-5 border border-brand/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-brand to-brand-mid rounded-lg">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Resultado
                </h3>
                <Badge className="bg-brand/20 text-brand border-0 rounded-full text-xs">
                  Solo edición
                </Badge>
              </div>

              {/* Marcador Normal (oculto en walkover: lo fija el server) */}
              {isWalkover ? (
                <div className="mb-4 rounded-xl bg-white dark:bg-gray-800 border border-brand/30 p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Walkover: el marcador se registra automáticamente como{" "}
                    <span className="font-bold text-brand">
                      {walkoverScore}-0
                    </span>{" "}
                    para el equipo ganador seleccionado arriba.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="homeScore"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Goles Local
                    </Label>
                    <Input
                      type="number"
                      id="homeScore"
                      name="homeScore"
                      placeholder="0"
                      value={values.homeScore ?? ""}
                      onChange={(e) =>
                        update("homeScore", Number(e.target.value))
                      }
                      className="bg-white dark:bg-gray-800 border-brand/30 rounded-xl focus:ring-brand focus:border-brand h-12 text-center text-lg font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="awayScore"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Goles Visitante
                    </Label>
                    <Input
                      type="number"
                      id="awayScore"
                      name="awayScore"
                      placeholder="0"
                      value={values.awayScore ?? ""}
                      onChange={(e) =>
                        update("awayScore", Number(e.target.value))
                      }
                      className="bg-white dark:bg-gray-800 border-brand/30 rounded-xl focus:ring-brand focus:border-brand h-12 text-center text-lg font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Penales */}
              <div className="pt-4 border-t border-brand/20">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-brand" />
                  Definición por Penales (opcional)
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="penaltyWinnerTeamId"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Ganador por Penales
                    </Label>
                    <Select
                      value={values.penaltyWinnerTeamId || ""}
                      onValueChange={(v) => update("penaltyWinnerTeamId", v)}
                      disabled={isLoading}
                      name="penaltyWinnerTeamId"
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-800 border-brand/30 rounded-xl h-12">
                        <SelectValue placeholder="Selecciona equipo ganador" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-0 shadow-xl">
                        {tournamentData.tournamentTeams?.map((t) => (
                          <SelectItem
                            key={t.id}
                            value={t.id}
                            className="rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  t?.team?.logoUrl ||
                                  "/placeholder.svg?height=24&width=24&query=team-logo"
                                }
                                alt={`Logo ${t?.team?.name}`}
                                className="w-6 h-6 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                              />
                              <span className="font-medium">
                                {t?.team?.name}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="penaltyScoreHome"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Penales Local
                      </Label>
                      <Input
                        type="number"
                        id="penaltyScoreHome"
                        name="penaltyScoreHome"
                        placeholder="0"
                        value={values.penaltyScoreHome ?? ""}
                        onChange={(e) =>
                          update("penaltyScoreHome", Number(e.target.value))
                        }
                        className="bg-white dark:bg-gray-800 border-brand/30 rounded-xl focus:ring-brand focus:border-brand h-12 text-center font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="penaltyScoreAway"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Penales Visitante
                      </Label>
                      <Input
                        type="number"
                        id="penaltyScoreAway"
                        name="penaltyScoreAway"
                        placeholder="0"
                        value={values.penaltyScoreAway ?? ""}
                        onChange={(e) =>
                          update("penaltyScoreAway", Number(e.target.value))
                        }
                        className="bg-white dark:bg-gray-800 border-brand/30 rounded-xl focus:ring-brand focus:border-brand h-12 text-center font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="rounded-xl px-6 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-brand to-brand-mid hover:from-brand-hover hover:to-brand-mid-hover text-white shadow-lg shadow-brand/25 rounded-xl px-6 min-w-[160px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : mode === "edit" ? (
                "Guardar Cambios"
              ) : (
                <>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Programar Partido
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogAddEditMatch;
