"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BadgeCheck,
  Clock,
  Goal,
  Loader2,
  RectangleVertical,
  Search,
  UserCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/EmptyState";
import { requestPlayerClaim } from "@modules/jugadores/actions/claims";
import type { ApprovalStatus } from "@prisma/client";

interface Career {
  id: string;
  number: number | null;
  teamName: string;
  tournamentName: string;
  tournamentSlug: string | null;
  organizationName: string;
  organizationSlug: string;
  goals: number;
  cards: number;
}

interface Props {
  claim: {
    status: ApprovalStatus;
    player: {
      name: string;
      nationalId: string;
      position: string | null;
      imageUrlFace: string | null;
    };
  } | null;
  career: Career[];
}

export default function MiFichaClient({ claim, career }: Readonly<Props>) {
  const router = useRouter();
  const [dni, setDni] = useState("");
  const [isSending, start] = useTransition();

  const claimFicha = () => {
    start(async () => {
      const res = await requestPlayerClaim(dni);
      if (!res.success) {
        toast.error(res.error, { duration: 7000 });
        return;
      }
      toast.success(res.message, { duration: 7000 });
      setDni("");
      router.refresh();
    });
  };

  // Sin ficha reclamada: el formulario para pedirla
  if (!claim) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mi <span className="premium-gradient-text">ficha</span>
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Si jugás en una liga de GOLAZO, tu club ya cargó tu ficha. Vinculala
            a tu cuenta para ver tu trayectoria y tus estadísticas.
          </p>
        </header>

        <section className="space-y-4 rounded-2xl border border-gray-200 bg-card p-5 dark:border-gray-700">
          <div className="space-y-2">
            <Label htmlFor="dni">Tu DNI</Label>
            <div className="flex gap-2">
              <Input
                id="dni"
                value={dni}
                inputMode="numeric"
                onChange={(e) => setDni(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && claimFicha()}
                placeholder="12345678"
                className="h-11 bg-card"
              />
              <Button
                type="button"
                variant="brand"
                onClick={claimFicha}
                disabled={isSending || dni.trim().length < 6}
                className="h-11 shrink-0 px-4"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Search className="h-4 w-4" aria-hidden="true" />
                )}
                Buscar mi ficha
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tu liga o tu delegado confirman que sos vos antes de vincularla.
            </p>
          </div>
        </section>
      </div>
    );
  }

  const pending = claim.status === "PENDIENTE";
  const totalGoals = career.reduce((sum, c) => sum + c.goals, 0);
  const totalCards = career.reduce((sum, c) => sum + c.cards, 0);

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-mid">
          <UserCircle className="h-8 w-8 text-white" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-gray-900 dark:text-white">
            {claim.player.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            DNI {claim.player.nationalId}
          </p>
        </div>
      </header>

      {pending ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-900/20">
          <Clock
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              Esperando confirmación
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300/80">
              Tu liga o tu delegado tienen que confirmar que esta ficha es tuya.
              Cuando lo hagan vas a ver acá tu trayectoria completa.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-500/30 dark:bg-green-500/10">
            <BadgeCheck
              className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Esta ficha es tuya. Los datos que cambies los ve tu liga.
            </p>
          </div>

          {/* Resumen de carrera */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Torneos", value: career.length, icon: UserCircle },
              { label: "Goles", value: totalGoals, icon: Goal },
              { label: "Tarjetas", value: totalCards, icon: RectangleVertical },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-200 bg-card p-4 text-center dark:border-gray-700"
              >
                <stat.icon
                  className="mx-auto mb-1 h-4 w-4 text-brand"
                  aria-hidden="true"
                />
                <p className="text-2xl font-bold text-gray-900 tabular-nums dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Trayectoria */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Mi trayectoria
            </h2>

            {career.length === 0 ? (
              <EmptyState
                icon={UserCircle}
                title="Todavía no jugaste ningún torneo"
                description="Cuando tu club te sume al plantel de un torneo, va a aparecer acá."
              />
            ) : (
              career.map((entry) => (
                <article
                  key={entry.id}
                  className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-card p-4 dark:border-gray-700"
                >
                  {entry.number !== null && (
                    <span className="w-8 shrink-0 text-center text-lg font-bold text-brand tabular-nums">
                      {entry.number}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900 dark:text-white">
                      {entry.teamName}
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      {entry.tournamentSlug ? (
                        <Link
                          href={`/liga/${entry.organizationSlug}/${entry.tournamentSlug}`}
                          className="hover:text-brand"
                        >
                          {entry.tournamentName}
                        </Link>
                      ) : (
                        entry.tournamentName
                      )}{" "}
                      · {entry.organizationName}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-3 text-sm">
                    <span
                      className="flex items-center gap-1 text-gray-600 dark:text-gray-300"
                      title={`${entry.goals} goles`}
                    >
                      <Goal className="h-4 w-4 text-brand" aria-hidden="true" />
                      <span className="tabular-nums">{entry.goals}</span>
                    </span>
                    <span
                      className="flex items-center gap-1 text-gray-600 dark:text-gray-300"
                      title={`${entry.cards} tarjetas`}
                    >
                      <RectangleVertical
                        className="h-4 w-4 text-amber-500"
                        aria-hidden="true"
                      />
                      <span className="tabular-nums">{entry.cards}</span>
                    </span>
                  </div>
                </article>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
