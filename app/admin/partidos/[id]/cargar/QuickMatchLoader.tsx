"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Goal as GoalIcon,
  Layers,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Save,
  Shield,
  ShieldAlert,
  Target,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/formatDate";
import { getMatchById } from "@modules/partidos/actions/getMatchById";
import { IPartidos, MATCH_STATUS, MatchStatus } from "@modules/partidos/types";
import ManageGoals from "@/app/admin/torneos/[id]/components/tabs-match/ManageGoals";
import ManageCards from "@/app/admin/torneos/[id]/components/tabs-match/ManageCards";

/** Fase del torneo, tal como la ofrece el selector. */
interface PhaseOption {
  id: string;
  name: string;
  cupName: string | null;
}

interface QuickMatchLoaderProps {
  initialMatch: IPartidos;
  phases: PhaseOption[];
}

/** Radix no admite `value=""` en un `SelectItem`: usamos un centinela. */
const NONE = "NONE";

interface ResultDraft {
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  walkoverWinnerTeamId: string;
  tournamentPhaseId: string; // NONE = sin fase
  penaltyWinnerTeamId: string; // NONE = no se definió por penales
  penaltyScoreHome: number;
  penaltyScoreAway: number;
}

function draftFromMatch(match: IPartidos): ResultDraft {
  return {
    status: match.status,
    homeScore: match.homeScore ?? 0,
    awayScore: match.awayScore ?? 0,
    walkoverWinnerTeamId: match.walkoverWinnerTeamId ?? "",
    tournamentPhaseId: match.tournamentPhaseId ?? NONE,
    penaltyWinnerTeamId: match.penaltyWinnerTeamId ?? NONE,
    penaltyScoreHome: match.penaltyScoreHome ?? 0,
    penaltyScoreAway: match.penaltyScoreAway ?? 0,
  };
}

/** Etiqueta de una fase: "Copa de Oro — Semifinal" o solo el nombre. */
function phaseLabel(p: PhaseOption): string {
  return p.cupName ? `${p.cupName} — ${p.name}` : p.name;
}

export default function QuickMatchLoader({
  initialMatch,
  phases,
}: Readonly<QuickMatchLoaderProps>) {
  const [match, setMatch] = useState(initialMatch);
  const [draft, setDraft] = useState<ResultDraft>(() =>
    draftFromMatch(initialMatch),
  );
  const [isSaving, setIsSaving] = useState(false);

  // El borrador se rearma cuando llegan datos frescos del partido. Es estado
  // derivado: se ajusta durante el render comparando con el `match` anterior,
  // no con un useEffect + setState (react-hooks/set-state-in-effect).
  const [lastMatch, setLastMatch] = useState(match);
  if (match !== lastMatch) {
    setLastMatch(match);
    setDraft(draftFromMatch(match));
  }

  const refreshMatch = async () => {
    const fresh = await getMatchById(match.id);
    if (fresh) setMatch(fresh);
  };

  const isWalkover = draft.status === "WALKOVER";
  const walkoverScore = match.tournament.walkoverScore ?? 3;
  // Los penales solo aplican a un empate que no sea walkover (un 2-2 que se
  // define desde el punto). Un partido con ganador en el marcador no los usa.
  const isDraw = !isWalkover && draft.homeScore === draft.awayScore;
  const hasPenaltyWinner = draft.penaltyWinnerTeamId !== NONE;

  const homeName = match.homeTeam.team.shortName || match.homeTeam.team.name;
  const awayName = match.awayTeam.team.shortName || match.awayTeam.team.name;

  // ¿Cambió algo respecto de lo guardado? Se compara campo por campo, ya
  // normalizado (NONE ↔ null), para no habilitar "Guardar" sin cambios.
  const phaseChanged =
    (draft.tournamentPhaseId === NONE ? null : draft.tournamentPhaseId) !==
    (match.tournamentPhaseId ?? null);
  const penaltyWinnerNorm = isDraw && hasPenaltyWinner ? draft.penaltyWinnerTeamId : null;
  const penaltyChanged =
    penaltyWinnerNorm !== (match.penaltyWinnerTeamId ?? null) ||
    (isDraw &&
      hasPenaltyWinner &&
      (draft.penaltyScoreHome !== (match.penaltyScoreHome ?? 0) ||
        draft.penaltyScoreAway !== (match.penaltyScoreAway ?? 0)));

  const isDirty =
    draft.status !== match.status ||
    phaseChanged ||
    (!isWalkover &&
      (draft.homeScore !== (match.homeScore ?? 0) ||
        draft.awayScore !== (match.awayScore ?? 0))) ||
    (isWalkover &&
      draft.walkoverWinnerTeamId !== (match.walkoverWinnerTeamId ?? "")) ||
    penaltyChanged;

  const adjustScore = (side: "home" | "away", delta: number) => {
    setDraft((prev) => ({
      ...prev,
      [side === "home" ? "homeScore" : "awayScore"]: Math.max(
        0,
        Math.min(99, (side === "home" ? prev.homeScore : prev.awayScore) + delta),
      ),
    }));
  };

  const adjustPenalty = (side: "home" | "away", delta: number) => {
    setDraft((prev) => ({
      ...prev,
      [side === "home" ? "penaltyScoreHome" : "penaltyScoreAway"]: Math.max(
        0,
        Math.min(
          99,
          (side === "home" ? prev.penaltyScoreHome : prev.penaltyScoreAway) + delta,
        ),
      ),
    }));
  };

  const handleSave = async () => {
    if (isWalkover && !draft.walkoverWinnerTeamId) {
      toast.warning("Indicá el equipo ganador del walkover");
      return;
    }

    setIsSaving(true);
    try {
      const body: Record<string, unknown> = {
        status: draft.status,
        // La fase se manda siempre desde acá: así el cruce de copa no pierde
        // su fase al cargar el resultado (antes esta pantalla no la tocaba).
        tournamentPhaseId:
          draft.tournamentPhaseId === NONE ? null : draft.tournamentPhaseId,
      };

      if (isWalkover) {
        body.walkoverWinnerTeamId = draft.walkoverWinnerTeamId;
      } else {
        body.homeScore = draft.homeScore;
        body.awayScore = draft.awayScore;
        // Penales: solo con empate y un ganador elegido. Si no, se limpian
        // (por si el partido tuvo penales y después se corrigió el marcador).
        if (isDraw && hasPenaltyWinner) {
          body.penaltyWinnerTeamId = draft.penaltyWinnerTeamId;
          body.penaltyScoreHome = draft.penaltyScoreHome;
          body.penaltyScoreAway = draft.penaltyScoreAway;
        } else {
          body.penaltyWinnerTeamId = null;
          body.penaltyScoreHome = null;
          body.penaltyScoreAway = null;
        }
      }

      const res = await fetch(`/api/matches/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        toast.error(errorData?.error || "Error al guardar el resultado");
        return;
      }

      toast.success("Resultado guardado");
      await refreshMatch();
    } catch {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-24">
      {/* Volver + contexto */}
      <div className="flex items-center justify-between gap-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-2 -ml-2 text-gray-500 hover:text-brand dark:text-gray-400"
        >
          <Link href="/admin/partidos">
            <ArrowLeft className="h-4 w-4" />
            Partidos
          </Link>
        </Button>
        <Badge
          variant="outline"
          className="border-brand/30 bg-brand/5 text-brand max-w-[60%] truncate"
        >
          {match.tournament.name}
        </Badge>
      </div>

      {/* Marcador — tarjeta sticky, siempre visible mientras se cargan goles/tarjetas */}
      <Card className="sticky top-20 z-20 border-0 glass-card rounded-2xl overflow-hidden shadow-xl">
        <div className="h-1.5 bg-gradient-to-r from-brand via-brand-mid to-brand-2" />
        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Meta del partido */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(match.dateTime, "dd MMM yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(match.dateTime, "HH:mm")}
            </span>
            {match.stadium && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {match.stadium}
              </span>
            )}
          </div>

          {/* Equipos + marcador */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                {match.homeTeam.team.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={match.homeTeam.team.logoUrl}
                    alt={homeName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Shield className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <span className="text-xs font-semibold text-center truncate w-full">
                {homeName}
              </span>
              {!isWalkover && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={`Restar gol a ${homeName}`}
                    onClick={() => adjustScore("home", -1)}
                    disabled={isSaving}
                    className="h-11 w-11 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:border-brand/50 hover:text-brand active:scale-95 transition-all disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-9 text-center text-3xl font-bold font-mono tabular-nums">
                    {draft.homeScore}
                  </span>
                  <button
                    type="button"
                    aria-label={`Sumar gol a ${homeName}`}
                    onClick={() => adjustScore("home", 1)}
                    disabled={isSaving}
                    className="h-11 w-11 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:border-brand/50 hover:text-brand active:scale-95 transition-all disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-1 px-1">
              <span className="text-xs font-medium text-gray-400">VS</span>
              {isWalkover && <Trophy className="h-5 w-5 text-brand" />}
            </div>

            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                {match.awayTeam.team.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={match.awayTeam.team.logoUrl}
                    alt={awayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Shield className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <span className="text-xs font-semibold text-center truncate w-full">
                {awayName}
              </span>
              {!isWalkover && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={`Restar gol a ${awayName}`}
                    onClick={() => adjustScore("away", -1)}
                    disabled={isSaving}
                    className="h-11 w-11 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:border-brand/50 hover:text-brand active:scale-95 transition-all disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-9 text-center text-3xl font-bold font-mono tabular-nums">
                    {draft.awayScore}
                  </span>
                  <button
                    type="button"
                    aria-label={`Sumar gol a ${awayName}`}
                    onClick={() => adjustScore("away", 1)}
                    disabled={isSaving}
                    className="h-11 w-11 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:border-brand/50 hover:text-brand active:scale-95 transition-all disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Estado + fase */}
          <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Estado
              </label>
              <Select
                value={draft.status}
                onValueChange={(v) =>
                  setDraft((prev) => ({ ...prev, status: v as MatchStatus }))
                }
                disabled={isSaving}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {MATCH_STATUS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {phases.length > 0 && (
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <Layers className="h-3.5 w-3.5" />
                  Fase
                </label>
                <Select
                  value={draft.tournamentPhaseId}
                  onValueChange={(v) =>
                    setDraft((prev) => ({ ...prev, tournamentPhaseId: v }))
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Fase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Sin fase (tabla general)</SelectItem>
                    {phases.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {phaseLabel(p)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Walkover: elegir el equipo que se presentó */}
          {isWalkover && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Equipo ganador del walkover
              </label>
              <Select
                value={draft.walkoverWinnerTeamId}
                onValueChange={(v) =>
                  setDraft((prev) => ({ ...prev, walkoverWinnerTeamId: v }))
                }
                disabled={isSaving}
              >
                <SelectTrigger className="h-11 rounded-xl border-brand/30">
                  <SelectValue placeholder="Equipo ganador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={match.homeTeamId}>{homeName}</SelectItem>
                  <SelectItem value={match.awayTeamId}>{awayName}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                El marcador se fija automáticamente a {walkoverScore}-0 a favor
                del ganador.
              </p>
            </div>
          )}

          {/* Penales: aparece solo si el partido quedó empatado */}
          {isDraw && (
            <div className="space-y-3 rounded-xl border border-brand/20 bg-brand/5 p-3 dark:bg-brand/10">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                <Target className="h-4 w-4 text-brand" />
                Definición por penales
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Quedó {draft.homeScore}-{draft.awayScore}. Si se definió desde el
                punto, elegí quién ganó. El empate sigue contando para la tabla;
                los penales solo deciden quién avanza.
              </p>

              <Select
                value={draft.penaltyWinnerTeamId}
                onValueChange={(v) =>
                  setDraft((prev) => ({ ...prev, penaltyWinnerTeamId: v }))
                }
                disabled={isSaving}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Ganador por penales" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No se definió por penales</SelectItem>
                  <SelectItem value={match.homeTeamId}>{homeName}</SelectItem>
                  <SelectItem value={match.awayTeamId}>{awayName}</SelectItem>
                </SelectContent>
              </Select>

              {hasPenaltyWinner && (
                <div className="flex items-center justify-center gap-4">
                  <PenaltyStepper
                    label={homeName}
                    value={draft.penaltyScoreHome}
                    onAdjust={(d) => adjustPenalty("home", d)}
                    disabled={isSaving}
                  />
                  <span className="pt-5 text-lg font-bold text-gray-300 dark:text-gray-600">
                    :
                  </span>
                  <PenaltyStepper
                    label={awayName}
                    value={draft.penaltyScoreAway}
                    onAdjust={(d) => adjustPenalty("away", d)}
                    disabled={isSaving}
                  />
                </div>
              )}
            </div>
          )}

          {/* Guardar */}
          <Button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-brand to-brand-mid hover:from-brand-hover hover:to-brand-mid-hover text-white shadow-lg shadow-brand/25"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="ml-2">
              {isWalkover ? "Guardar walkover" : "Guardar resultado"}
            </span>
          </Button>
        </CardContent>
      </Card>

      {/* Goles */}
      <Card className="border-0 glass-card rounded-2xl overflow-hidden shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
            <div className="p-1.5 bg-gradient-to-br from-brand to-brand-mid rounded-lg">
              <GoalIcon className="w-4 h-4 text-white" />
            </div>
            Goleadores
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ManageGoals match={match} onUpdate={refreshMatch} />
        </CardContent>
      </Card>

      {/* Tarjetas */}
      <Card className="border-0 glass-card rounded-2xl overflow-hidden shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
            <div className="p-1.5 bg-gradient-to-br from-brand to-brand-mid rounded-lg">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            Tarjetas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ManageCards match={match} onUpdate={refreshMatch} />
        </CardContent>
      </Card>
    </div>
  );
}

/** Contador +/- compacto para los penales de un equipo. */
function PenaltyStepper({
  label,
  value,
  onAdjust,
  disabled,
}: Readonly<{
  label: string;
  value: number;
  onAdjust: (delta: number) => void;
  disabled: boolean;
}>) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="max-w-24 truncate text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label={`Restar penal a ${label}`}
          onClick={() => onAdjust(-1)}
          disabled={disabled}
          className="h-9 w-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:border-brand/50 hover:text-brand active:scale-95 transition-all disabled:opacity-40"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-7 text-center text-xl font-bold font-mono tabular-nums">
          {value}
        </span>
        <button
          type="button"
          aria-label={`Sumar penal a ${label}`}
          onClick={() => onAdjust(1)}
          disabled={disabled}
          className="h-9 w-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:border-brand/50 hover:text-brand active:scale-95 transition-all disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
