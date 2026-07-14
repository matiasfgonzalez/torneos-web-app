"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CalendarClock,
  CalendarPlus,
  Edit,
  Flag,
  Hash,
  Layers,
  MapPin,
  Settings2,
  Swords,
  Target,
  Trophy,
} from "lucide-react";

import { z } from "@/lib/zod-locale";
import { FormSheet } from "@/components/shared/form/FormSheet";
import {
  DateField,
  FieldRow,
  FormSection,
  NumberField,
  SelectField,
  TextField,
  TextareaField,
  type FieldOption,
} from "@/components/shared/form/fields";
import { toDateTimeInput } from "@/lib/date-input";
import { MATCH_STATUS } from "@modules/partidos/types";
import type { ITorneo } from "@modules/torneos/types";

/**
 * Formulario único de partido (F3) — reemplaza a los DOS diálogos que convivían
 * (cierra el pendiente de A1):
 *
 * - `components/admin/match-dialog.tsx` (pantalla `/admin/partidos`): paleta
 *   zinc/violet fuera de la marca, sin dark mode real, y **roto de raíz**: pedía
 *   los equipos a `GET /api/teams` (ruta inexistente: solo hay POST) y mandaba
 *   ids de `Team` donde la API espera ids de `TournamentTeam`. Programar un
 *   partido desde ahí nunca funcionó.
 * - `app/admin/torneos/[id]/components/DialogAddEditMatch.tsx`: correcto, pero
 *   con 826 líneas de `useState` y validación a base de `toast.warning`.
 *
 * Este componente sirve a las dos pantallas: si recibe `tournament` trabaja
 * dentro de ese torneo; si no, pide elegirlo y trae sus equipos y fases de
 * `GET /api/tournaments/[id]`.
 */

/** Sentinel: Radix no admite `value=""` en un `SelectItem`. */
const NONE = "NONE";
const orNull = (value: string | undefined) =>
  !value || value === NONE ? null : value;

const matchFormSchema = z
  .object({
    tournamentId: z.string().min(1, "Elegí el torneo"),
    dateTime: z.string().min(1, "La fecha y hora son obligatorias"),
    homeTeamId: z.string().min(1, "Elegí el equipo local"),
    awayTeamId: z.string().min(1, "Elegí el equipo visitante"),
    status: z.string().min(1, "Elegí el estado"),
    tournamentPhaseId: z.string(),
    roundNumber: z
      .number("Ingresá un número")
      .int()
      .min(1, "La fecha va del 1 en adelante")
      .max(999)
      .optional(),
    stadium: z.string().max(120, "Máximo 120 caracteres"),
    city: z.string().max(120, "Máximo 120 caracteres"),
    description: z.string().max(1000, "Máximo 1000 caracteres"),
    walkoverWinnerTeamId: z.string(),
    homeScore: z.number("Ingresá un número").int().min(0).max(99).optional(),
    awayScore: z.number("Ingresá un número").int().min(0).max(99).optional(),
    penaltyWinnerTeamId: z.string(),
    penaltyScoreHome: z.number("Ingresá un número").int().min(0).max(99).optional(),
    penaltyScoreAway: z.number("Ingresá un número").int().min(0).max(99).optional(),
  })
  .refine((data) => data.homeTeamId !== data.awayTeamId, {
    message: "Un equipo no puede jugar contra sí mismo",
    path: ["awayTeamId"],
  })
  .refine(
    (data) =>
      data.status !== "WALKOVER" || orNull(data.walkoverWinnerTeamId) !== null,
    {
      message: "Indicá qué equipo se presentó",
      path: ["walkoverWinnerTeamId"],
    },
  );

type MatchFormValues = z.infer<typeof matchFormSchema>;

/** Lo que el formulario necesita de un partido existente para precargarse. */
export interface MatchToEdit {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  dateTime: string | Date;
  status: string;
  stadium?: string | null;
  city?: string | null;
  description?: string | null;
  tournamentPhaseId?: string | null;
  roundNumber?: number | null;
  homeScore?: number | null;
  awayScore?: number | null;
  penaltyWinnerTeamId?: string | null;
  penaltyScoreHome?: number | null;
  penaltyScoreAway?: number | null;
  walkoverWinnerTeamId?: string | null;
}

/** Datos del torneo que el formulario necesita para ofrecer equipos y fases. */
interface MatchContext {
  name: string;
  walkoverScore: number;
  teams: FieldOption[];
  phases: FieldOption[];
}

interface TournamentTeamDTO {
  id: string;
  team?: { name?: string | null } | null;
}

interface TournamentDetailDTO {
  name: string;
  walkoverScore?: number | null;
  tournamentTeams?: TournamentTeamDTO[];
  tournamentPhases?: { id: string; name: string }[];
}

const emptyValues = (tournamentId: string): MatchFormValues => ({
  tournamentId,
  dateTime: "",
  homeTeamId: "",
  awayTeamId: "",
  status: "PROGRAMADO",
  tournamentPhaseId: NONE,
  roundNumber: undefined,
  stadium: "",
  city: "",
  description: "",
  walkoverWinnerTeamId: NONE,
  homeScore: undefined,
  awayScore: undefined,
  penaltyWinnerTeamId: NONE,
  penaltyScoreHome: undefined,
  penaltyScoreAway: undefined,
});

const valuesFromMatch = (match: MatchToEdit): MatchFormValues => ({
  tournamentId: match.tournamentId,
  dateTime: toDateTimeInput(match.dateTime),
  homeTeamId: match.homeTeamId,
  awayTeamId: match.awayTeamId,
  status: match.status || "PROGRAMADO",
  tournamentPhaseId: match.tournamentPhaseId ?? NONE,
  roundNumber: match.roundNumber ?? undefined,
  stadium: match.stadium ?? "",
  city: match.city ?? "",
  description: match.description ?? "",
  walkoverWinnerTeamId: match.walkoverWinnerTeamId ?? NONE,
  homeScore: match.homeScore ?? undefined,
  awayScore: match.awayScore ?? undefined,
  penaltyWinnerTeamId: match.penaltyWinnerTeamId ?? NONE,
  penaltyScoreHome: match.penaltyScoreHome ?? undefined,
  penaltyScoreAway: match.penaltyScoreAway ?? undefined,
});

const contextFromTournament = (tournament: ITorneo): MatchContext => ({
  name: tournament.name,
  walkoverScore: tournament.walkoverScore ?? 3,
  teams: (tournament.tournamentTeams ?? []).map((t) => ({
    value: t.id,
    label: t.team?.name ?? "Equipo sin nombre",
  })),
  phases: (tournament.tournamentPhases ?? []).map((p) => ({
    value: p.id,
    label: p.name,
  })),
});

interface MatchFormSheetProps {
  mode: "create" | "edit";
  /** Torneo en contexto (detalle de torneo). Si falta, el formulario lo pide. */
  tournament?: ITorneo;
  match?: MatchToEdit;
  /** Modo controlado (lo usa `/admin/partidos`, que abre desde un menú). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  onSuccess?: () => void;
}

export function MatchFormSheet({
  mode,
  tournament,
  match,
  open: controlledOpen,
  onOpenChange,
  trigger,
  onSuccess,
}: Readonly<MatchFormSheetProps>) {
  const isEdit = mode === "edit";
  const router = useRouter();

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const [tournamentOptions, setTournamentOptions] = useState<FieldOption[]>([]);
  const [fetchedContext, setFetchedContext] = useState<MatchContext | null>(null);
  const [, startFetch] = useTransition();

  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchFormSchema),
    defaultValues:
      isEdit && match
        ? valuesFromMatch(match)
        : emptyValues(tournament?.id ?? ""),
  });

  // Reabrir el formulario lo vuelve a cargar desde los datos actuales del
  // partido (que pudieron cambiar en otra pantalla), sin `useEffect`+`setState`:
  // el reset viaja en el event handler que abre el panel.
  const setOpen = (next: boolean) => {
    if (next) {
      form.reset(
        isEdit && match
          ? valuesFromMatch(match)
          : emptyValues(tournament?.id ?? ""),
      );
    }
    if (isControlled) onOpenChange?.(next);
    else setUncontrolledOpen(next);
  };

  const [tournamentId, status, homeTeamId, awayTeamId] = useWatch({
    control: form.control,
    name: ["tournamentId", "status", "homeTeamId", "awayTeamId"],
  });

  // Las funciones van declaradas ANTES de los effects que las llaman
  // (react-hooks/immutability) y sus setState corren dentro de una transición
  // (react-hooks/set-state-in-effect) — ver docs/AGENT_RULES.md.
  const loadTournaments = useCallback(() => {
    startFetch(async () => {
      try {
        const res = await fetch("/api/tournaments");
        if (!res.ok) throw new Error();
        const data: { id: string; name: string }[] = await res.json();
        setTournamentOptions(data.map((t) => ({ value: t.id, label: t.name })));
      } catch {
        toast.error("No se pudieron cargar los torneos");
      }
    });
  }, []);

  const loadContext = useCallback((id: string) => {
    startFetch(async () => {
      try {
        const res = await fetch(`/api/tournaments/${id}`);
        if (!res.ok) throw new Error();
        const data: TournamentDetailDTO = await res.json();
        setFetchedContext({
          name: data.name,
          walkoverScore: data.walkoverScore ?? 3,
          teams: (data.tournamentTeams ?? []).map((t) => ({
            value: t.id,
            label: t.team?.name ?? "Equipo sin nombre",
          })),
          phases: (data.tournamentPhases ?? []).map((p) => ({
            value: p.id,
            label: p.name,
          })),
        });
      } catch {
        toast.error("No se pudieron cargar los equipos del torneo");
      }
    });
  }, []);

  const needsTournamentPicker = !tournament;

  useEffect(() => {
    if (open && needsTournamentPicker) loadTournaments();
  }, [open, needsTournamentPicker, loadTournaments]);

  useEffect(() => {
    if (open && needsTournamentPicker && tournamentId) loadContext(tournamentId);
  }, [open, needsTournamentPicker, tournamentId, loadContext]);

  const context = useMemo(
    () => (tournament ? contextFromTournament(tournament) : fetchedContext),
    [tournament, fetchedContext],
  );

  const teamOptions = context?.teams ?? [];
  const isWalkover = status === "WALKOVER";

  // El ganador (de penales o de walkover) solo puede ser uno de los dos equipos
  const involvedTeams = teamOptions.filter(
    (t) => t.value === homeTeamId || t.value === awayTeamId,
  );

  const onSubmit = async (data: MatchFormValues) => {
    const payload = {
      tournamentId: data.tournamentId,
      dateTime: new Date(data.dateTime).toISOString(),
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      status: data.status,
      tournamentPhaseId: orNull(data.tournamentPhaseId),
      roundNumber: data.roundNumber ?? null,
      stadium: data.stadium || null,
      city: data.city || null,
      description: data.description || null,
      walkoverWinnerTeamId: isWalkover ? orNull(data.walkoverWinnerTeamId) : null,
      // El marcador solo se edita; al crear, un partido arranca sin resultado.
      // En walkover lo fija el server (walkoverScore-0, N7).
      ...(isEdit && !isWalkover
        ? {
            homeScore: data.homeScore ?? null,
            awayScore: data.awayScore ?? null,
            penaltyWinnerTeamId: orNull(data.penaltyWinnerTeamId),
            penaltyScoreHome: data.penaltyScoreHome ?? null,
            penaltyScoreAway: data.penaltyScoreAway ?? null,
          }
        : {}),
    };

    try {
      const res = await fetch(
        isEdit ? `/api/matches/${match?.id}` : "/api/matches",
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
              ? "No se pudo guardar el partido"
              : "No se pudo programar el partido"),
        );
        return;
      }

      toast.success(isEdit ? "Partido guardado" : "Partido programado");
      setOpen(false);
      form.reset(isEdit ? data : emptyValues(tournament?.id ?? ""));
      onSuccess?.();
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
      trigger={trigger}
      icon={isEdit ? Edit : CalendarPlus}
      title={isEdit ? "Editar partido" : "Programar partido"}
      description={context?.name ?? "Elegí el torneo para ver sus equipos"}
      submitLabel={isEdit ? "Guardar cambios" : "Programar partido"}
      submitIcon={isEdit ? undefined : CalendarPlus}
    >
      {needsTournamentPicker && (
        <FormSection icon={Trophy} title="Torneo">
          <SelectField
            control={form.control}
            name="tournamentId"
            label="Torneo"
            icon={Trophy}
            required
            options={tournamentOptions}
            placeholder="Elegí el torneo"
            description="Los equipos y las fases salen del torneo elegido."
          />
        </FormSection>
      )}

      <FormSection icon={Swords} title="Enfrentamiento">
        <DateField
          control={form.control}
          name="dateTime"
          label="Fecha y hora"
          icon={CalendarClock}
          required
          withTime
        />
        <FieldRow>
          <SelectField
            control={form.control}
            name="homeTeamId"
            label="Equipo local"
            required
            options={teamOptions}
            placeholder={
              teamOptions.length ? "Elegí el local" : "Sin equipos inscriptos"
            }
            disabled={!teamOptions.length}
          />
          <SelectField
            control={form.control}
            name="awayTeamId"
            label="Equipo visitante"
            required
            options={teamOptions}
            placeholder={
              teamOptions.length ? "Elegí el visitante" : "Sin equipos inscriptos"
            }
            disabled={!teamOptions.length}
          />
        </FieldRow>
      </FormSection>

      <FormSection icon={Settings2} title="Programación">
        <FieldRow>
          <SelectField
            control={form.control}
            name="status"
            label="Estado"
            icon={Flag}
            required
            options={MATCH_STATUS}
          />
          <NumberField
            control={form.control}
            name="roundNumber"
            label="Fecha / jornada"
            icon={Hash}
            min={1}
            max={999}
            placeholder="1"
          />
        </FieldRow>

        {!!context?.phases.length && (
          <SelectField
            control={form.control}
            name="tournamentPhaseId"
            label="Fase"
            icon={Layers}
            options={[{ value: NONE, label: "Sin fase (tabla general)" }, ...context.phases]}
          />
        )}

        {isWalkover && (
          <SelectField
            control={form.control}
            name="walkoverWinnerTeamId"
            label="Equipo ganador del walkover"
            icon={Trophy}
            required
            options={involvedTeams}
            placeholder="¿Qué equipo se presentó?"
            description={`El marcador se fija solo en ${context?.walkoverScore ?? 3}-0 a favor del ganador. No hace falta cargar goles.`}
          />
        )}
      </FormSection>

      {isEdit && !isWalkover && (
        <FormSection
          icon={Target}
          title="Resultado"
          description="Al guardar, la tabla de posiciones se recalcula automáticamente."
        >
          <FieldRow>
            <NumberField
              control={form.control}
              name="homeScore"
              label="Goles del local"
              min={0}
              max={99}
              placeholder="0"
            />
            <NumberField
              control={form.control}
              name="awayScore"
              label="Goles del visitante"
              min={0}
              max={99}
              placeholder="0"
            />
          </FieldRow>

          <SelectField
            control={form.control}
            name="penaltyWinnerTeamId"
            label="Ganador por penales"
            icon={Trophy}
            options={[{ value: NONE, label: "No se definió por penales" }, ...involvedTeams]}
          />
          <FieldRow>
            <NumberField
              control={form.control}
              name="penaltyScoreHome"
              label="Penales del local"
              min={0}
              max={99}
              placeholder="0"
            />
            <NumberField
              control={form.control}
              name="penaltyScoreAway"
              label="Penales del visitante"
              min={0}
              max={99}
              placeholder="0"
            />
          </FieldRow>
        </FormSection>
      )}

      <FormSection icon={MapPin} title="Lugar y notas">
        <FieldRow>
          <TextField
            control={form.control}
            name="stadium"
            label="Cancha"
            icon={MapPin}
            placeholder="Ej: Estadio Municipal"
          />
          <TextField
            control={form.control}
            name="city"
            label="Ciudad"
            icon={MapPin}
            placeholder="Ej: Oro Verde"
          />
        </FieldRow>
        <TextareaField
          control={form.control}
          name="description"
          label="Notas"
          rows={3}
          placeholder="Datos adicionales del partido…"
        />
      </FormSection>
    </FormSheet>
  );
}

export default MatchFormSheet;
