import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MatchStatus } from "@prisma/client";
import Link from "next/link";
import {
  getTournamentExportData,
  buildStandings,
  type TournamentExportData,
  type ExportStandingRow,
} from "@/lib/export/tournament-export";
import { hasFeature } from "@/lib/planLimits";
import { PrintToolbar } from "./PrintToolbar";

export const metadata: Metadata = {
  title: "Documento imprimible | GOLAZO",
  // Un documento generado no debe indexarse ni previsualizarse.
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;
type Search = Promise<{ doc?: string }>;

type ExportMatch = TournamentExportData["matches"][number];

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});
const timeFmt = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
});
const longDateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const STATUS_LABEL: Record<MatchStatus, string> = {
  [MatchStatus.PROGRAMADO]: "Programado",
  [MatchStatus.EN_JUEGO]: "En juego",
  [MatchStatus.ENTRETIEMPO]: "Entretiempo",
  [MatchStatus.FINALIZADO]: "Final",
  [MatchStatus.SUSPENDIDO]: "Suspendido",
  [MatchStatus.POSTERGADO]: "Postergado",
  [MatchStatus.CANCELADO]: "Cancelado",
  [MatchStatus.WALKOVER]: "Walkover",
};

function hasScore(m: ExportMatch): boolean {
  return m.homeScore != null && m.awayScore != null;
}

/** Agrupa el fixture por jornada (`roundNumber`); sin jornada → un solo bloque. */
function groupByRound(
  matches: ExportMatch[],
): { label: string; matches: ExportMatch[] }[] {
  const anyRound = matches.some((m) => m.roundNumber != null);
  if (!anyRound) return [{ label: "Partidos", matches }];

  const byRound = new Map<number, ExportMatch[]>();
  const noRound: ExportMatch[] = [];
  for (const m of matches) {
    if (m.roundNumber == null) {
      noRound.push(m);
      continue;
    }
    const bucket = byRound.get(m.roundNumber);
    if (bucket) bucket.push(m);
    else byRound.set(m.roundNumber, [m]);
  }

  const groups = [...byRound.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([round, ms]) => ({ label: `Fecha ${round}`, matches: ms }));
  if (noRound.length) groups.push({ label: "Sin fecha asignada", matches: noRound });
  return groups;
}

export default async function PrintTournamentPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { id } = await params;
  const { doc = "todo" } = await searchParams;

  const data = await getTournamentExportData(id);
  if (!data) return notFound();

  // Gate de plan (S8): sin `exportPdf`, no se arma el documento. Se explica en
  // vez de 404 porque el link puede estar compartido/guardado.
  if (!(await hasFeature(data.organizationId, "exportPdf"))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6 text-gray-900">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-xl font-bold">Exportar no está disponible</h1>
          <p className="mt-3 text-sm text-gray-600">
            La liga organizadora de este torneo no tiene la exportación a PDF en
            su plan.
          </p>
          <Link
            href={`/torneos/${data.id}`}
            className="mt-6 inline-block rounded-xl bg-gradient-to-r from-[#ad45ff] to-[#c77dff] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Ver el torneo
          </Link>
        </div>
      </div>
    );
  }

  const showTabla = doc === "tabla" || doc === "todo";
  const showFixture = doc === "fixture" || doc === "todo";
  const standings = showTabla ? buildStandings(data) : [];
  const rounds = showFixture ? groupByRound(data.matches) : [];

  const docTitle =
    doc === "tabla"
      ? "Tabla de posiciones"
      : doc === "fixture"
        ? "Fixture y resultados"
        : "Torneo completo";

  const dateRange = [
    longDateFmt.format(data.startDate),
    data.endDate ? longDateFmt.format(data.endDate) : null,
  ]
    .filter(Boolean)
    .join(" — ");

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 print-root">
      {/* Estilos de impresión: fuerzan color de marca en papel y evitan cortes
          feos de filas/secciones. */}
      <style>{`
        .print-root { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @media print {
          @page { margin: 12mm; size: A4; }
          html, body { background: #fff !important; }
          .no-print { display: none !important; }
          .print-doc { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; border-radius: 0 !important; }
          .print-section { break-inside: avoid; }
          .page-break { break-before: page; }
          table { break-inside: auto; }
          tr { break-inside: avoid; }
          thead { display: table-header-group; }
        }
      `}</style>

      <PrintToolbar title={`${docTitle} · ${data.name}`} />

      <div className="print-doc mx-auto my-6 max-w-4xl bg-white p-8 shadow-xl sm:p-10">
        {/* Encabezado branded de la liga */}
        <header className="mb-8 overflow-hidden rounded-2xl">
          <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] p-6 text-white">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/15 ring-1 ring-white/30">
              {data.logoUrl || data.organization.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={(data.logoUrl || data.organization.logoUrl) as string}
                  alt=""
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <span className="text-2xl font-black">
                  {data.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                {data.organization.name}
              </p>
              <h1 className="truncate text-2xl font-extrabold leading-tight sm:text-3xl">
                {data.name}
              </h1>
              <p className="mt-0.5 text-sm text-white/85">
                {[data.locality, dateRange].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
          <p className="mt-2 text-right text-xs text-gray-400">
            {docTitle} · generado el {longDateFmt.format(new Date())}
          </p>
        </header>

        {/* Tabla de posiciones */}
        {showTabla && (
          <section className="mb-10">
            <h2 className="mb-4 border-b-2 border-[#ad45ff] pb-2 text-lg font-bold text-gray-900">
              Tabla de posiciones
            </h2>
            {standings.every((g) => g.rows.length === 0) ? (
              <p className="text-sm text-gray-500">
                Todavía no hay equipos cargados en este torneo.
              </p>
            ) : (
              <div className="space-y-6">
                {standings.map((group) => (
                  <div
                    key={group.group ?? "single"}
                    className="print-section"
                  >
                    {group.group && (
                      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-[#ad45ff]">
                        Grupo {group.group}
                      </h3>
                    )}
                    <StandingsTablePrint rows={group.rows} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Fixture y resultados */}
        {showFixture && (
          <section className={showTabla ? "page-break" : ""}>
            <h2 className="mb-4 border-b-2 border-[#ad45ff] pb-2 text-lg font-bold text-gray-900">
              Fixture y resultados
            </h2>
            {data.matches.length === 0 ? (
              <p className="text-sm text-gray-500">
                Todavía no hay partidos programados.
              </p>
            ) : (
              <div className="space-y-6">
                {rounds.map((round) => (
                  <div key={round.label} className="print-section">
                    <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">
                      {round.label}
                    </h3>
                    <FixtureTablePrint matches={round.matches} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Pie */}
        <footer className="mt-10 flex items-center justify-between border-t border-gray-200 pt-4 text-xs text-gray-400">
          <span>
            Generado con <span className="font-bold text-[#ad45ff]">GOLAZO</span>
          </span>
          <span>golazo · gestión de torneos</span>
        </footer>
      </div>
    </div>
  );
}

function StandingsTablePrint({ rows }: { rows: ExportStandingRow[] }) {
  const th =
    "px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-gray-500";
  const td = "px-2 py-2 text-center text-sm text-gray-700";
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b-2 border-gray-200 bg-gray-50">
          <th className={`${th} w-8`}>#</th>
          <th className={`${th} text-left`}>Equipo</th>
          <th className={th}>PJ</th>
          <th className={th}>G</th>
          <th className={th}>E</th>
          <th className={th}>P</th>
          <th className={th}>GF</th>
          <th className={th}>GC</th>
          <th className={th}>DG</th>
          <th className={`${th} text-[#ad45ff]`}>Pts</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={`${r.position}-${r.teamName}`}
            className={`border-b border-gray-100 ${r.position === 1 ? "bg-amber-50" : ""}`}
          >
            <td className={`${td} font-bold`}>{r.position}</td>
            <td className="px-2 py-2 text-left">
              <div className="flex items-center gap-2">
                {r.teamLogoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.teamLogoUrl}
                    alt=""
                    className="h-6 w-6 shrink-0 rounded object-contain"
                  />
                )}
                <span className="text-sm font-semibold text-gray-900">
                  {r.teamName}
                </span>
              </div>
            </td>
            <td className={td}>{r.matchesPlayed}</td>
            <td className={td}>{r.wins}</td>
            <td className={td}>{r.draws}</td>
            <td className={td}>{r.losses}</td>
            <td className={td}>{r.goalsFor}</td>
            <td className={td}>{r.goalsAgainst}</td>
            <td className={td}>
              {r.goalDifference > 0 ? "+" : ""}
              {r.goalDifference}
            </td>
            <td className={`${td} font-extrabold text-gray-900`}>{r.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FixtureTablePrint({ matches }: { matches: ExportMatch[] }) {
  return (
    <table className="w-full border-collapse">
      <tbody>
        {matches.map((m) => {
          const played = hasScore(m);
          const home = m.homeTeam?.team?.name ?? "Por definir";
          const away = m.awayTeam?.team?.name ?? "Por definir";
          const venue = [m.stadium, m.city].filter(Boolean).join(", ");
          return (
            <tr key={m.id} className="border-b border-gray-100 align-middle">
              <td className="w-28 px-2 py-2 text-left text-xs text-gray-500">
                <span className="block capitalize">
                  {dateFmt.format(m.dateTime)}
                </span>
                <span className="block">{timeFmt.format(m.dateTime)}</span>
              </td>
              <td className="px-2 py-2 text-right text-sm font-semibold text-gray-900">
                {home}
              </td>
              <td className="w-20 px-2 py-2 text-center">
                {played ? (
                  <span className="inline-block rounded bg-gray-900 px-2 py-1 text-sm font-bold text-white">
                    {m.homeScore} - {m.awayScore}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-gray-400">vs</span>
                )}
                {m.penaltyScoreHome != null && m.penaltyScoreAway != null && (
                  <span className="mt-1 block text-[10px] text-gray-500">
                    pen {m.penaltyScoreHome}-{m.penaltyScoreAway}
                  </span>
                )}
              </td>
              <td className="px-2 py-2 text-left text-sm font-semibold text-gray-900">
                {away}
              </td>
              <td className="hidden w-40 px-2 py-2 text-right text-[11px] text-gray-400 sm:table-cell">
                {venue && <span className="block truncate">{venue}</span>}
                <span className="block">{STATUS_LABEL[m.status]}</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
