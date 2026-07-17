"use client";

import { useState, useTransition } from "react";
import { ArrowRightLeft, Swords } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getHeadToHead } from "@modules/torneos/actions/getHeadToHead";
import type { HeadToHeadResult } from "@modules/torneos/actions/getHeadToHead";

type TeamOption = { tournamentTeamId: string; teamName: string };

/**
 * Cara a cara entre dos equipos (S7). El usuario elige dos y el historial se
 * pide al server bajo demanda: no se precalculan las N² combinaciones, que en
 * un torneo grande sería una consulta enorme para algo que casi nadie mira.
 *
 * El resultado siempre viene **desde la óptica de A** (el primer selector), así
 * que "izquierda vs derecha" es literal y no hay que dar vuelta nada.
 */
export function HeadToHead({
  tournamentId,
  teams,
}: Readonly<{ tournamentId: string; teams: TeamOption[] }>) {
  const [aId, setAId] = useState<string>("");
  const [bId, setBId] = useState<string>("");
  const [result, setResult] = useState<HeadToHeadResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [pending, startTransition] = useTransition();

  // Menos de dos equipos: no hay cara a cara posible.
  if (teams.length < 2) return null;

  const run = (a: string, b: string) => {
    if (!a || !b || a === b) {
      setResult(null);
      setNotFound(false);
      return;
    }
    startTransition(async () => {
      const res = await getHeadToHead(tournamentId, a, b).catch(() => null);
      setResult(res);
      setNotFound(res === null);
    });
  };

  const onPick = (side: "a" | "b", value: string) => {
    const nextA = side === "a" ? value : aId;
    const nextB = side === "b" ? value : bId;
    if (side === "a") setAId(value);
    else setBId(value);
    run(nextA, nextB);
  };

  return (
    <Card className="relative mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
      <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white dark:border-gray-800 dark:from-gray-900 dark:to-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 shadow-lg shadow-blue-500/25">
            <Swords className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl text-gray-900 dark:text-white">
              Cara a cara
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Elegí dos equipos y mirá su historial en el torneo
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <TeamSelect
            value={aId}
            onChange={(v) => onPick("a", v)}
            options={teams}
            disabledId={bId}
            placeholder="Equipo A"
          />
          <ArrowRightLeft
            className="h-5 w-5 shrink-0 text-gray-400"
            aria-hidden="true"
          />
          <TeamSelect
            value={bId}
            onChange={(v) => onPick("b", v)}
            options={teams}
            disabledId={aId}
            placeholder="Equipo B"
          />
        </div>

        <div className="mt-6">
          {pending && (
            <p className="text-center text-sm text-gray-500">Buscando…</p>
          )}

          {!pending && notFound && aId && bId && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              No se pudo cargar el historial. Probá con otros equipos.
            </p>
          )}

          {!pending && result && <H2HResult result={result} />}
        </div>
      </CardContent>
    </Card>
  );
}

function TeamSelect({
  value,
  onChange,
  options,
  disabledId,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: TeamOption[];
  disabledId: string;
  placeholder: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:flex-1">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((t) => (
          <SelectItem
            key={t.tournamentTeamId}
            value={t.tournamentTeamId}
            // No dejar elegir el mismo de los dos lados.
            disabled={t.tournamentTeamId === disabledId}
          >
            {t.teamName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function H2HResult({ result }: { result: HeadToHeadResult }) {
  const { aName, bName, h2h } = result;

  if (h2h.played === 0) {
    return (
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        {aName} y {bName} todavía no se enfrentaron en este torneo.
      </p>
    );
  }

  return (
    <div>
      {/* Resumen: victorias A · empates · victorias B */}
      <div className="flex items-stretch gap-2 text-center">
        <Tally label={aName} value={h2h.aWins} className="text-green-600 dark:text-green-400" />
        <Tally label="Empates" value={h2h.draws} className="text-gray-500" />
        <Tally label={bName} value={h2h.bWins} className="text-blue-600 dark:text-blue-400" />
      </div>

      <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        {h2h.played} {h2h.played === 1 ? "partido" : "partidos"} · goles{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {h2h.aGoals}
        </span>
        {" - "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {h2h.bGoals}
        </span>
      </p>

      {/* Últimos enfrentamientos */}
      <div className="mt-5 space-y-1.5">
        {h2h.matches.slice(0, 6).map((m, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800/60"
          >
            <span className="text-gray-500 dark:text-gray-400">
              {new Date(m.dateTime).toLocaleDateString("es-AR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {m.aScore} - {m.bScore}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tally({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="flex-1 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
      <div className={`text-3xl font-bold ${className}`}>{value}</div>
      <div className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
        {label}
      </div>
    </div>
  );
}
