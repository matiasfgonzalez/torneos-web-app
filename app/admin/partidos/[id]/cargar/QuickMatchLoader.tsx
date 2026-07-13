"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Goal as GoalIcon,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Save,
  Shield,
  ShieldAlert,
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

interface QuickMatchLoaderProps {
  initialMatch: IPartidos;
}

interface ResultDraft {
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  walkoverWinnerTeamId: string;
}

function draftFromMatch(match: IPartidos): ResultDraft {
  return {
    status: match.status,
    homeScore: match.homeScore ?? 0,
    awayScore: match.awayScore ?? 0,
    walkoverWinnerTeamId: match.walkoverWinnerTeamId ?? "",
  };
}

export default function QuickMatchLoader({
  initialMatch,
}: QuickMatchLoaderProps) {
  const [match, setMatch] = useState(initialMatch);
  const [draft, setDraft] = useState<ResultDraft>(() =>
    draftFromMatch(initialMatch),
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(draftFromMatch(match));
  }, [match]);

  const refreshMatch = async () => {
    const fresh = await getMatchById(match.id);
    if (fresh) setMatch(fresh);
  };

  const isWalkover = draft.status === "WALKOVER";
  const walkoverScore = match.tournament.walkoverScore ?? 3;
  const isDirty =
    draft.status !== match.status ||
    (!isWalkover &&
      (draft.homeScore !== (match.homeScore ?? 0) ||
        draft.awayScore !== (match.awayScore ?? 0))) ||
    (isWalkover && draft.walkoverWinnerTeamId !== (match.walkoverWinnerTeamId ?? ""));

  const adjustScore = (side: "home" | "away", delta: number) => {
    setDraft((prev) => ({
      ...prev,
      [side === "home" ? "homeScore" : "awayScore"]: Math.max(
        0,
        Math.min(99, (side === "home" ? prev.homeScore : prev.awayScore) + delta),
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
      const body: Record<string, unknown> = { status: draft.status };
      if (isWalkover) {
        body.walkoverWinnerTeamId = draft.walkoverWinnerTeamId;
      } else {
        body.homeScore = draft.homeScore;
        body.awayScore = draft.awayScore;
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

  const homeName = match.homeTeam.team.shortName || match.homeTeam.team.name;
  const awayName = match.awayTeam.team.shortName || match.awayTeam.team.name;

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
              {isWalkover && (
                <Trophy className="h-5 w-5 text-brand" />
              )}
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

          {/* Estado + walkover */}
          <div className="grid grid-cols-2 gap-3 pt-1">
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

            {isWalkover ? (
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
            ) : (
              <Button
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className="h-11 rounded-xl bg-gradient-to-r from-brand to-brand-mid hover:from-brand-hover hover:to-brand-mid-hover text-white shadow-lg shadow-brand/25"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className="ml-2">Guardar</span>
              </Button>
            )}
          </div>

          {isWalkover && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                El marcador se fija automáticamente a {walkoverScore}-0 a favor
                del ganador.
              </p>
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
                <span className="ml-2">Guardar walkover</span>
              </Button>
            </div>
          )}
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
