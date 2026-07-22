"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Clock,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  ShieldX,
  Loader2,
  Users,
} from "lucide-react";

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
import { EmptyState } from "@/components/shared/EmptyState";
import {
  requestNewTeam,
  requestTeamClaim,
} from "@modules/delegados/actions/requests";
import {
  searchTeamsToClaim,
  type ClaimableTeam,
} from "@modules/delegados/actions/queries";
import RosterSection, { type Roster } from "./RosterSection";
import InscriptionsSection, { type OpenTournament } from "./InscriptionsSection";
import EditTeamSheet from "./EditTeamSheet";
import DelegationActions from "./DelegationActions";
import type { ApprovalStatus } from "@prisma/client";

interface MyRequest {
  id: string;
  status: ApprovalStatus;
  team: {
    id: string;
    name: string;
    logoUrl: string | null;
    homeCity: string | null;
    enabled: boolean;
    shortName: string | null;
    description: string | null;
    history: string | null;
    coach: string | null;
    yearFounded: number | null;
    homeColor: string | null;
    awayColor: string | null;
    logoPublicId: string | null;
    organizationName: string;
    tournamentCount: number;
  };
}

interface Props {
  requests: MyRequest[];
  organizations: { id: string; name: string; locality: string | null }[];
  rosters: Roster[];
  openTournaments: OpenTournament[];
}

const STATUS_UI: Record<
  ApprovalStatus,
  { icon: typeof Clock; label: string; className: string }
> = {
  PENDIENTE: {
    icon: Clock,
    label: "Esperando a la liga",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
  },
  APROBADO: {
    icon: ShieldCheck,
    label: "Sos el delegado",
    className:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30",
  },
  RECHAZADO: {
    icon: ShieldX,
    label: "Rechazada",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
  },
};

export default function MiEquipoClient({
  requests,
  organizations,
  rosters,
  openTournaments,
}: Readonly<Props>) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClaimableTeam[] | null>(null);
  const [isSearching, startSearch] = useTransition();
  const [isSending, startSend] = useTransition();
  const [proposing, setProposing] = useState(false);

  // Propuesta de equipo nuevo
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newOrg, setNewOrg] = useState("");

  const search = () => {
    startSearch(async () => {
      setResults(await searchTeamsToClaim(query));
    });
  };

  const claim = (team: ClaimableTeam) => {
    startSend(async () => {
      const res = await requestTeamClaim(team.id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message ?? "Solicitud enviada");
      setResults(null);
      setQuery("");
      router.refresh();
    });
  };

  const propose = () => {
    const year = Number(newYear);
    if (!newOrg) return toast.error("Elegí la liga");
    if (newName.trim().length < 3) return toast.error("El nombre es muy corto");
    if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear()) {
      return toast.error("Revisá el año de fundación");
    }

    startSend(async () => {
      const res = await requestNewTeam({
        organizationId: newOrg,
        name: newName,
        homeCity: newCity || undefined,
        yearFounded: year,
      });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message ?? "Propuesta enviada");
      setProposing(false);
      setNewName("");
      setNewCity("");
      setNewYear("");
      setNewOrg("");
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Mi <span className="premium-gradient-text">equipo</span>
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Representá a tu equipo: cargá su plantel e inscribilo en los torneos de
          tu liga.
        </p>
      </header>

      {/* Mis equipos y solicitudes */}
      {requests.length > 0 && (
        <section className="space-y-3">
          {requests.map((request) => {
            const ui = STATUS_UI[request.status];
            return (
              <article
                key={request.id}
                className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-card p-4 sm:flex-row sm:items-center dark:border-gray-700"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand to-brand-mid">
                    {request.team.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={request.team.logoUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Shield
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900 dark:text-white">
                      {request.team.name}
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      {request.team.organizationName}
                      {request.team.homeCity ? ` · ${request.team.homeCity}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${ui.className}`}
                  >
                    <ui.icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {ui.label}
                  </span>
                  {/* Editar solo con la delegación APROBADA: mientras la
                      solicitud está pendiente todavía no representa al club. */}
                  {request.status === "APROBADO" && (
                    <EditTeamSheet team={request.team} />
                  )}
                  <DelegationActions
                    teamId={request.team.id}
                    teamName={request.team.name}
                    status={request.status}
                  />
                </div>
              </article>
            );
          })}

        </section>
      )}

      {/* Torneos abiertos para inscribir */}
      <InscriptionsSection tournaments={openTournaments} />

      {/* Planteles: uno por torneo en el que juega cada equipo */}
      {rosters.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <Users className="h-5 w-5 text-brand" aria-hidden="true" />
            Mis planteles
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Un plantel por torneo. La ficha del jugador es una sola: el mismo
            jugador puede estar en varios torneos sin volver a cargarlo.
          </p>
          {rosters.map((roster) => (
            <RosterSection key={roster.id} roster={roster} />
          ))}
        </section>
      )}

      {requests.length === 0 && !proposing && results === null && (
        <EmptyState
          icon={Shield}
          title="Todavía no representás a ningún equipo"
          description="Buscá tu equipo para pedirle a la liga que te reconozca como delegado. Si tu equipo todavía no está cargado, podés proponerlo."
        />
      )}

      {/* Reclamar un equipo existente */}
      <section className="space-y-3 rounded-2xl border border-gray-200 bg-card p-5 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          Buscar mi equipo
        </h2>
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Nombre del equipo…"
            className="h-11 bg-card"
          />
          <Button
            type="button"
            variant="brand"
            onClick={search}
            disabled={isSearching || query.trim().length < 2}
            className="h-11 shrink-0 px-4"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="h-4 w-4" aria-hidden="true" />
            )}
            Buscar
          </Button>
        </div>

        {results !== null && results.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No encontramos ningún equipo con ese nombre. Puede que tu liga
            todavía no lo haya cargado: proponelo abajo.
          </p>
        )}

        {results?.map((team) => (
          <div
            key={team.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-gray-900 dark:text-white">
                {team.name}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {team.organizationName}
                {team.homeCity ? ` · ${team.homeCity}` : ""}
              </p>
            </div>
            {team.taken ? (
              <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                Ya tiene delegado
              </span>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isSending}
                onClick={() => claim(team)}
                className="h-9 shrink-0 border-brand/50 text-brand hover:bg-brand/10"
              >
                Soy el delegado
              </Button>
            )}
          </div>
        ))}
      </section>

      {/* Proponer un equipo nuevo */}
      <section className="rounded-2xl border border-gray-200 bg-card p-5 dark:border-gray-700">
        {proposing ? (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Proponer un equipo
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              El equipo queda pendiente hasta que la liga lo apruebe.
            </p>

            <div className="space-y-2">
              <Label htmlFor="org">Liga</Label>
              <Select value={newOrg} onValueChange={setNewOrg}>
                <SelectTrigger id="org" className="h-11 bg-card">
                  <SelectValue placeholder="Elegí la liga" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                      {org.locality ? ` · ${org.locality}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del equipo</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Club Atlético Federal"
                  className="h-11 bg-card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Año de fundación</Label>
                <Input
                  id="year"
                  type="number"
                  inputMode="numeric"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  placeholder="1905"
                  className="h-11 bg-card"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Ciudad de local"
                className="h-11 bg-card"
              />
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setProposing(false)}
                disabled={isSending}
                className="h-11 px-5"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="brand"
                onClick={propose}
                disabled={isSending}
                className="h-11 px-5"
              >
                {isSending && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                Enviar propuesta
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                ¿No encontrás tu equipo?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Proponelo a tu liga y esperá la aprobación.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setProposing(true)}
              disabled={organizations.length === 0}
              className="h-11 shrink-0 px-5"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Proponer equipo
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
