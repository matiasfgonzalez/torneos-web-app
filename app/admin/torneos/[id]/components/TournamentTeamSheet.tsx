"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ClipboardPen, Edit, Hash, Plus, Shield, Trophy } from "lucide-react";

import { z } from "@/lib/zod-locale";
import { Button } from "@/components/ui/button";
import { FormSheet } from "@/components/shared/form/FormSheet";
import {
  FormSection,
  SelectField,
  SwitchField,
  TextField,
  TextareaField,
} from "@/components/shared/form/fields";
import type { ITeam } from "@modules/equipos/types/types";
import type { ITorneo } from "@modules/torneos/types";
import type { ITournamentTeam } from "@modules/torneos/types/tournament-teams.types";

/**
 * Inscripción de un equipo en un torneo (F3) — reemplaza a
 * `DialogAddEditTeamTournament` + `tournament-team-form` (727 líneas entre los dos).
 *
 * Ya no carga estadísticas a mano (PJ/PG/PE/PP/GF/GC/puntos): las calcula el
 * sistema desde los partidos y el próximo recálculo pisaba cualquier número
 * escrito acá (punto 5 de C6, decisión del usuario 2026-07-14). La API tampoco
 * las acepta más — ver `lib/validators/tournament-team.ts`.
 */

const tournamentTeamFormSchema = z.object({
  teamId: z.string().min(1, "Elegí el equipo"),
  group: z.string().max(20, "Máximo 20 caracteres"),
  isEliminated: z.boolean(),
  notes: z.string().max(500, "Máximo 500 caracteres"),
});

type TournamentTeamFormValues = z.infer<typeof tournamentTeamFormSchema>;

interface TournamentTeamSheetProps {
  mode: "create" | "edit";
  tournamentData: ITorneo;
  tournamentTeam: ITournamentTeam | null;
  equipos: ITeam[];
  usedTeamIds: string[];
}

export default function TournamentTeamSheet({
  mode,
  tournamentData,
  tournamentTeam,
  equipos,
  usedTeamIds,
}: Readonly<TournamentTeamSheetProps>) {
  const isEdit = mode === "edit";
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<TournamentTeamFormValues>({
    resolver: zodResolver(tournamentTeamFormSchema),
    defaultValues: {
      teamId: isEdit ? (tournamentTeam?.teamId ?? "") : "",
      group: tournamentTeam?.group ?? "",
      isEliminated: tournamentTeam?.isEliminated ?? false,
      notes: tournamentTeam?.notes ?? "",
    },
  });

  const teamId = useWatch({ control: form.control, name: "teamId" });

  const teamOptions = useMemo(() => {
    const used = new Set(usedTeamIds);
    return equipos
      .filter((team) => {
        if (isEdit) return team.id === tournamentTeam?.teamId;
        // Un equipo deshabilitado (baja lógica) conserva su historial pero no se
        // puede inscribir en un torneo nuevo — modules/equipos/actions/teams.ts.
        return !used.has(team.id) && team.enabled;
      })
      .map((team) => ({ value: team.id, label: team.name }));
  }, [equipos, usedTeamIds, isEdit, tournamentTeam?.teamId]);

  const selectedTeam = equipos.find((team) => team.id === teamId);

  const onSubmit = async (data: TournamentTeamFormValues) => {
    const payload = {
      ...(isEdit ? {} : { tournamentId: tournamentData.id, teamId: data.teamId }),
      group: data.group || null,
      isEliminated: data.isEliminated,
      notes: data.notes || null,
    };

    try {
      const res = await fetch(
        isEdit
          ? `/api/tournament-teams/${tournamentTeam?.id}`
          : "/api/tournament-teams",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        toast.error(
          error?.error ??
            (isEdit
              ? "No se pudo guardar la inscripción"
              : "No se pudo inscribir el equipo"),
        );
        return;
      }

      toast.success(isEdit ? "Inscripción guardada" : "Equipo inscripto");
      setOpen(false);
      form.reset(data);
      router.refresh();
    } catch {
      toast.error("No se pudo conectar con el servidor. Revisá tu conexión.");
    }
  };

  return (
    <FormSheet
      form={form}
      onSubmit={onSubmit}
      open={open}
      onOpenChange={setOpen}
      size="md"
      icon={isEdit ? Edit : Trophy}
      title={isEdit ? "Editar inscripción" : "Inscribir equipo"}
      description={tournamentData.name}
      submitLabel={isEdit ? "Guardar cambios" : "Inscribir equipo"}
      submitIcon={isEdit ? undefined : Plus}
      trigger={
        isEdit ? (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg transition-colors hover:bg-brand/10 hover:text-brand"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">
              Editar inscripción de {tournamentTeam?.team?.name}
            </span>
          </Button>
        ) : (
          <Button variant="brand" className="h-11 px-5 font-medium">
            <Plus className="h-4 w-4" />
            Inscribir equipo
          </Button>
        )
      }
    >
      <FormSection icon={Shield} title="Equipo">
        {isEdit ? (
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <Shield
              className="h-8 w-8 shrink-0 text-brand"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {tournamentTeam?.team?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                El equipo de una inscripción no se cambia: dar de baja y volver a
                inscribir.
              </p>
            </div>
          </div>
        ) : (
          <SelectField
            control={form.control}
            name="teamId"
            label="Equipo"
            icon={Shield}
            required
            options={teamOptions}
            placeholder={
              teamOptions.length
                ? "Elegí el equipo"
                : "No quedan equipos por inscribir"
            }
            disabled={!teamOptions.length}
            description={
              selectedTeam?.homeCity
                ? `${selectedTeam.name} · ${selectedTeam.homeCity}`
                : "Solo aparecen los equipos habilitados que todavía no están en el torneo."
            }
          />
        )}
      </FormSection>

      <FormSection icon={Hash} title="Participación">
        <TextField
          control={form.control}
          name="group"
          label="Grupo o zona"
          icon={Hash}
          placeholder='Ej: "A", "Zona Norte"'
          description="Dejalo vacío si el torneo no usa grupos."
        />
        <SwitchField
          control={form.control}
          name="isEliminated"
          label="Eliminado"
          onText="Queda fuera del torneo: no se le programan más partidos."
          offText="Sigue en carrera."
        />
        <TextareaField
          control={form.control}
          name="notes"
          label="Notas internas"
          icon={ClipboardPen}
          rows={3}
          placeholder="Solo las ve el panel: pagos pendientes, sanciones, contacto…"
        />
      </FormSection>
    </FormSheet>
  );
}
