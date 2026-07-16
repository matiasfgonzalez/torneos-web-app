"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarPlus, Clock, Loader2, Trophy, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requestInscription } from "@modules/delegados/actions/inscriptions";
import type { RegistrationStatus } from "@prisma/client";

export interface OpenTournament {
  id: string;
  name: string;
  locality: string;
  startDate: string;
  organizationName: string;
  maxTeams: number | null;
  takenSlots: number;
  /** Cupos libres. `null` = el torneo no puso cupo. */
  remaining: number | null;
  registrationDeadline: string | null;
  deadlineLabel: string | null;
  myTeams: {
    id: string;
    name: string;
    registration: { id: string; registrationStatus: RegistrationStatus } | null;
  }[];
}

const STATUS_LABEL: Record<RegistrationStatus, string> = {
  INSCRIPTO: "Inscripto",
  PENDIENTE: "Esperando respuesta",
  RECHAZADO: "Rechazado",
};

/**
 * Torneos abiertos a los que el delegado puede anotar sus equipos (S3/N13).
 *
 * Solo aparecen los torneos en estado INSCRIPCION de las ligas donde tiene
 * equipos: anotarse a un torneo ya empezado desordena el fixture y la tabla.
 */
export default function InscriptionsSection({
  tournaments,
}: Readonly<{ tournaments: OpenTournament[] }>) {
  const router = useRouter();
  const [isPending, start] = useTransition();

  const inscribe = (tournamentId: string, teamId: string) => {
    start(async () => {
      const res = await requestInscription({ tournamentId, teamId });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message, { duration: 7000 });
      router.refresh();
    });
  };

  if (tournaments.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
        <Trophy className="h-5 w-5 text-brand" aria-hidden="true" />
        Torneos abiertos
      </h2>

      {tournaments.map((tournament) => (
        <article
          key={tournament.id}
          className="rounded-2xl border border-gray-200 bg-card p-4 dark:border-gray-700"
        >
          <div className="mb-3 space-y-1">
            <p className="font-semibold text-gray-900 dark:text-white">
              {tournament.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tournament.organizationName} · Arranca el{" "}
              {new Date(tournament.startDate).toLocaleDateString("es-AR", {
                day: "numeric",
                month: "long",
              })}
            </p>

            {/* Cupos y cierre: los dos datos que deciden si vale la pena
                anotarse. Sin esto el delegado pide y se entera después. */}
            <div className="flex flex-wrap gap-2 pt-1">
              {tournament.remaining !== null && (
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    tournament.remaining === 0
                      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-400"
                      : tournament.remaining <= 2
                        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400"
                        : "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300"
                  }`}
                >
                  <Users className="mr-1 inline h-3 w-3" aria-hidden="true" />
                  {tournament.remaining === 0
                    ? "Sin cupos"
                    : `${tournament.remaining} ${tournament.remaining === 1 ? "cupo libre" : "cupos libres"} de ${tournament.maxTeams}`}
                </span>
              )}

              {tournament.deadlineLabel && (
                <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                  <Clock className="mr-1 inline h-3 w-3" aria-hidden="true" />
                  Cierra el {tournament.deadlineLabel}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {tournament.myTeams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3 dark:border-gray-800"
              >
                <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {team.name}
                </span>

                {team.registration ? (
                  <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    {STATUS_LABEL[team.registration.registrationStatus]}
                  </span>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    // Sin cupo el server rechaza igual: deshabilitar el botón
                    // evita el viaje y la frustración.
                    disabled={isPending || tournament.remaining === 0}
                    onClick={() => inscribe(tournament.id, team.id)}
                    className="h-9 shrink-0 border-brand/50 text-brand hover:bg-brand/10"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                    )}
                    Inscribir
                  </Button>
                )}
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
