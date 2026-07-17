"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Calendar,
  CalendarClock,
  Edit,
  Eye,
  FileText,
  Flag,
  Gavel,
  Hash,
  ImageIcon,
  MapPin,
  Plus,
  Repeat,
  Shield,
  Trophy,
  Users,
} from "lucide-react";

import { z } from "@/lib/zod-locale";
import { Button } from "@/components/ui/button";
import { FormSheet } from "@/components/shared/form/FormSheet";
import {
  DateField,
  FieldRow,
  FormSection,
  ImageField,
  NumberField,
  SelectField,
  SwitchField,
  TextField,
  TextareaField,
} from "@/components/shared/form/fields";
import { useFormDraft } from "@/hooks/use-form-draft";
import { toastPlanLimit } from "@/lib/planUpsell";
import { toDateInput, toDateTimeInput, dateTimeInputToISO } from "@/lib/date-input";
import {
  AGE_GROUP_OPTIONS,
  GENDER_OPTIONS,
  TOURNAMENT_FORMAT_OPTIONS,
  TOURNAMENT_STATUS_OPTIONS,
  tournamentFormatOptions,
} from "@/lib/constants";
import type { ITorneo } from "@modules/torneos/types";

/**
 * Alta y edición de torneo (F3): 25 campos en un `<FormSheet>` (panel lateral
 * en desktop, pantalla completa en mobile) con validación inline en español y
 * autoguardado de borrador en el alta.
 *
 * Antes era un `Dialog` centrado de 1146 líneas con el botón "Guardar" al final
 * de un scroll interno y el JSX de cada campo escrito a mano.
 */

// Las fechas viven como string ("2026-07-14"), que es lo que hablan los inputs
// nativos; se convierten recién al armar el payload (ver lib/date-input.ts).
const tournamentFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(100, "El nombre no puede superar los 100 caracteres"),
    description: z
      .string()
      .max(500, "La descripción no puede superar los 500 caracteres"),
    ageGroup: z.string().min(1, "Elegí la categoría"),
    gender: z.string().min(1, "Elegí el género"),
    division: z
      .string()
      .max(30, "La división no puede superar los 30 caracteres"),
    locality: z
      .string()
      .trim()
      .min(3, "La localidad debe tener al menos 3 caracteres")
      .max(50, "La localidad no puede superar los 50 caracteres"),
    startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
    endDate: z.string(),
    nextMatch: z.string(),
    logoUrl: z.string().nullish(),
    logoPublicId: z.string().nullish(),
    liga: z.string().max(100, "La liga no puede superar los 100 caracteres"),
    format: z.string().min(1, "Elegí el formato"),
    homeAndAway: z.boolean(),
    status: z.string().min(1, "Elegí el estado"),
    enabled: z.boolean(),
    // Inscripción online (S3): vacío = sin límite / sin cierre por fecha
    maxTeams: z
      .number("Ingresá un número")
      .int()
      .min(2, "El cupo mínimo es 2 equipos")
      .max(128, "El cupo máximo es 128 equipos")
      .optional(),
    registrationDeadline: z.string(),
    rules: z
      .string()
      .max(2000, "El reglamento no puede superar los 2000 caracteres"),
    trophy: z
      .string()
      .max(500, "La descripción del premio no puede superar los 500 caracteres"),
    // Configuración deportiva (N7)
    pointsWin: z.number("Ingresá un número").int().min(0).max(10),
    pointsDraw: z.number("Ingresá un número").int().min(0).max(10),
    pointsLoss: z.number("Ingresá un número").int().min(-10).max(10),
    walkoverScore: z.number("Ingresá un número").int().min(0).max(20),
    tiebreakerPreset: z.string(),
    // Sanciones automáticas (N8): 0 desactiva
    yellowsForSuspension: z.number("Ingresá un número").int().min(0).max(50),
    matchesPerRedCard: z.number("Ingresá un número").int().min(0).max(20),
  })
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    message: "La fecha de fin no puede ser anterior a la de inicio",
    path: ["endDate"],
  })
  .refine(
    (data) =>
      !data.registrationDeadline ||
      data.registrationDeadline.slice(0, 10) <= data.startDate,
    {
      message:
        "Las inscripciones no pueden cerrar después de que arranque el torneo",
      path: ["registrationDeadline"],
    },
  )
  .refine(
    (data) => !data.nextMatch || data.nextMatch.slice(0, 10) >= data.startDate,
    {
      message: "El próximo partido no puede ser anterior al inicio del torneo",
      path: ["nextMatch"],
    },
  );

type TournamentFormValues = z.infer<typeof tournamentFormSchema>;

// Presets de desempate (N7). El orden de criterios se guarda como array en
// Tournament.tiebreakers; acá se expone como opciones legibles.
const TIEBREAKER_PRESETS: Record<
  string,
  { label: string; value: ("PTS" | "DIF" | "GF" | "GA" | "WINS")[] }
> = {
  DIF_FIRST: {
    label: "Diferencia de gol, luego goles a favor (estándar)",
    value: ["PTS", "DIF", "GF", "WINS"],
  },
  GF_FIRST: {
    label: "Goles a favor, luego diferencia",
    value: ["PTS", "GF", "DIF", "WINS"],
  },
  WINS_FIRST: {
    label: "Partidos ganados primero",
    value: ["PTS", "WINS", "DIF", "GF"],
  },
};

const TIEBREAKER_OPTIONS = Object.entries(TIEBREAKER_PRESETS).map(
  ([value, preset]) => ({ value, label: preset.label }),
);

/** Deriva el preset a partir del array guardado (o el default si no coincide). */
const presetFromTiebreakers = (tiebreakers: unknown): string => {
  if (Array.isArray(tiebreakers)) {
    const serialized = JSON.stringify(tiebreakers);
    const match = Object.entries(TIEBREAKER_PRESETS).find(
      ([, preset]) => JSON.stringify(preset.value) === serialized,
    );
    if (match) return match[0];
  }
  return "DIF_FIRST";
};

const emptyValues = (): TournamentFormValues => ({
  name: "",
  description: "",
  ageGroup: AGE_GROUP_OPTIONS[0].value,
  gender: GENDER_OPTIONS[0].value,
  division: "",
  locality: "",
  startDate: "",
  endDate: "",
  nextMatch: "",
  logoUrl: null,
  logoPublicId: null,
  liga: "",
  format: TOURNAMENT_FORMAT_OPTIONS[0].value,
  homeAndAway: false,
  status: TOURNAMENT_STATUS_OPTIONS[0].value,
  enabled: true,
  maxTeams: undefined,
  registrationDeadline: "",
  rules: "",
  trophy: "",
  pointsWin: 3,
  pointsDraw: 1,
  pointsLoss: 0,
  walkoverScore: 3,
  tiebreakerPreset: "DIF_FIRST",
  yellowsForSuspension: 5,
  matchesPerRedCard: 1,
});

const valuesFromTournament = (t: ITorneo): TournamentFormValues => ({
  name: t.name ?? "",
  description: t.description ?? "",
  ageGroup: t.ageGroup || AGE_GROUP_OPTIONS[0].value,
  gender: t.gender || GENDER_OPTIONS[0].value,
  division: t.division ?? "",
  locality: t.locality ?? "",
  startDate: toDateInput(t.startDate),
  endDate: toDateInput(t.endDate),
  nextMatch: toDateTimeInput(t.nextMatch),
  logoUrl: t.logoUrl ?? null,
  logoPublicId: t.logoPublicId ?? null,
  liga: t.liga ?? "",
  format: t.format || TOURNAMENT_FORMAT_OPTIONS[0].value,
  homeAndAway: t.homeAndAway ?? false,
  status: t.status || TOURNAMENT_STATUS_OPTIONS[0].value,
  enabled: t.enabled ?? true,
  maxTeams: t.maxTeams ?? undefined,
  registrationDeadline: toDateTimeInput(t.registrationDeadline),
  rules: t.rules ?? "",
  trophy: t.trophy ?? "",
  pointsWin: t.pointsWin ?? 3,
  pointsDraw: t.pointsDraw ?? 1,
  pointsLoss: t.pointsLoss ?? 0,
  walkoverScore: t.walkoverScore ?? 3,
  tiebreakerPreset: presetFromTiebreakers(t.tiebreakers),
  yellowsForSuspension: t.yellowsForSuspension ?? 5,
  matchesPerRedCard: t.matchesPerRedCard ?? 1,
});

interface PropsDialogAddTournaments {
  tournament?: ITorneo;
}

const DialogAddTournaments = ({ tournament }: PropsDialogAddTournaments) => {
  const isEditMode = !!tournament;
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentFormSchema),
    defaultValues: isEditMode ? valuesFromTournament(tournament) : emptyValues(),
  });

  // Solo en el alta: en edición la fuente de verdad es la base (ver use-form-draft)
  const draft = useFormDraft(form, {
    key: "tournament:new",
    enabled: !isEditMode,
  });

  const onSubmit = async (data: TournamentFormValues) => {
    const { tiebreakerPreset, nextMatch, registrationDeadline, ...rest } = data;

    const payload = {
      ...rest,
      nextMatch: dateTimeInputToISO(nextMatch),
      maxTeams: data.maxTeams ?? null,
      registrationDeadline: dateTimeInputToISO(registrationDeadline),
      endDate: data.endDate || null,
      division: data.division || null,
      liga: data.liga || null,
      description: data.description || null,
      rules: data.rules || null,
      trophy: data.trophy || null,
      tiebreakers: (
        TIEBREAKER_PRESETS[tiebreakerPreset] ?? TIEBREAKER_PRESETS.DIF_FIRST
      ).value,
    };

    try {
      const res = await fetch(
        isEditMode ? `/api/tournaments/${tournament.id}` : "/api/tournaments",
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        const message =
          error?.error ??
          (isEditMode
            ? "No se pudo guardar el torneo"
            : "No se pudo crear el torneo");
        // 402 = límite del plan → upsell con acción hacia /admin/plan (N14d)
        if (res.status === 402) {
          toastPlanLimit(message);
        } else {
          toast.error(message);
        }
        return;
      }

      toast.success(isEditMode ? "Torneo guardado" : "Torneo creado");
      draft.clear();
      setOpen(false);
      form.reset(isEditMode ? data : emptyValues());
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
      draft={isEditMode ? undefined : draft}
      icon={isEditMode ? Edit : Trophy}
      title={isEditMode ? "Editar torneo" : "Crear torneo"}
      description={
        isEditMode ? tournament.name : "Los datos se guardan mientras escribís"
      }
      submitLabel={isEditMode ? "Guardar cambios" : "Crear torneo"}
      submitIcon={isEditMode ? undefined : Plus}
      trigger={
        isEditMode ? (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg border-brand/50 text-brand hover:border-brand hover:bg-brand/10"
            aria-label={`Editar ${tournament.name}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="brand" className="h-12 px-6 text-base font-semibold">
            <Plus className="h-5 w-5" />
            Crear torneo
          </Button>
        )
      }
    >
      <FormSection icon={Trophy} title="Identidad">
        <TextField
          control={form.control}
          name="name"
          label="Nombre del torneo"
          icon={Trophy}
          required
          placeholder="Ej: Copa de Verano 2026"
        />
        <FieldRow>
          <TextField
            control={form.control}
            name="locality"
            label="Localidad"
            icon={MapPin}
            required
            placeholder="Ej: Oro Verde"
          />
          <TextField
            control={form.control}
            name="liga"
            label="Liga o asociación"
            icon={Flag}
            placeholder="Ej: Liga Paranaense"
          />
        </FieldRow>
        <FieldRow cols={3}>
          <SelectField
            control={form.control}
            name="ageGroup"
            label="Categoría"
            icon={Users}
            required
            options={AGE_GROUP_OPTIONS}
          />
          <SelectField
            control={form.control}
            name="gender"
            label="Género"
            required
            options={GENDER_OPTIONS}
          />
          <TextField
            control={form.control}
            name="division"
            label="División"
            placeholder='Ej: "A", "Primera"'
          />
        </FieldRow>
        <ImageField
          control={form.control}
          name="logoUrl"
          publicIdName="logoPublicId"
          label="Logo"
          icon={ImageIcon}
          folder="torneos/logos"
          placeholder="Arrastrá el logo o hacé clic para elegirlo"
        />
        <TextareaField
          control={form.control}
          name="description"
          label="Descripción"
          icon={FileText}
          rows={3}
          placeholder="De qué se trata el torneo, quiénes participan…"
        />
      </FormSection>

      <FormSection icon={Calendar} title="Calendario">
        <FieldRow>
          <DateField
            control={form.control}
            name="startDate"
            label="Fecha de inicio"
            icon={Calendar}
            required
          />
          <DateField
            control={form.control}
            name="endDate"
            label="Fecha de fin"
            icon={Calendar}
          />
        </FieldRow>
        <DateField
          control={form.control}
          name="nextMatch"
          label="Próximo partido"
          icon={CalendarClock}
          withTime
          description="Se muestra como destacado en la ficha pública del torneo."
        />
      </FormSection>

      <FormSection
        icon={Users}
        title="Inscripción online"
        description="Aplica cuando el torneo está en estado «Inscripción»: los delegados piden anotar su equipo y vos aprobás."
      >
        <FieldRow>
          <NumberField
            control={form.control}
            name="maxTeams"
            label="Cupo de equipos"
            icon={Users}
            min={2}
            max={128}
            placeholder="Sin límite"
            description="Vacío = sin cupo. Se cuentan solo los equipos ya aprobados."
          />
          <DateField
            control={form.control}
            name="registrationDeadline"
            label="Cierre de inscripciones"
            icon={CalendarClock}
            withTime
            description="Vacío = no cierra por fecha."
          />
        </FieldRow>
      </FormSection>

      <FormSection
        icon={Gavel}
        title="Reglas deportivas"
        description="Puntaje, desempates y sanciones de la tabla de posiciones."
      >
        <FieldRow>
          <SelectField
            control={form.control}
            name="format"
            label="Formato"
            required
            // Solo los formatos que el generador de fixture sabe armar (S1).
            // Conserva el del torneo si es uno viejo sin generador.
            options={tournamentFormatOptions(tournament?.format)}
            description="Define cómo se genera el fixture."
          />
          <SelectField
            control={form.control}
            name="tiebreakerPreset"
            label="Criterio de desempate"
            options={TIEBREAKER_OPTIONS}
          />
        </FieldRow>

        <SwitchField
          control={form.control}
          name="homeAndAway"
          label="Ida y vuelta"
          onText="Cada cruce se juega dos veces, uno de local y uno de visitante."
          offText="Cada cruce se juega una sola vez."
        />

        <FieldRow cols={3}>
          <NumberField
            control={form.control}
            name="pointsWin"
            label="Puntos por victoria"
            min={0}
            max={10}
            unit="pts"
          />
          <NumberField
            control={form.control}
            name="pointsDraw"
            label="Puntos por empate"
            min={0}
            max={10}
            unit="pts"
          />
          <NumberField
            control={form.control}
            name="pointsLoss"
            label="Puntos por derrota"
            min={-10}
            max={10}
            unit="pts"
          />
        </FieldRow>

        <FieldRow cols={3}>
          <NumberField
            control={form.control}
            name="walkoverScore"
            label="Goles en walkover"
            icon={Repeat}
            min={0}
            max={20}
            description="Marcador que se le asigna al ganador."
          />
          <NumberField
            control={form.control}
            name="yellowsForSuspension"
            label="Amarillas para suspender"
            icon={Hash}
            min={0}
            max={50}
            description="0 desactiva la sanción automática."
          />
          <NumberField
            control={form.control}
            name="matchesPerRedCard"
            label="Fechas por roja"
            icon={Hash}
            min={0}
            max={20}
            description="0 desactiva la sanción automática."
          />
        </FieldRow>
      </FormSection>

      <FormSection icon={Eye} title="Publicación">
        <SelectField
          control={form.control}
          name="status"
          label="Estado"
          icon={Shield}
          required
          options={TOURNAMENT_STATUS_OPTIONS}
        />
        <SwitchField
          control={form.control}
          name="enabled"
          label="Torneo habilitado"
          onText="Visible en el sitio público."
          offText="Oculto: solo lo ve el panel."
        />
        <TextareaField
          control={form.control}
          name="rules"
          label="Reglamento"
          icon={FileText}
          rows={4}
          placeholder="Reglas especiales, formato de desempate, sanciones…"
        />
        <TextareaField
          control={form.control}
          name="trophy"
          label="Premio"
          icon={Trophy}
          rows={2}
          placeholder="Qué se lleva el campeón"
        />
      </FormSection>
    </FormSheet>
  );
};

export default DialogAddTournaments;
