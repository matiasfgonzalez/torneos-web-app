"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Shield, Sparkles, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  approveTeamRequest,
  rejectTeamRequest,
} from "@modules/delegados/actions/requests";

interface Request {
  id: string;
  message: string | null;
  createdAt: string;
  user: { name: string | null; email: string };
  team: { name: string; homeCity: string | null; isProposal: boolean };
}

export default function DelegadosClient({
  requests,
}: Readonly<{ requests: Request[] }>) {
  const router = useRouter();
  const [isPending, start] = useTransition();

  const resolve = (
    action: typeof approveTeamRequest,
    id: string,
  ) =>
    new Promise<void>((resolve) => {
      start(async () => {
        const res = await action(id);
        if (res.success) toast.success(res.message ?? "Listo");
        else toast.error(res.error);
        router.refresh();
        resolve();
      });
    });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={UserCheck}
        title="Delegados"
        variant="simple"
        description="Personas que piden representar a un equipo de tu liga"
        breadcrumbs={[{ label: "Delegados" }]}
      />

      {requests.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No hay solicitudes pendientes"
          description="Cuando alguien pida representar a un equipo de tu liga, la solicitud aparece acá para que la apruebes o la rechaces."
        />
      ) : (
        <div className="space-y-3">
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
