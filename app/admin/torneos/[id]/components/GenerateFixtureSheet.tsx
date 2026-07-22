"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CalendarClock,
  Layers,
  Shuffle,
  Sparkles,
  Wand2,
} from "lucide-react";

import { z } from "@/lib/zod-locale";
import { Button } from "@/components/ui/button";
import { FormSheet } from "@/components/shared/form/FormSheet";
import {
  FieldRow,
  FormSection,
  NumberField,
  DateField,
  SwitchField,
} from "@/components/shared/form/fields";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toDateTimeInput } from "@/lib/date-input";
import {
  reasonWithoutGenerator,
  strategyFor,
  supportsFixture,
} from "@/lib/fixture/formats";
import { generateTournamentFixture } from "@modules/torneos/actions/generateFixture";
import type { ITorneo } from "@modules/torneos/types";
import type { TournamentFormat } from "@prisma/client";

/**
 * Generador de fixture (S1) — la UI.
 *
 * El botón solo aparece si el formato del torneo tiene generador; los formatos
 * que no (SUIZO, DOBLE_ELIMINACION…) muestran el motivo en vez de un botón que
 * no haría nada (AGENT_RULES: ningún botón sin handler).
 */

const fixtureFormSchema = z.object({
  startDate: z.string().min(1, "Elegí cuándo se juega la primera fecha"),
  intervalDays: z
    .number("Ingresá los días entre fechas")
    .int()
    .min(1, "Tiene que pasar al menos un día entre fechas")
    .max(60, "Máximo 60 días entre fechas"),
  groupCount: z
    .number("Ingresá la cantidad de grupos")
    .int()
    .min(2, "Se necesitan al menos 2 grupos")
    .max(16, "Máximo 16 grupos")
    .optional(),
  randomize: z.boolean(),
  useExistingGroups: z.boolean(),
});

type FixtureFormValues = z.infer<typeof fixtureFormSchema>;

/** Próximo sábado a las 16:00 — el default real de un torneo amateur. */
function nextSaturday(): string {
  const date = new Date();
  date.setDate(date.getDate() + ((6 - date.getDay() + 7) % 7 || 7));
  date.setHours(16, 0, 0, 0);
  return toDateTimeInput(date);
}

interface GenerateFixtureSheetProps {
  tournamentData: ITorneo;
  teamCount: number;
  onSuccess?: () => void;
}

export default function GenerateFixtureSheet({
  tournamentData,
  teamCount,
  onSuccess,
}: Readonly<GenerateFixtureSheetProps>) {
  const [open, setOpen] = useState(false);
  const [pendingReplace, setPendingReplace] = useState<FixtureFormValues | null>(
    null,
  );

  const format = tournamentData.format as TournamentFormat;
  const strategy = strategyFor(format);

  // Cuántos equipos ya tienen grupo asignado. Si la liga ya hizo el sorteo
  // —bombos, acto público, o los grupos reales de un torneo existente—,
  // respetarlos viene activado: repartir de nuevo le borraría el trabajo, y
  // como los partidos se arman sobre los grupos resultantes, corregirlos
  // después no arreglaría el fixture.
  const conGrupo = (tournamentData.tournamentTeams ?? []).filter((t) =>
    t.group?.trim(),
  ).length;
  const todosTienenGrupo = teamCount > 0 && conGrupo === teamCount;

  const form = useForm<FixtureFormValues>({
    resolver: zodResolver(fixtureFormSchema),
    defaultValues: {
      startDate: nextSaturday(),
      intervalDays: 7,
      groupCount: strategy === "GROUPS" ? 2 : undefined,
      randomize: true,
      useExistingGroups: todosTienenGrupo,
    },
  });

  // `useWatch` y no `form.watch()`: el segundo devuelve una función que el
  // React Compiler no puede memoizar (convención ya usada en team-form.tsx).
  const useExistingGroups = useWatch({
    control: form.control,
    name: "useExistingGroups",
  });

  // Formato sin generador: se explica en vez de ofrecer un botón muerto
  if (!supportsFixture(format)) {
    return (
      <p className="max-w-sm text-xs text-gray-500 dark:text-gray-400">
        {reasonWithoutGenerator(format)}
      </p>
    );
  }

  const run = async (data: FixtureFormValues, replaceExisting: boolean) => {
    const result = await generateTournamentFixture({
      tournamentId: tournamentData.id,
      startDate: new Date(data.startDate).toISOString(),
      intervalDays: data.intervalDays,
      groupCount:
        strategy === "GROUPS" && !data.useExistingGroups
          ? data.groupCount
          : undefined,
      useExistingGroups: strategy === "GROUPS" && data.useExistingGroups,
      randomize: data.randomize,
      replaceExisting,
    });

    if (!result.success) {
      // El torneo ya tiene partidos programados sin resultado: se puede
      // reemplazar, pero lo confirma el organizador.
      if (result.needsConfirmation) {
        setPendingReplace(data);
        return;
      }
      toast.error(result.error);
      return;
    }

    const parts = [
      `${result.totalMatches} ${result.totalMatches === 1 ? "partido" : "partidos"}`,
      `${result.rounds} ${result.rounds === 1 ? "fecha" : "fechas"}`,
    ];
    if (result.byes > 0) {
      parts.push(
        `${result.byes} ${result.byes === 1 ? "equipo pasa" : "equipos pasan"} sin jugar`,
      );
    }

    toast.success("Fixture generado", {
      description: `${parts.join(" · ")}. Podés reprogramar cada partido desde la tabla.`,
      duration: 8000,
    });

    setPendingReplace(null);
    setOpen(false);
    onSuccess?.();
  };

  const strategyHint = {
    ROUND_ROBIN: tournamentData.homeAndAway
      ? "Todos contra todos, ida y vuelta. La localía se reparte pareja."
      : "Todos contra todos, una vez cada cruce. La localía se reparte pareja.",
    GROUPS:
      "Reparte los equipos en zonas y arma un todos contra todos dentro de cada una.",
    KNOCKOUT:
      "Arma la primera ronda del cuadro. Las rondas siguientes se cargan cuando haya resultados: todavía no se sabe quién las juega.",
  }[strategy!];

  return (
    <>
      <FormSheet
        form={form}
        onSubmit={(data) => run(data, false)}
        open={open}
        onOpenChange={setOpen}
        size="md"
        icon={Wand2}
        title="Generar fixture"
        description={tournamentData.name}
        submitLabel="Generar fixture"
        submitIcon={Sparkles}
        trigger={
          <Button
            variant="outline"
            className="h-11 border-brand/50 px-5 font-medium text-brand hover:border-brand hover:bg-brand/10"
          >
            <Wand2 className="h-4 w-4" />
            Generar fixture
          </Button>
        }
      >
        <FormSection icon={Sparkles} title="Qué se va a generar">
          <div className="space-y-2 rounded-xl border border-brand/20 bg-brand/5 p-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {teamCount} equipos inscriptos
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {strategyHint}
            </p>
          </div>
          <SwitchField
            control={form.control}
            name="randomize"
            label="Sortear los equipos"
            onText="El orden se sortea antes de armar el fixture."
            offText="Se respeta el orden de inscripción."
          />
        </FormSection>

        {strategy === "GROUPS" && (
          <FormSection icon={Layers} title="Zonas">
            {conGrupo > 0 && (
              <SwitchField
                control={form.control}
                name="useExistingGroups"
                label="Usar los grupos ya asignados"
                onText={
                  todosTienenGrupo
                    ? `Se respetan los grupos que pusiste en los ${teamCount} equipos. No se sortea nada.`
                    : `⚠️ Solo ${conGrupo} de ${teamCount} equipos tienen grupo. Asignáselo a todos o desactivá esta opción.`
                }
                offText="El sistema reparte los equipos y reescribe el grupo de cada uno."
              />
            )}

            {!useExistingGroups && (
              <NumberField
                control={form.control}
                name="groupCount"
                label="Cantidad de grupos"
                icon={Layers}
                required
                min={2}
                max={Math.max(2, Math.floor(teamCount / 2))}
                description="Los equipos se reparten parejo entre las zonas. Esto reescribe el grupo de cada equipo inscripto."
              />
            )}
          </FormSection>
        )}

        <FormSection
          icon={CalendarClock}
          title="Calendario"
          description="Todos los partidos de una fecha se programan el mismo día y hora."
        >
          <FieldRow>
            <DateField
              control={form.control}
              name="startDate"
              label="Primera fecha"
              icon={CalendarClock}
              required
              withTime
            />
            <NumberField
              control={form.control}
              name="intervalDays"
              label="Días entre fechas"
              icon={Shuffle}
              required
              min={1}
              max={60}
              unit="días"
              description="7 = una fecha por semana."
            />
          </FieldRow>
        </FormSection>
      </FormSheet>

      <ConfirmDialog
        open={!!pendingReplace}
        onOpenChange={(next) => !next && setPendingReplace(null)}
        tone="warning"
        title="¿Reemplazar el fixture actual?"
        description="El torneo ya tiene partidos programados sin resultados cargados. Se van a borrar y reemplazar por el fixture nuevo. Los partidos ya jugados nunca se tocan."
        confirmLabel="Reemplazar"
        cancelLabel="Cancelar"
        onConfirm={async () => {
          if (pendingReplace) await run(pendingReplace, true);
        }}
      />
    </>
  );
}
