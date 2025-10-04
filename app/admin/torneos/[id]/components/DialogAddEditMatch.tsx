"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ITorneo } from "@/components/torneos/types";
import { Button } from "@/components/ui/button";
import { Book, CalendarPlus, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { IPartidos, MATCH_STATUS } from "@/components/partidos/types";
import { formatDateTimeLocal } from "@/lib/formatDate";
import { PhaseName } from "@prisma/client";

interface Phase {
  id: string;
  name: PhaseName;
  order: number;
}

interface MatchFormValues {
  dateTime: string;
  stadium: string;
  city: string;
  description: string;
  status: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  phaseId: string;
  homeScore: number | null;
  awayScore: number | null;
  penaltyWinnerTeamId: string | null;
  penaltyScoreHome: number | null;
  penaltyScoreAway: number | null;
  roundNumber: number | null;
}

interface DialogAddEditMatchProps {
  mode: "create" | "edit";
  tournamentData: ITorneo;
  matchData?: IPartidos; // Puedes definir una interfaz para los datos del partido si la tienes
}

const DialogAddEditMatch = (props: DialogAddEditMatchProps) => {
  const { mode, tournamentData, matchData } = props;

  const isEdit = mode === "edit";

  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [values, setValues] = useState<MatchFormValues>({
    dateTime: isEdit
      ? formatDateTimeLocal(new Date(matchData?.dateTime ?? new Date()))
      : formatDateTimeLocal(new Date()),
    stadium: isEdit ? matchData?.stadium ?? "" : "",
    city: isEdit ? matchData?.city ?? "" : "",
    description: isEdit ? matchData?.description ?? "" : "",
    status: isEdit ? matchData?.status ?? "" : "",
    tournamentId: tournamentData.id,
    homeTeamId: isEdit ? matchData?.homeTeamId ?? "" : "",
    awayTeamId: isEdit ? matchData?.awayTeamId ?? "" : "",
    phaseId: isEdit ? matchData?.phaseId ?? "" : "",
    homeScore: isEdit ? matchData?.homeScore ?? null : null,
    awayScore: isEdit ? matchData?.awayScore ?? null : null,
    penaltyWinnerTeamId: isEdit ? matchData?.penaltyWinnerTeamId ?? "" : "",
    penaltyScoreHome: isEdit ? matchData?.penaltyScoreHome ?? null : null,
    penaltyScoreAway: isEdit ? matchData?.penaltyScoreAway ?? null : null,
    roundNumber: isEdit ? matchData?.roundNumber ?? null : null,
  });

  useEffect(() => {
    async function fetchPhases() {
      try {
        const res = await fetch("/api/phases");
        if (!res.ok) throw new Error("Error al obtener las fases");

        const data: Phase[] = await res.json();
        setPhases(data);
      } catch (err) {
        console.log(err || "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPhases();
  }, []); // Solo se ejecuta una vez al montar el componente

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
            : "Actualizado correctamente"
        );
        router.refresh();
      } else {
        const errorData = await res.json();
        console.error("Error del servidor:", errorData);
        toast.error(
          method === "POST" ? "Error al agregar" : "Error al actualizar"
        );
      }
    } catch (error) {
      console.error(
        `${method} === "POST" ? "Error al cargar" : "Error al actualizar": ${error}`
      );
      toast.error(
        `${method} === "POST" ? "Error al cargar" : "Error al actualizar": ${error}`
      );
    } finally {
      setIsLoading(false);
      setOpen(false);
    }

    // Lógica para manejar el envío del formulario
    console.log(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Programar Partido
          </Button>
        ) : (
          <Button variant="ghost" size="sm" title="Editar asociación">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Programar Partido" : "Editar Partido"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Programa un nuevo partido para el torneo"
              : "Actualiza los detalles del partido"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Formulario de programacion de partido
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Torneo: {tournamentData.name}</Label>
              </div>

              {/* Fecha y hora */}
              <div className="col-span-2">
                <Label htmlFor="dateTime">Fecha y Hora</Label>
                <Input
                  type="datetime-local"
                  id="dateTime"
                  name="dateTime"
                  value={values.dateTime}
                  onChange={(e) => update("dateTime", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                  required
                />
              </div>

              {/* Equipo Local */}
              <div className="col-span-2">
                <Label htmlFor="homeTeamId" className="pb-2">
                  Equipo Local
                </Label>
                <Select
                  value={values.homeTeamId}
                  onValueChange={(v) => update("homeTeamId", v)}
                  disabled={isLoading}
                  name="homeTeamId"
                  required
                >
                  <SelectTrigger id="teamId">
                    <SelectValue placeholder="Selecciona un equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tournamentData.tournamentTeams?.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              t?.team?.logoUrl ||
                              "/placeholder.svg?height=16&width=16&query=team-logo"
                            }
                            alt={`Logo ${t?.team?.name}`}
                            className="w-4 h-4 rounded object-cover border"
                          />
                          <span>{t?.team?.name}</span>
                          {t?.team?.shortName && (
                            <Badge variant="outline" className="ml-1">
                              {t?.team?.shortName}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Equipo Visitante */}
              <div className="col-span-2">
                <Label htmlFor="awayTeamId" className="pb-2">
                  Equipo Visitante
                </Label>
                <Select
                  value={values.awayTeamId}
                  onValueChange={(v) => update("awayTeamId", v)}
                  disabled={isLoading}
                  name="awayTeamId"
                >
                  <SelectTrigger id="teamId">
                    <SelectValue placeholder="Selecciona un equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tournamentData.tournamentTeams?.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              t?.team?.logoUrl ||
                              "/placeholder.svg?height=16&width=16&query=team-logo"
                            }
                            alt={`Logo ${t?.team?.name}`}
                            className="w-4 h-4 rounded object-cover border"
                          />
                          <span>{t?.team?.name}</span>
                          {t?.team?.shortName && (
                            <Badge variant="outline" className="ml-1">
                              {t?.team?.shortName}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estadio */}
              <div className="col-span-2">
                <Label htmlFor="stadium">Estadio</Label>
                <Input
                  type="text"
                  id="stadium"
                  name="stadium"
                  value={values.stadium}
                  onChange={(e) => update("stadium", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                />
              </div>

              {/* Ciudad */}
              <div className="col-span-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  type="text"
                  id="city"
                  name="city"
                  value={values.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                />
              </div>

              {/* Descripción */}
              <div className="col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <textarea
                  id="description"
                  name="description"
                  value={values.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                />
              </div>

              {/* Status */}
              <div className="col-span-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={values.status}
                  onValueChange={(v) => update("status", v)}
                  disabled={isLoading}
                  name="status"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATCH_STATUS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phase */}
              <div className="col-span-1">
                <Label htmlFor="phaseId">Fase</Label>
                <Select
                  value={values.phaseId}
                  onValueChange={(v) => update("phaseId", v)}
                  disabled={isLoading}
                  name="phaseId"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione fase" />
                  </SelectTrigger>
                  <SelectContent>
                    {phases.map((phase) => (
                      <SelectItem key={phase.id} value={phase.id}>
                        {phase.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* roundNumber */}
              <div className="col-span-1">
                <Label htmlFor="roundNumber">Número de ronda</Label>
                <Input
                  type="number"
                  id="roundNumber"
                  name="roundNumber"
                  value={values.roundNumber || ""}
                  onChange={(e) =>
                    update("roundNumber", Number(e.target.value))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                />
              </div>

              {/* Resultado normal */}
              {mode === "edit" && (
                <>
                  <div>
                    <Label htmlFor="homeScore">Goles Local</Label>
                    <Input
                      type="number"
                      id="homeScore"
                      name="homeScore"
                      value={values.homeScore || ""}
                      onChange={(e) =>
                        update("homeScore", Number(e.target.value))
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="awayScore">Goles Visitante</Label>
                    <Input
                      type="number"
                      id="awayScore"
                      name="awayScore"
                      value={values.awayScore || ""}
                      onChange={(e) =>
                        update("awayScore", Number(e.target.value))
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                    />
                  </div>
                </>
              )}

              {/* Resultado por penales */}
              {mode === "edit" && (
                <>
                  <div className="col-span-2">
                    <Label htmlFor="penaltyWinnerTeamId">
                      Ganador por penales
                    </Label>
                    <Select
                      value={values.penaltyWinnerTeamId || ""}
                      onValueChange={(v) => update("penaltyWinnerTeamId", v)}
                      disabled={isLoading}
                      name="penaltyWinnerTeamId"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona equipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tournamentData.tournamentTeams?.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            <div className="flex items-center gap-2">
                              <img
                                src={
                                  t?.team?.logoUrl ||
                                  "/placeholder.svg?height=16&width=16&query=team-logo"
                                }
                                alt={`Logo ${t?.team?.name}`}
                                className="w-4 h-4 rounded object-cover border"
                              />
                              <span>{t?.team?.name}</span>
                              {t?.team?.shortName && (
                                <Badge variant="outline" className="ml-1">
                                  {t?.team?.shortName}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="penaltyScoreHome">Penales Local</Label>
                    <Input
                      type="number"
                      id="penaltyScoreHome"
                      name="penaltyScoreHome"
                      value={values.penaltyScoreHome || ""}
                      onChange={(e) =>
                        update("penaltyScoreHome", Number(e.target.value))
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="penaltyScoreAway">Penales Visitante</Label>
                    <Input
                      type="number"
                      id="penaltyScoreAway"
                      name="penaltyScoreAway"
                      value={values.penaltyScoreAway || ""}
                      onChange={(e) =>
                        update("penaltyScoreAway", Number(e.target.value))
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Cargando..."
                : mode === "edit"
                ? "Guardar cambios"
                : "Programar Partido"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogAddEditMatch;
