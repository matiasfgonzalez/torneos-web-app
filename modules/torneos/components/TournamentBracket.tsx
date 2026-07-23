"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Trophy, Swords, Medal } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IMatch } from "@modules/torneos/types/tournament-teams.types";
import { isKnockoutPhaseType, isFinalPhase } from "@/lib/standings/phase-utils";

/**
 * Cuadro / bracket de la fase final (S13c) — el "cómo se ve" que pidió el
 * usuario, con la forma de embudo de dos lados de un póster de eliminatorias.
 *
 * ⚠️ Es un **layout visual por rondas**, no un árbol de avance real: el modelo
 * no guarda qué partido alimenta a cuál (la copa siembra cada ronda desde los
 * WINNERS de la anterior, sin enlace match→match). Las líneas conectan la forma
 * del embudo, no "el ganador de este cruce juega ese otro". Es lo máximo
 * derivable del dato — y alcanza para que el hincha lea la fase de un vistazo.
 *
 * Responsive: el cuadro entero vive en un contenedor con scroll horizontal
 * propio (no rompe el ancho de la página, regla de responsive-design). En
 * mobile se explora paneando, como se mira un afiche; al montar, se centra solo
 * en la final.
 */

interface Round {
  name: string;
  order: number;
  matches: IMatch[];
}

interface TournamentBracketProps {
  matches: IMatch[];
  className?: string;
  title?: string;
  description?: string;
}

/** ¿El nombre de la fase es el partido por el 3er puesto? */
function isThirdPlace(name: string): boolean {
  const n = name.trim().toLowerCase();
  return n.includes("3") || n.includes("tercer") || n.includes("puesto");
}

/** Nombre corto de un equipo para las llaves (entra en poco ancho). */
function teamLabel(team?: { name: string; shortName?: string } | null): string {
  if (!team) return "Por definir";
  return team.shortName?.trim() || team.name;
}

export function TournamentBracket({
  matches,
  className = "",
  title = "Cuadro de la fase final",
  description = "Las llaves de la eliminación directa",
}: Readonly<TournamentBracketProps>) {
  const { leftColumns, rightColumns, final, third } = useMemo(() => {
    // Agrupar los partidos de eliminación directa por fase (por `type`, no por
    // nombre — el nombre es libre; ver phase-utils).
    const byPhase = new Map<string, Round>();
    for (const match of matches) {
      if (!isKnockoutPhaseType(match.tournamentPhase?.type)) continue;
      const phase = match.tournamentPhase;
      if (!phase) continue;
      const round = byPhase.get(phase.name) ?? {
        name: phase.name,
        order: phase.order,
        matches: [],
      };
      round.matches.push(match);
      byPhase.set(phase.name, round);
    }

    const rounds = Array.from(byPhase.values())
      .map((r) => ({
        ...r,
        matches: [...r.matches].sort(
          (a, b) =>
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
        ),
      }))
      .sort((a, b) => a.order - b.order);

    const finalRound = rounds.find((r) => isFinalPhase(r.name)) ?? null;
    const thirdRound =
      rounds.find((r) => r !== finalRound && isThirdPlace(r.name)) ?? null;
    // Rondas principales: todo lo que no es final ni 3er puesto, de la más
    // ancha (primera) a la más angosta (semis).
    const mainRounds = rounds.filter(
      (r) => r !== finalRound && r !== thirdRound,
    );

    // Embudo de dos lados: la primera mitad de cada ronda va a la izquierda, la
    // segunda a la derecha. La derecha se ordena de adentro (semis) hacia afuera.
    const left = mainRounds.map((r) => ({
      name: r.name,
      matches: r.matches.slice(0, Math.ceil(r.matches.length / 2)),
    }));
    const right = [...mainRounds]
      .reverse()
      .map((r) => ({
        name: r.name,
        matches: r.matches.slice(Math.ceil(r.matches.length / 2)),
      }));

    return {
      leftColumns: left,
      rightColumns: right,
      final: finalRound?.matches[0] ?? null,
      third: thirdRound?.matches[0] ?? null,
    };
  }, [matches]);

  // Centrar el scroll en la final al montar (en mobile la final queda al medio
  // de un cuadro ancho: sin esto el hincha arranca mirando los 16avos).
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, [leftColumns.length, rightColumns.length]);

  if (!final && leftColumns.length === 0 && rightColumns.length === 0) {
    return null;
  }

  return (
    <Card
      className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-card shadow-2xl dark:border-gray-800 ${className}`}
    >
      <div className="h-1.5 bg-gradient-to-r from-brand via-brand-mid to-brand-2" />
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white dark:border-gray-800 dark:from-gray-900 dark:to-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-brand to-brand-mid p-2.5 shadow-lg shadow-brand/25">
            <Swords className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl text-gray-900 dark:text-white">
              {title}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div
          ref={scrollRef}
          className="overflow-x-auto p-4 sm:p-6 [scrollbar-width:thin]"
        >
          <div className="flex min-w-max items-stretch justify-center gap-6">
            {leftColumns.map((col, i) => (
              <BracketColumn
                key={`l-${col.name}-${i}`}
                name={col.name}
                matches={col.matches}
                side="left"
              />
            ))}

            <CenterColumn final={final} third={third} />

            {rightColumns.map((col, i) => (
              <BracketColumn
                key={`r-${col.name}-${i}`}
                name={col.name}
                matches={col.matches}
                side="right"
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Una ronda del embudo (una columna): rótulo arriba, cruces repartidos en
 *  pares, con las líneas que arman la forma del cuadro. */
function BracketColumn({
  name,
  matches,
  side,
}: Readonly<{ name: string; matches: IMatch[]; side: "left" | "right" }>) {
  if (matches.length === 0) return null;

  // Cada par de cruces "confluye" hacia un cruce de la ronda siguiente: las
  // líneas verticales de cada par unen sus dos tarjetas y salen al centro.
  const pairs: IMatch[][] = [];
  for (let i = 0; i < matches.length; i += 2) {
    pairs.push(matches.slice(i, i + 2));
  }

  return (
    <div className="flex w-36 flex-col sm:w-44">
      <ColumnLabel name={name} />
      <div className="flex flex-1 flex-col justify-around">
        {pairs.map((pair) => (
          <div
            key={pair[0].id}
            className="relative flex flex-1 flex-col justify-around gap-3"
          >
            {pair.map((match) => (
              <BracketMatch key={match.id} match={match} />
            ))}
            <PairConnectors side={side} single={pair.length === 1} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Líneas del cuadro para un par de cruces. Solo decorativas (dan la forma del
 * embudo, no un avance concreto — ver cabecera). En un par de dos, une las dos
 * tarjetas con una vertical y sale al centro; en uno solo, una horizontal.
 * Se dibujan en el `gap-6` entre columnas con offsets fijos.
 */
function PairConnectors({
  side,
  single,
}: Readonly<{ side: "left" | "right"; single: boolean }>) {
  const line = "absolute bg-gray-300 dark:bg-gray-600";
  // Lado interno (hacia el centro): derecha en la izquierda, izquierda en la derecha.
  const innerEdge = side === "left" ? { right: 0 } : { left: 0 };
  const spineOffset = side === "left" ? { right: -12 } : { left: -12 };
  const outOffset = side === "left" ? { right: -24 } : { left: -24 };

  if (single) {
    // Un solo cruce (semifinal): una horizontal desde la tarjeta al centro.
    return (
      <span
        aria-hidden="true"
        className={line}
        style={{ ...innerEdge, top: "50%", width: 24, height: 2, marginTop: -1 }}
      />
    );
  }

  return (
    <>
      {/* Stubs horizontales desde el centro de cada tarjeta (25% y 75%). */}
      <span
        aria-hidden="true"
        className={line}
        style={{ ...innerEdge, top: "25%", width: 12, height: 2, marginTop: -1 }}
      />
      <span
        aria-hidden="true"
        className={line}
        style={{ ...innerEdge, top: "75%", width: 12, height: 2, marginTop: -1 }}
      />
      {/* Vertical que une los dos cruces del par. */}
      <span
        aria-hidden="true"
        className={line}
        style={{ ...spineOffset, top: "25%", height: "50%", width: 2 }}
      />
      {/* Salida horizontal desde el medio del par hacia la ronda siguiente. */}
      <span
        aria-hidden="true"
        className={line}
        style={{ ...outOffset, top: "50%", width: 12, height: 2, marginTop: -1 }}
      />
    </>
  );
}

/** Columna central: la final (destacada) y, debajo, el 3er puesto. */
function CenterColumn({
  final,
  third,
}: Readonly<{ final: IMatch | null; third: IMatch | null }>) {
  if (!final && !third) return null;
  const champion = winnerTeam(final);

  return (
    <div className="flex w-40 flex-col justify-center sm:w-52">
      <ColumnLabel name="Final" highlight />
      <div className="flex flex-1 flex-col justify-center gap-4">
        {final && <BracketMatch match={final} variant="final" />}

        {champion && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-center dark:border-amber-500/40 dark:bg-amber-500/10">
            <Trophy
              className="h-4 w-4 shrink-0 text-amber-500"
              aria-hidden="true"
            />
            <span className="truncate text-sm font-bold text-amber-700 dark:text-amber-300">
              Campeón: {teamLabel(champion)}
            </span>
          </div>
        )}

        {third && (
          <div className="mt-2">
            <div className="mb-2 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              <Medal className="h-3.5 w-3.5" aria-hidden="true" />
              3er puesto
            </div>
            <BracketMatch match={third} />
          </div>
        )}
      </div>
    </div>
  );
}

/** Rótulo de una ronda (Cuartos, Semis, Final…). */
function ColumnLabel({
  name,
  highlight,
}: Readonly<{ name: string; highlight?: boolean }>) {
  return (
    <div className="mb-3 flex h-6 items-center justify-center">
      <span
        className={`truncate rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
          highlight
            ? "bg-gradient-to-r from-amber-400 to-amber-500 text-white"
            : "bg-brand/10 text-brand"
        }`}
      >
        {name}
      </span>
    </div>
  );
}

/** Tarjeta de un cruce: dos equipos, marcador, ganador resaltado. */
function BracketMatch({
  match,
  variant,
}: Readonly<{ match: IMatch; variant?: "final" }>) {
  const done = match.status === "FINALIZADO";
  const live = match.status === "EN_JUEGO" || match.status === "ENTRETIEMPO";
  const homeWin = isWinner(match, "home");
  const awayWin = isWinner(match, "away");

  return (
    <Link
      href={`/partidos/${match.id}`}
      className={`block overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-150 ease-brand hover:border-brand/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
        variant === "final"
          ? "border-amber-300 shadow-amber-500/10 dark:border-amber-500/40"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <BracketTeamRow
        team={match.homeTeam?.team}
        score={match.homeScore}
        win={homeWin}
        penWin={match.penaltyWinnerTeamId === match.homeTeamId}
        showScore={done || live}
      />
      <div className="h-px bg-gray-100 dark:bg-gray-800" />
      <BracketTeamRow
        team={match.awayTeam?.team}
        score={match.awayScore}
        win={awayWin}
        penWin={match.penaltyWinnerTeamId === match.awayTeamId}
        showScore={done || live}
      />
    </Link>
  );
}

/** Una fila equipo dentro de la tarjeta del cruce. */
function BracketTeamRow({
  team,
  score,
  win,
  penWin,
  showScore,
}: Readonly<{
  team?: { name: string; shortName?: string; logoUrl?: string } | null;
  score?: number;
  win: boolean;
  penWin: boolean;
  showScore: boolean;
}>) {
  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1.5 ${
        win
          ? "bg-green-50 dark:bg-green-900/20"
          : "bg-transparent"
      }`}
    >
      <span className="h-4 w-5 shrink-0 overflow-hidden rounded-sm bg-gray-100 dark:bg-gray-700">
        {team?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={team.logoUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : null}
      </span>
      <span
        className={`flex-1 truncate text-xs ${
          win
            ? "font-bold text-green-700 dark:text-green-300"
            : "font-medium text-gray-700 dark:text-gray-200"
        }`}
      >
        {teamLabel(team)}
      </span>
      {penWin && (
        <Trophy
          className="h-3 w-3 shrink-0 text-amber-500"
          aria-label="Ganó por penales"
        />
      )}
      {showScore && (
        <span
          className={`w-4 shrink-0 text-right text-xs font-bold tabular-nums ${
            win ? "text-green-700 dark:text-green-300" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {score ?? 0}
        </span>
      )}
    </div>
  );
}

/** ¿Ganó el lado indicado? Contempla penales (S13c). */
function isWinner(match: IMatch, side: "home" | "away"): boolean {
  const teamId = side === "home" ? match.homeTeamId : match.awayTeamId;
  if (match.penaltyWinnerTeamId) return match.penaltyWinnerTeamId === teamId;
  if (match.status !== "FINALIZADO") return false;
  const home = match.homeScore ?? 0;
  const away = match.awayScore ?? 0;
  return side === "home" ? home > away : away > home;
}

/** Equipo campeón (ganador de la final), si ya está definida. */
function winnerTeam(
  final: IMatch | null,
): { name: string; shortName?: string } | null | undefined {
  if (!final) return null;
  if (isWinner(final, "home")) return final.homeTeam?.team;
  if (isWinner(final, "away")) return final.awayTeam?.team;
  return null;
}

export default TournamentBracket;
