"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CalendarPlus,
  CheckCircle2,
  Clock,
  Loader2,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  informInscriptionPayment,
  requestInscription,
} from "@modules/delegados/actions/inscriptions";
import { formatFee } from "@/lib/inscriptions";
import type {
  InscriptionPayStatus,
  RegistrationStatus,
} from "@prisma/client";

interface Registration {
  id: string;
  registrationStatus: RegistrationStatus;
  paymentStatus: InscriptionPayStatus;
  paymentAmount: number | null;
}

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
  /** Arancel de inscripción (S3). `null` = gratis. */
  inscriptionFee: number | null;
  /** Cómo pagar el arancel (texto libre del organizador). */
  inscriptionPaymentInfo: string | null;
  myTeams: {
    id: string;
    name: string;
    registration: Registration | null;
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
 * Si el torneo cobra arancel, cada equipo anotado muestra su estado de pago y
 * el delegado puede informar que pagó — el cobro es manual, la liga confirma.
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
      toast.success(res.message, { duration: 8000 });
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

            {/* Cupos, cierre y arancel: los datos que deciden si anotarse. */}
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

              {tournament.inscriptionFee ? (
                <span className="rounded-full border border-brand/30 bg-brand/5 px-2.5 py-0.5 text-xs font-medium text-brand">
                  <Wallet className="mr-1 inline h-3 w-3" aria-hidden="true" />
                  Arancel {formatFee(tournament.inscriptionFee)}
                </span>
              ) : (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
                  Gratis
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {tournament.myTeams.map((team) => (
              <div
                key={team.id}
                className="rounded-xl border border-gray-100 p-3 dark:border-gray-800"
              >
                <div className="flex items-center justify-between gap-3">
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

                {/* Pago del arancel: solo si el equipo está anotado y el torneo
                    cobra (paymentStatus distinto de EXENTO). */}
                {team.registration &&
                  team.registration.paymentStatus !== "EXENTO" && (
                    <PaymentRow
                      registration={team.registration}
                      teamName={team.name}
                      tournamentName={tournament.name}
                      paymentInfo={tournament.inscriptionPaymentInfo}
                    />
                  )}
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

/** Fila de estado de pago + acción "informar pago" para un equipo anotado. */
function PaymentRow({
  registration,
  teamName,
  tournamentName,
  paymentInfo,
}: Readonly<{
  registration: Registration;
  teamName: string;
  tournamentName: string;
  paymentInfo: string | null;
}>) {
  const amount = formatFee(registration.paymentAmount);

  if (registration.paymentStatus === "PAGADO") {
    return (
      <div className="mt-2 flex items-center gap-1.5 border-t border-gray-100 pt-2 text-xs font-medium text-emerald-600 dark:border-gray-800 dark:text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        Arancel pagado ({amount})
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2 dark:border-gray-800">
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
          registration.paymentStatus === "INFORMADO"
            ? "text-amber-600 dark:text-amber-400"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
        {registration.paymentStatus === "INFORMADO"
          ? `Pago informado (${amount}) — la liga lo confirma`
          : `Arancel ${amount} a pagar`}
      </span>

      <InformPaymentDialog
        registrationId={registration.id}
        teamName={teamName}
        tournamentName={tournamentName}
        amount={amount}
        paymentInfo={paymentInfo}
        alreadyInformed={registration.paymentStatus === "INFORMADO"}
      />
    </div>
  );
}

/** Diálogo para informar el pago: muestra cómo pagar y toma una referencia. */
function InformPaymentDialog({
  registrationId,
  teamName,
  tournamentName,
  amount,
  paymentInfo,
  alreadyInformed,
}: Readonly<{
  registrationId: string;
  teamName: string;
  tournamentName: string;
  amount: string;
  paymentInfo: string | null;
  alreadyInformed: boolean;
}>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isSaving, start] = useTransition();

  const confirmar = () =>
    start(async () => {
      const res = await informInscriptionPayment({
        tournamentTeamId: registrationId,
        note,
      });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message, { duration: 7000 });
      setOpen(false);
      router.refresh();
    });

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={alreadyInformed ? "ghost" : "outline"}
        onClick={() => setOpen(true)}
        className={
          alreadyInformed
            ? "h-8 shrink-0 text-xs text-gray-500 hover:text-brand"
            : "h-8 shrink-0 border-brand/50 text-brand hover:bg-brand/10"
        }
      >
        <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
        {alreadyInformed ? "Actualizar pago" : "Informar pago"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Informar pago del arancel</DialogTitle>
            <DialogDescription>
              {teamName} en {tournamentName} — arancel de{" "}
              <span className="font-semibold text-brand">{amount}</span>. Pagá
              por fuera de la app y avisá acá; la liga confirma cuando lo vea
              acreditado.
            </DialogDescription>
          </DialogHeader>

          {paymentInfo ? (
            <div className="rounded-xl border border-brand/20 bg-brand/5 p-3">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-brand">
                <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
                Cómo pagar
              </p>
              <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
                {paymentInfo}
              </p>
            </div>
          ) : (
            <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              La liga no dejó datos de pago. Consultales cómo transferir antes de
              informar.
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="pay-note">Referencia (opcional)</Label>
            <Textarea
              id="pay-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Ej: transferencia del 12/8, comprobante #4821"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ayuda a la liga a encontrar tu transferencia.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="brand" onClick={confirmar} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              )}
              Ya pagué
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
