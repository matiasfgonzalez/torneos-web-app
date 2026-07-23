"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  Mail,
  Scale,
  Shield,
  Sparkles,
  UserCheck,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, SectionTitle } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatFee } from "@/lib/inscriptions";
import type { InscriptionPayStatus } from "@prisma/client";
import {
  approveTeamRequest,
  rejectTeamRequest,
} from "@modules/delegados/actions/requests";
import {
  approveInscription,
  confirmInscriptionPayment,
  rejectInscription,
} from "@modules/delegados/actions/inscriptions";
import {
  approvePlayerClaim,
  rejectPlayerClaim,
} from "@modules/jugadores/actions/claims";

interface Request {
  id: string;
  message: string | null;
  createdAt: string;
  user: { name: string | null; email: string };
  team: { name: string; homeCity: string | null; isProposal: boolean };
}

interface Inscription {
  id: string;
  teamName: string;
  tournamentName: string;
  playerCount: number;
  // Pago del arancel (S3). EXENTO = torneo gratis.
  paymentStatus: InscriptionPayStatus;
  paymentAmount: number | null;
  paymentNote: string | null;
  paymentReceiptUrl: string | null;
}

interface Claim {
  id: string;
  userName: string | null;
  userEmail: string;
  playerName: string;
  nationalId: string;
  /** Evidencia del solicitante (obligatoria en las disputas). */
  message: string | null;
  /** Dueño actual de la ficha — presente solo si el reclamo es una disputa (N14b). */
  currentOwner: { name: string | null; email: string } | null;
}

export default function DelegadosClient({
  requests,
  inscriptions,
  claims,
}: Readonly<{
  requests: Request[];
  inscriptions: Inscription[];
  claims: Claim[];
}>) {
  const router = useRouter();
  const [isPending, start] = useTransition();

  const resolve = (
    action: (id: string) => Promise<{ success: boolean } & Record<string, unknown>>,
    id: string,
  ) =>
    new Promise<void>((resolve) => {
      start(async () => {
        const res = await action(id);
        if (res.success) toast.success((res.message as string) ?? "Listo");
        else toast.error((res.error as string) ?? "No se pudo completar");
        router.refresh();
        resolve();
      });
    });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={UserCheck}
        title="Solicitudes"
        variant="simple"
        description="Delegados, inscripciones a torneos y jugadores reclamando su ficha"
        breadcrumbs={[{ label: "Solicitudes" }]}
      />

      {/* Inscripciones a torneos pedidas por delegados (S3) */}
      {inscriptions.length > 0 && (
        <section className="space-y-3">
          <SectionTitle>Inscripciones a torneos</SectionTitle>
          {inscriptions.map((inscription) => (
            <article
              key={inscription.id}
              className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-card p-5 lg:flex-row lg:items-center dark:border-gray-700"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {inscription.teamName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Quiere jugar <b>{inscription.tournamentName}</b>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {inscription.playerCount === 0
                    ? "Todavía sin jugadores cargados"
                    : `${inscription.playerCount} ${inscription.playerCount === 1 ? "jugador cargado" : "jugadores cargados"}`}
                </p>

                {/* Pago del arancel (S3): la liga ve el estado y confirma. */}
                {inscription.paymentStatus !== "EXENTO" && (
                  <InscriptionPayment
                    inscription={inscription}
                    disabled={isPending}
                    onConfirm={() =>
                      resolve(confirmInscriptionPayment, inscription.id)
                    }
                  />
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <ConfirmDialog
                  trigger={
                    <Button variant="outline" disabled={isPending} className="h-11 px-4">
                      Rechazar
                    </Button>
                  }
                  title="¿Rechazar la inscripción?"
                  description={
                    <>
                      <b>{inscription.teamName}</b> no va a jugar{" "}
                      <b>{inscription.tournamentName}</b>. El plantel que el
                      delegado ya cargó se conserva por si cambiás de opinión.
                    </>
                  }
                  confirmLabel="Rechazar"
                  onConfirm={() => resolve(rejectInscription, inscription.id)}
                />
                <ConfirmDialog
                  trigger={
                    <Button variant="brand" disabled={isPending} className="h-11 px-4">
                      <UserCheck className="h-4 w-4" aria-hidden="true" />
                      Aprobar
                    </Button>
                  }
                  tone="warning"
                  icon={UserCheck}
                  title="¿Aprobar la inscripción?"
                  description={
                    <>
                      <b>{inscription.teamName}</b> queda inscripto en{" "}
                      <b>{inscription.tournamentName}</b> y entra en el fixture
                      cuando lo generes.
                    </>
                  }
                  confirmLabel="Aprobar"
                  onConfirm={() => resolve(approveInscription, inscription.id)}
                />
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Jugadores reclamando su propia ficha (N12) */}
      {claims.length > 0 && (
        <section className="space-y-3">
          <SectionTitle>Jugadores reclamando su ficha</SectionTitle>
          {claims.map((claim) => (
            <article
              key={claim.id}
              className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-card p-5 lg:flex-row lg:items-center dark:border-gray-700"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {claim.playerName}
                  </p>
                  {claim.currentOwner && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-300">
                      <Scale className="h-3 w-3" aria-hidden="true" />
                      Disputa de titularidad
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <b>{claim.userName || "Sin nombre"}</b> dice ser este jugador
                  {claim.currentOwner && (
                    <>
                      {" "}
                      — la ficha está vinculada a{" "}
                      <b>{claim.currentOwner.name || claim.currentOwner.email}</b>
                      , que la creó por su cuenta
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {claim.userEmail} · DNI {claim.nationalId}
                </p>
                {claim.message && (
                  <p className="rounded-lg bg-gray-50 p-2 text-xs text-gray-600 italic dark:bg-gray-900/50 dark:text-gray-300">
                    “{claim.message}”
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <ConfirmDialog
                  trigger={
                    <Button variant="outline" disabled={isPending} className="h-11 px-4">
                      Rechazar
                    </Button>
                  }
                  title={
                    claim.currentOwner
                      ? "¿Rechazar la disputa?"
                      : "¿Rechazar el reclamo?"
                  }
                  description={
                    claim.currentOwner ? (
                      <>
                        La ficha de <b>{claim.playerName}</b> sigue vinculada a{" "}
                        <b>
                          {claim.currentOwner.name || claim.currentOwner.email}
                        </b>
                        ; el reclamo de{" "}
                        <b>{claim.userName || claim.userEmail}</b> se rechaza.
                      </>
                    ) : (
                      <>
                        <b>{claim.userName || claim.userEmail}</b> no va a
                        gestionar la ficha de <b>{claim.playerName}</b>.
                      </>
                    )
                  }
                  confirmLabel="Rechazar"
                  onConfirm={() => resolve(rejectPlayerClaim, claim.id)}
                />
                <ConfirmDialog
                  trigger={
                    <Button variant="brand" disabled={isPending} className="h-11 px-4">
                      <UserCheck className="h-4 w-4" aria-hidden="true" />
                      Es él
                    </Button>
                  }
                  tone="warning"
                  icon={claim.currentOwner ? Scale : UserCheck}
                  title={
                    claim.currentOwner
                      ? "¿Transferir la titularidad?"
                      : "¿Confirmás que es esa persona?"
                  }
                  description={
                    claim.currentOwner ? (
                      <>
                        La ficha de <b>{claim.playerName}</b> se desvincula de{" "}
                        <b>
                          {claim.currentOwner.name || claim.currentOwner.email}
                        </b>{" "}
                        y pasa a <b>{claim.userName || claim.userEmail}</b>,
                        que va a poder ver y <b>editar sus datos</b>. Confirmá
                        solo si la evidencia lo respalda.
                      </>
                    ) : (
                      <>
                        <b>{claim.userName || claim.userEmail}</b> va a poder ver
                        y <b>editar los datos</b> de la ficha de{" "}
                        <b>{claim.playerName}</b>, y su historial en todas las
                        ligas. Confirmá solo si sabés que es esa persona.
                      </>
                    )
                  }
                  confirmLabel={
                    claim.currentOwner ? "Transferir" : "Confirmar"
                  }
                  onConfirm={() => resolve(approvePlayerClaim, claim.id)}
                />
              </div>
            </article>
          ))}
        </section>
      )}

      {requests.length === 0 &&
      inscriptions.length === 0 &&
      claims.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No hay solicitudes pendientes"
          description="Cuando alguien pida representar a un equipo de tu liga o inscribirlo en un torneo, la solicitud aparece acá para que la apruebes o la rechaces."
        />
      ) : (
        <div className="space-y-3">
          {requests.length > 0 && <SectionTitle>Delegados</SectionTitle>}
          {requests.map((request) => (
            <article
              key={request.id}
              className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-card p-5 lg:flex-row lg:items-center dark:border-gray-700"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Shield className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {request.team.name}
                  </span>
                  {request.team.isProposal && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                      <Sparkles className="h-3 w-3" aria-hidden="true" />
                      Equipo nuevo
                    </span>
                  )}
                  {request.team.homeCity && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {request.team.homeCity}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <b>{request.user.name || "Sin nombre"}</b> quiere ser su
                  delegado
                </p>
                <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <Mail className="h-3 w-3" aria-hidden="true" />
                  {request.user.email}
                </p>
                {request.message && (
                  <p className="mt-2 rounded-lg bg-gray-50 p-2 text-sm text-gray-600 dark:bg-gray-900/50 dark:text-gray-300">
                    “{request.message}”
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <ConfirmDialog
                  trigger={
                    <Button
                      variant="outline"
                      disabled={isPending}
                      className="h-11 px-4"
                    >
                      Rechazar
                    </Button>
                  }
                  title="¿Rechazar la solicitud?"
                  description={
                    request.team.isProposal ? (
                      <>
                        <b>{request.user.name || request.user.email}</b> no va a
                        representar a <b>{request.team.name}</b>, y el equipo
                        propuesto se elimina: todavía no juega ningún torneo.
                      </>
                    ) : (
                      <>
                        <b>{request.user.name || request.user.email}</b> no va a
                        representar a <b>{request.team.name}</b>. El equipo
                        queda como está.
                      </>
                    )
                  }
                  confirmLabel="Rechazar"
                  onConfirm={() => resolve(rejectTeamRequest, request.id)}
                />

                <ConfirmDialog
                  trigger={
                    <Button
                      variant="brand"
                      disabled={isPending}
                      className="h-11 px-4"
                    >
                      <UserCheck className="h-4 w-4" aria-hidden="true" />
                      Aprobar
                    </Button>
                  }
                  tone="warning"
                  icon={UserCheck}
                  title="¿Aprobar al delegado?"
                  description={
                    request.team.isProposal ? (
                      <>
                        <b>{request.team.name}</b> queda habilitado en tu liga y{" "}
                        <b>{request.user.name || request.user.email}</b> pasa a
                        ser su delegado: va a poder cargar su plantel e
                        inscribirlo en tus torneos. No toca resultados.
                      </>
                    ) : (
                      <>
                        <b>{request.user.name || request.user.email}</b> pasa a
                        ser delegado de <b>{request.team.name}</b>: va a poder
                        cargar su plantel e inscribirlo en tus torneos. No toca
                        resultados.
                      </>
                    )
                  }
                  confirmLabel="Aprobar"
                  onConfirm={() => resolve(approveTeamRequest, request.id)}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Estado del pago del arancel de una inscripción, con el botón para confirmarlo
 * (S3). Aprobar la inscripción y confirmar el pago son cosas distintas: la liga
 * puede aprobar sin que haya pagado, o cobrar en efectivo y confirmar sin que el
 * delegado haya informado nada.
 */
function InscriptionPayment({
  inscription,
  disabled,
  onConfirm,
}: Readonly<{
  inscription: Inscription;
  disabled: boolean;
  onConfirm: () => void;
}>) {
  const amount = formatFee(inscription.paymentAmount);
  const paid = inscription.paymentStatus === "PAGADO";
  const informed = inscription.paymentStatus === "INFORMADO";

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-900/50">
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
          paid
            ? "text-emerald-600 dark:text-emerald-400"
            : informed
              ? "text-amber-600 dark:text-amber-400"
              : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {paid ? (
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {paid
          ? `Arancel pagado (${amount})`
          : informed
            ? `Informó el pago (${amount})`
            : `Arancel ${amount} — sin pagar`}
      </span>

      {inscription.paymentNote && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          · “{inscription.paymentNote}”
        </span>
      )}

      {inscription.paymentReceiptUrl && (
        <a
          href={inscription.paymentReceiptUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-brand hover:underline"
        >
          Ver comprobante
        </a>
      )}

      {!paid && (
        <ConfirmDialog
          trigger={
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              className="ml-auto h-8 border-emerald-500/40 px-3 text-xs text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Confirmar pago
            </Button>
          }
          tone="warning"
          icon={Wallet}
          title="¿Confirmar el pago del arancel?"
          description={
            <>
              Vas a dar por pagado el arancel de <b>{amount}</b> de{" "}
              <b>{inscription.teamName}</b>. Confirmá solo si ya viste la
              transferencia acreditada.
            </>
          }
          confirmLabel="Confirmar pago"
          onConfirm={onConfirm}
        />
      )}
    </div>
  );
}
