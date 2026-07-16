"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Search, Trash2, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  addPlayerToRoster,
  createPlayerAsManager,
  findPlayerByNationalId,
  removePlayerFromRoster,
} from "@modules/delegados/actions/players";
import type { RegistrationStatus } from "@prisma/client";

export interface Roster {
  id: string;
  registrationStatus: RegistrationStatus;
  teamName: string;
  tournamentName: string;
  players: {
    id: string;
    number: number | null;
    position: string | null;
    playerName: string;
    nationalId: string;
    hasHistory: boolean;
  }[];
}

const REGISTRATION_UI: Record<RegistrationStatus, { label: string; className: string }> = {
  INSCRIPTO: {
    label: "Inscripto",
    className:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30",
  },
  PENDIENTE: {
    label: "Esperando a la liga",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
  },
  RECHAZADO: {
    label: "Rechazado",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
  },
};

/**
 * Plantel de un equipo en un torneo (N12/N13).
 *
 * El flujo es "buscar por DNI primero": la ficha del jugador es única en toda
 * la plataforma, así que lo primero es averiguar si ya existe. Si existe, se
 * asocia; si no, se carga. Nunca se ofrece "crear" antes de haber buscado —
 * es lo que evita el duplicado.
 */
export default function RosterSection({ roster }: Readonly<{ roster: Roster }>) {
  const router = useRouter();
  const [dni, setDni] = useState("");
  const [isSearching, startSearch] = useTransition();
  const [isSaving, startSave] = useTransition();

  // null = no se buscó todavía
  const [found, setFound] = useState<
    | null
    | { kind: "found"; id: string; name: string }
    | { kind: "missing"; dni: string }
  >(null);

  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");

  const ui = REGISTRATION_UI[roster.registrationStatus];
  const rejected = roster.registrationStatus === "RECHAZADO";

  const search = () => {
    startSearch(async () => {
      const res = await findPlayerByNationalId(dni);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      if (res.found) {
        setFound({ kind: "found", id: res.player.id, name: res.player.name });
      } else {
        setFound({ kind: "missing", dni });
        setNewName("");
      }
    });
  };

  const reset = () => {
    setFound(null);
    setDni("");
    setNewName("");
    setNewNumber("");
  };

  const associate = (playerId: string) => {
    startSave(async () => {
      const res = await addPlayerToRoster({
        tournamentTeamId: roster.id,
        playerId,
        number: newNumber ? Number(newNumber) : undefined,
      });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message ?? "Listo");
      reset();
      router.refresh();
    });
  };

  const createAndAssociate = () => {
    startSave(async () => {
      const created = await createPlayerAsManager({
        nationalId: dni,
        name: newName,
      });
      if (!created.success || !created.playerId) {
        toast.error(created.success ? "No se pudo cargar" : created.error);
        return;
      }
      const added = await addPlayerToRoster({
        tournamentTeamId: roster.id,
        playerId: created.playerId,
        number: newNumber ? Number(newNumber) : undefined,
      });
      if (!added.success) {
        toast.error(added.error);
        return;
      }
      toast.success(added.message ?? "Listo");
      reset();
      router.refresh();
    });
  };

  const remove = (teamPlayerId: string) =>
    new Promise<void>((resolve) => {
      startSave(async () => {
        const res = await removePlayerFromRoster(teamPlayerId);
        if (res.success) toast.success(res.message ?? "Listo");
        else toast.error(res.error);
        router.refresh();
        resolve();
      });
    });

  return (
    <article className="space-y-4 rounded-2xl border border-gray-200 bg-card p-5 dark:border-gray-700">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900 dark:text-white">
            {roster.teamName}
          </h3>
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
            {roster.tournamentName}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${ui.className}`}
        >
          {ui.label}
        </span>
      </header>

      {/* Jugadores del plantel */}
      {roster.players.length === 0 ? (
        <p className="py-2 text-sm text-gray-500 dark:text-gray-400">
          Todavía no cargaste jugadores en este torneo.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
          {roster.players.map((p) => (
            <li key={p.id} className="flex items-center gap-3 p-3">
              <span className="w-8 shrink-0 text-center text-sm font-semibold text-brand tabular-nums">
                {p.number ?? "—"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {p.playerName}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  DNI {p.nationalId}
                </p>
              </div>
              {!p.hasHistory && (
                <ConfirmDialog
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 shrink-0 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Sacar a {p.playerName}</span>
                    </Button>
                  }
                  title="¿Sacar del plantel?"
                  description={
                    <>
                      <b>{p.playerName}</b> sale del plantel de este torneo. Su
                      ficha no se borra: sigue disponible para otros torneos.
                    </>
                  }
                  confirmLabel="Sacar"
                  onConfirm={() => remove(p.id)}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {rejected ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          La liga rechazó esta inscripción, así que el plantel quedó cerrado.
        </p>
      ) : (
        <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-brand" aria-hidden="true" />
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Sumar jugador
            </h4>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`dni-${roster.id}`}>DNI del jugador</Label>
            <div className="flex gap-2">
              <Input
                id={`dni-${roster.id}`}
                value={dni}
                inputMode="numeric"
                onChange={(e) => {
                  setDni(e.target.value);
                  setFound(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="12345678"
                className="h-11 bg-card"
              />
              <Button
                type="button"
                variant="brand"
                onClick={search}
                disabled={isSearching || dni.trim().length < 6}
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
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Buscamos por DNI porque la ficha del jugador es única en toda la
              plataforma: si ya está cargado, lo sumás sin volver a cargarlo.
            </p>
          </div>

          {found?.kind === "found" && (
            <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-500/30 dark:bg-green-500/10">
              <p className="text-sm text-green-800 dark:text-green-300">
                Encontramos a <b>{found.name}</b>. Ya está en el sistema.
              </p>
              <div className="flex flex-wrap items-end gap-2">
                <div className="w-24 space-y-1">
                  <Label htmlFor={`num-${roster.id}`} className="text-xs">
                    Dorsal
                  </Label>
                  <Input
                    id={`num-${roster.id}`}
                    type="number"
                    inputMode="numeric"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder="10"
                    className="h-11 bg-card"
                  />
                </div>
                <Button
                  type="button"
                  variant="brand"
                  onClick={() => associate(found.id)}
                  disabled={isSaving}
                  className="h-11 px-4"
                >
                  {isSaving && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  Sumar al plantel
                </Button>
              </div>
            </div>
          )}

          {found?.kind === "missing" && (
            <div className="space-y-3 rounded-lg border border-brand/30 bg-brand/5 p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Nadie tiene ese DNI todavía. Cargá su ficha:
              </p>
              <div className="grid gap-2 sm:grid-cols-[1fr_6rem]">
                <div className="space-y-1">
                  <Label htmlFor={`name-${roster.id}`} className="text-xs">
                    Nombre completo
                  </Label>
                  <Input
                    id={`name-${roster.id}`}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="h-11 bg-card"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`num2-${roster.id}`} className="text-xs">
                    Dorsal
                  </Label>
                  <Input
                    id={`num2-${roster.id}`}
                    type="number"
                    inputMode="numeric"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder="10"
                    className="h-11 bg-card"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="brand"
                onClick={createAndAssociate}
                disabled={isSaving || newName.trim().length < 3}
                className="h-11 px-4"
              >
                {isSaving && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                <Users className="h-4 w-4" aria-hidden="true" />
                Cargar y sumar
              </Button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
