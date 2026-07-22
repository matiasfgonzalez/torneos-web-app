"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BadgeCheck,
  Clock,
  Goal,
  IdCard,
  Loader2,
  RectangleVertical,
  Scale,
  Search,
  Sparkles,
  UserCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  createOwnPlayer,
  requestPlayerClaim,
  type MyPlayerProfile,
} from "@modules/jugadores/actions/claims";
import EditProfileSheet from "./EditProfileSheet";
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
    /** Reclamo sobre una ficha que ya tiene dueño: lo resuelve el admin (N14b). */
    isDispute?: boolean;
    player: {
      name: string;
      nationalId: string;
      position: string | null;
      imageUrlFace: string | null;
    };
  } | null;
  career: Career[];
  /** Datos editables de la ficha (solo presente si es su dueño, APROBADO). */
  profile: MyPlayerProfile | null;
}

export default function MiFichaClient({
  claim,
  career,
  profile,
}: Readonly<Props>) {
  const router = useRouter();
  const [dni, setDni] = useState("");
  const [isSending, start] = useTransition();

  // Pasos siguientes que abre la búsqueda (N14b): crear la ficha si el DNI no
  // existe, o disputar si está vinculada a quien la autocreó.
  const [offerCreate, setOfferCreate] = useState<string | null>(null);
  const [offerDispute, setOfferDispute] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [evidence, setEvidence] = useState("");

  const resetOffers = () => {
    setOfferCreate(null);
    setOfferDispute(null);
  };

  const claimFicha = () => {
    resetOffers();
    start(async () => {
      const res = await requestPlayerClaim(dni);
      if (!res.success) {
        if (res.code === "NOT_FOUND") {
          setOfferCreate(dni);
          return;
        }
        if (res.code === "DISPUTE_AVAILABLE") {
          setOfferDispute(dni);
          return;
        }
        toast.error(res.error, { duration: 7000 });
        return;
      }
      toast.success(res.message, { duration: 7000 });
      setDni("");
      router.refresh();
    });
  };

  const createFicha = () => {
    if (!offerCreate) return;
    start(async () => {
      const res = await createOwnPlayer({
        dni: offerCreate,
        name,
        birthDate,
        acceptedPolicies: accepted,
      });
      if (!res.success) {
        toast.error(res.error, { duration: 7000 });
        return;
      }
      toast.success(res.message, { duration: 7000 });
      router.refresh();
    });
  };

  const startDispute = () => {
    if (!offerDispute) return;
    start(async () => {
      const res = await requestPlayerClaim(offerDispute, evidence);
      if (!res.success) {
        toast.error(res.error, { duration: 7000 });
        return;
      }
      toast.success(res.message, { duration: 9000 });
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
                onChange={(e) => {
                  setDni(e.target.value);
                  resetOffers();
                }}
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

        {/* El DNI no existe → crear la propia ficha (N14b) */}
        {offerCreate && (
          <section
            aria-labelledby="crear-ficha-title"
            className="space-y-4 rounded-2xl border border-brand/40 bg-card p-5 ring-1 ring-brand/20"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-mid shadow-lg shadow-brand/25">
                <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <h2
                  id="crear-ficha-title"
                  className="font-bold text-gray-900 dark:text-white"
                >
                  Todavía no hay una ficha con el DNI {offerCreate}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Creala vos mismo: nace vinculada a tu cuenta y cuando un club
                  te busque por tu DNI va a encontrar tus datos, no un
                  duplicado.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="own-name">Nombre y apellido</Label>
                <Input
                  id="own-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como figurás en tu documento"
                  className="h-11 bg-card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="own-birth">Fecha de nacimiento</Label>
                <Input
                  id="own-birth"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="h-11 bg-card"
                />
              </div>
              <div className="flex items-start gap-3 pt-1">
                <Checkbox
                  id="own-accept"
                  checked={accepted}
                  onCheckedChange={(value) => setAccepted(value === true)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="own-accept"
                  className="text-sm font-normal leading-relaxed text-gray-600 dark:text-gray-300"
                >
                  Leí y acepto los{" "}
                  <Link
                    href="/terminos"
                    target="_blank"
                    className="font-medium text-brand hover:underline"
                  >
                    Términos y Condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link
                    href="/privacidad"
                    target="_blank"
                    className="font-medium text-brand hover:underline"
                  >
                    Política de Privacidad
                  </Link>
                  , y declaro que estos datos son míos.
                </Label>
              </div>
              <Button
                type="button"
                variant="brand"
                onClick={createFicha}
                disabled={
                  isSending ||
                  !accepted ||
                  name.trim().length < 2 ||
                  birthDate === ""
                }
                className="h-11 w-full sm:w-auto"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                )}
                Crear mi ficha
              </Button>
            </div>
          </section>
        )}

        {/* La ficha está vinculada a quien la autocreó → disputa (N14b) */}
        {offerDispute && (
          <section
            aria-labelledby="disputa-title"
            className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-900/20"
          >
            <div className="flex items-start gap-3">
              <Scale
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden="true"
              />
              <div>
                <h2
                  id="disputa-title"
                  className="font-bold text-amber-900 dark:text-amber-200"
                >
                  Esa ficha ya está vinculada a otra cuenta
                </h2>
                <p className="text-sm text-amber-700 dark:text-amber-300/80">
                  Quien la vinculó la creó por su cuenta, sin que un club lo
                  confirme. Si el DNI {offerDispute} es tuyo, contanos cómo
                  podés demostrarlo y el administrador de GOLAZO revisa la
                  disputa con la evidencia de ambas partes.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="dispute-evidence">Tu evidencia</Label>
                <Textarea
                  id="dispute-evidence"
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  rows={3}
                  placeholder="Ej: soy Juan Pérez, jugué el Clausura 2025 en Racing de Rafaela; mi delegado Carlos puede confirmarlo."
                  className="bg-card"
                />
              </div>
              <Button
                type="button"
                variant="brand"
                onClick={startDispute}
                disabled={isSending || evidence.trim().length < 10}
                className="h-11 w-full sm:w-auto"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Scale className="h-4 w-4" aria-hidden="true" />
                )}
                Iniciar disputa
              </Button>
            </div>
          </section>
        )}
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
          {claim.isDispute ? (
            <Scale
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
              aria-hidden="true"
            />
          ) : (
            <Clock
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
              aria-hidden="true"
            />
          )}
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              {claim.isDispute ? "Disputa en revisión" : "Esperando confirmación"}
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300/80">
              {claim.isDispute
                ? "Esta ficha está vinculada a otra cuenta. El administrador de GOLAZO está revisando tu disputa con la evidencia de ambas partes."
                : "Tu liga o tu delegado tienen que confirmar que esta ficha es tuya. Cuando lo hagan vas a ver acá tu trayectoria completa."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-500/30 dark:bg-green-500/10">
            <div className="flex items-center gap-2">
              <BadgeCheck
                className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                Esta ficha es tuya. Actualizá tus datos y los ve tu liga.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/mi-ficha/carnet">
                  <IdCard className="h-4 w-4" aria-hidden="true" />
                  Mi carnet
                </Link>
              </Button>
              {profile && <EditProfileSheet player={profile} />}
            </div>
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
