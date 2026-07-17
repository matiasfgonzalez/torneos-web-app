import { Activity, ShieldCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FairPlayRow, TeamForm } from "@/lib/stats";
import { FormBadge } from "./FormBadge";

/**
 * Fair play y racha del torneo (S7). Presentacional: recibe los rankings ya
 * calculados por `getAdvancedStats`. Mismo lenguaje visual que las tarjetas de
 * goleadores/valla (barra de acento + header con ícono).
 */
export function AdvancedStats({
  fairPlay,
  form,
}: Readonly<{ fairPlay: FairPlayRow[]; form: TeamForm[] }>) {
  const hasForm = form.some((t) => t.played > 0);

  return (
    <div className="mt-8 grid gap-8 md:grid-cols-2">
      {/* Fair Play */}
      <Card className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500" />
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white dark:border-gray-800 dark:from-gray-900 dark:to-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 p-2.5 shadow-lg shadow-green-500/25">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                Fair Play
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Menos tarjetas, mejor puesto (amarilla 1 · roja 3)
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {fairPlay.length === 0 ? (
            <EmptyRow icon={<ShieldCheck className="h-10 w-10" />}>
              Sin equipos todavía
            </EmptyRow>
          ) : (
            <div className="space-y-1">
              {fairPlay.map((row) => (
                <div
                  key={row.tournamentTeamId}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-5 shrink-0 text-center text-sm font-semibold text-gray-400">
                      {row.position}
                    </span>
                    {row.teamLogoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.teamLogoUrl}
                        alt=""
                        className="h-7 w-7 shrink-0 rounded-md bg-white object-contain p-0.5 dark:bg-gray-800"
                      />
                    ) : (
                      <span className="h-7 w-7 shrink-0 rounded-md bg-gray-100 dark:bg-gray-800" />
                    )}
                    <span className="truncate font-medium text-gray-900 dark:text-white">
                      {row.teamName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <span className="h-3 w-2.5 rounded-sm bg-yellow-400" />
                      {row.yellowCards}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <span className="h-3 w-2.5 rounded-sm bg-red-500" />
                      {row.redCards}
                    </span>
                    <span className="w-8 text-right font-bold text-gray-900 dark:text-white">
                      {row.points}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Racha / Forma */}
      <Card className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="h-1.5 bg-gradient-to-r from-brand via-brand-mid to-brand-2" />
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white dark:border-gray-800 dark:from-gray-900 dark:to-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-brand to-brand-mid p-2.5 shadow-lg shadow-brand/25">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                Racha
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Últimos resultados y racha actual
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {!hasForm ? (
            <EmptyRow icon={<Activity className="h-10 w-10" />}>
              Todavía no se jugaron partidos
            </EmptyRow>
          ) : (
            <div className="space-y-1">
              {form.map((team) => (
                <div
                  key={team.tournamentTeamId}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {team.teamLogoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={team.teamLogoUrl}
                        alt=""
                        className="h-7 w-7 shrink-0 rounded-md bg-white object-contain p-0.5 dark:bg-gray-800"
                      />
                    ) : (
                      <span className="h-7 w-7 shrink-0 rounded-md bg-gray-100 dark:bg-gray-800" />
                    )}
                    <span className="truncate font-medium text-gray-900 dark:text-white">
                      {team.teamName}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {team.recent.length === 0 ? (
                      <span className="text-sm text-gray-400">—</span>
                    ) : (
                      team.recent.map((o, i) => (
                        <FormBadge key={i} outcome={o} size="sm" />
                      ))
                    )}
                    <StreakLabel team={team} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** "4 victorias al hilo" y sus variantes — solo si la racha vale la pena (≥3). */
function StreakLabel({ team }: { team: TeamForm }) {
  const s = team.streak;
  if (!s || s.count < 3) return null;

  const noun = { W: "victorias", D: "empates", L: "derrotas" }[s.type];
  const color =
    s.type === "W"
      ? "text-green-600 dark:text-green-400"
      : s.type === "L"
        ? "text-red-600 dark:text-red-400"
        : "text-gray-500";

  return (
    <span className={`ml-2 hidden text-xs font-semibold sm:inline ${color}`}>
      {s.count} {noun} al hilo
    </span>
  );
}

function EmptyRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center text-gray-500 dark:text-gray-400">
      <span className="opacity-50">{icon}</span>
      <p>{children}</p>
    </div>
  );
}
