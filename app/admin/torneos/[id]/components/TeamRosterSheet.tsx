"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CalendarCheck,
  CalendarX,
  Hash,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

import { z } from "@/lib/zod-locale";
import { Button } from "@/components/ui/button";
import { FormSheet } from "@/components/shared/form/FormSheet";
import {
  DateField,
  FieldRow,
  FormSection,
  NumberField,
  SelectField,
} from "@/components/shared/form/fields";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PLAYER_POSITION_OPTIONS } from "@/lib/constants";
import type { IPlayer, IPlayerTeam } from "@modules/jugadores/types";
import type { ITournamentTeam } from "@modules/torneos/types/tournament-teams.types";

/**
 * Plantel de un equipo dentro de un torneo (F3) — reemplaza a
 * `DialogAddEditTeamPlayer`, que forzaba tema oscuro con paleta slate/ámbar
 * (fuera de la marca) y cuyo modo "edit" hacía `PATCH /api/team-player/[id]`,
 * una ruta que no existe (hallazgo A11.2): editar una asociación nunca funcionó.
 * Ese flujo muerto se eliminó; para cambiar los datos de un jugador en el
 * equipo se lo saca y se lo vuelve a sumar.
 */

const rosterFormSchema = z.object({
  playerId: z.string().min(1, "Elegí el jugador"),
  joinedAt: z.string().min(1, "La fecha de ingreso es obligatoria"),
  leftAt: z.string(),
  number: z
    .number("Ingresá un número")
    .int()
    .min(1, "El número va del 1 al 99")
    .max(99, "El número va del 1 al 99")
    .optional(),
  position: z.string(),
});

type RosterFormValues = z.infer<typeof rosterFormSchema>;

const emptyValues = (): RosterFormValues => ({
  playerId: "",
  joinedAt: "",
  leftAt: "",
  number: undefined,
  position: "",
});

interface TeamRosterSheetProps {
  teamData: ITournamentTeam;
}

export default function TeamRosterSheet({
  teamData,
}: Readonly<TeamRosterSheetProps>) {
  const [open, setOpen] = useState(false);
  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [roster, setRoster] = useState<IPlayerTeam[]>([]);
  const [toRemove, setToRemove] = useState<IPlayerTeam | null>(null);
  const [, startFetch] = useTransition();
  const router = useRouter();

  const form = useForm<RosterFormValues>({
    resolver: zodResolver(rosterFormSchema),
    defaultValues: emptyValues(),
  });

  // Declaradas ANTES del effect que las llama (react-hooks/immutability), con el
  // fetch dentro de una transición (react-hooks/set-state-in-effect).
  const loadRoster = useCallback(() => {
    startFetch(async () => {
      try {
        const res = await fetch(`/api/team-player/${teamData.id}`);
        if (!res.ok) throw new Error();
        setRoster(await res.json());
      } catch {
        toast.error("No se pudo cargar el plantel");
      }
    });
  }, [teamData.id]);

  const loadPlayers = useCallback(() => {
    startFetch(async () => {
      try {
        // scope=panel: solo jugadores de mis organizaciones. La ruta ya excluye
        // los deshabilitados y eliminados — un jugador dado de baja no se suma.
        const res = await fetch("/api/players?scope=panel");
        if (!res.ok) throw new Error();
        setPlayers(await res.json());
      } catch {
        toast.error("No se pudieron cargar los jugadores");
      }
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    loadRoster();
    loadPlayers();
  }, [open, loadRoster, loadPlayers]);

  const inRoster = new Set(roster.map((entry) => entry.player.id));
  const available = players
    .filter((player) => !inRoster.has(player.id))
    .map((player) => ({ value: player.id, label: player.name }));

  const removePlayer = async () => {
    if (!toRemove) return;
    try {
      const res = await fetch(`/api/team-player/${toRemove.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json().catch(() => null);
        toast.error(error?.error ?? "No se pudo sacar al jugador del equipo");
        return;
      }
      toast.success(`${toRemove.player.name} salió del equipo`);
      setToRemove(null);
      loadRoster();
      router.refresh();
    } catch {
      toast.error("No se pudo conectar con el servidor. Revisá tu conexión.");
    }
  };

  const onSubmit = async (data: RosterFormValues) => {
    try {
      const res = await fetch("/api/team-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentTeamId: teamData.id,
          playerId: data.playerId,
          joinedAt: data.joinedAt,
          leftAt: data.leftAt || null,
          number: data.number ?? null,
          position: data.position || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        toast.error(error?.error ?? "No se pudo sumar al jugador");
        return;
      }

      toast.success("Jugador sumado al equipo");
      form.reset(emptyValues());
      loadRoster();
      router.refresh();
    } catch {
      toast.error("No se pudo conectar con el servidor. Revisá tu conexión.");
    }
  };

  return (
    <>
      <FormSheet
        form={form}
        onSubmit={onSubmit}
        open={open}
        onOpenChange={setOpen}
        size="md"
        icon={Users}
        title="Plantel del equipo"
        description={teamData.team?.name}
        submitLabel="Sumar al plantel"
        submitIcon={UserPlus}
        trigger={
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg transition-colors hover:bg-brand/10 hover:text-brand"
          >
            <Users className="h-4 w-4" />
            <span className="sr-only">
              Ver plantel de {teamData.team?.name}
            </span>
          </Button>
        }
      >
        <FormSection
          icon={Shield}
          title={`En el equipo (${roster.length})`}
          description="Sacar a un jugador borra sus goles y tarjetas en este equipo."
        >
          {roster.length === 0 ? (
            <p className="py-2 text-sm text-gray-500 dark:text-gray-400">
              Todavía no hay jugadores en el plantel.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-900">
              {roster.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 p-3"
                >
                  <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {entry.player.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setToRemove(entry)}
                    className="h-11 w-11 shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">
                      Sacar a {entry.player.name} del equipo
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </FormSection>

        <FormSection icon={UserPlus} title="Sumar jugador">
          <SelectField
            control={form.control}
            name="playerId"
            label="Jugador"
            icon={Users}
            required
            options={available}
            placeholder={
              available.length
                ? "Elegí el jugador"
                : "No quedan jugadores para sumar"
            }
            disabled={!available.length}
            description="Solo aparecen los jugadores habilitados de tu organización que no están ya en el equipo."
          />
          <FieldRow>
            <DateField
              control={form.control}
              name="joinedAt"
              label="Fecha de ingreso"
              icon={CalendarCheck}
              required
            />
            <DateField
              control={form.control}
              name="leftAt"
              label="Fecha de salida"
              icon={CalendarX}
              description="Solo si ya dejó el equipo."
            />
          </FieldRow>
          <FieldRow>
            <NumberField
              control={form.control}
              name="number"
              label="Número de camiseta"
              icon={Hash}
              min={1}
              max={99}
              placeholder="10"
            />
            <SelectField
              control={form.control}
              name="position"
              label="Posición en el equipo"
              options={PLAYER_POSITION_OPTIONS}
            />
          </FieldRow>
        </FormSection>
      </FormSheet>

      <ConfirmDialog
        open={!!toRemove}
        onOpenChange={(next) => !next && setToRemove(null)}
        title="¿Sacar al jugador del equipo?"
        description={
          <>
            <b>{toRemove?.player.name}</b> deja de pertenecer a{" "}
            <b>{teamData.team?.name}</b> en este torneo. También se eliminan los
            goles y las tarjetas que registró con este equipo, y la tabla de
            posiciones se recalcula.
          </>
        }
        confirmLabel="Sacar del equipo"
        onConfirm={removePlayer}
      />
    </>
  );
}
