import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  Trophy,
  UserCircle,
  ImageOff,
} from "lucide-react";
import { getCarnetData } from "@/modules/jugadores/actions/getCarnetData";

type RouteParams = Promise<{ id: string }>;

export const metadata: Metadata = {
  title: "Verificación de jugador | GOLAZO",
  // Página operativa que se abre escaneando un QR en la cancha: no aporta nada
  // al índice y contiene datos de personas — fuera de Google.
  robots: { index: false, follow: false },
};

// El veredicto es una foto del momento (las suspensiones cambian fecha a
// fecha): nunca servir una versión cacheada.
export const dynamic = "force-dynamic";

const VERDICT_UI = {
  HABILITADO: {
    icon: ShieldCheck,
    label: "HABILITADO",
    sub: "Puede jugar",
    wrap: "bg-green-600",
  },
  NO_HABILITADO: {
    icon: ShieldX,
    label: "NO HABILITADO",
    sub: "No puede jugar",
    wrap: "bg-red-600",
  },
  REVISAR: {
    icon: ShieldAlert,
    label: "REVISAR",
    sub: "Verificar con la liga",
    wrap: "bg-amber-500",
  },
} as const;

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
});

/**
 * Verificación pública del carnet (N12, anti-suplantación).
 *
 * La abre la cámara del árbitro o del delegado rival al escanear el QR del
 * carnet. El trabajo de la página es UNO: comparar la cara que tiene enfrente
 * con la foto oficial y saber si puede jugar. Por eso: veredicto gigante
 * arriba, foto grande, y recién después los detalles. Sin header ni footer de
 * la app — es un documento, no una página de navegación.
 */
export default async function VerificarPage({
  params,
}: Readonly<{ params: RouteParams }>) {
  const { id } = await params;
  const data = await getCarnetData(id);
  if (!data) return notFound();

  const v = VERDICT_UI[data.verdict];
  const VerdictIcon = v.icon;

  return (
    <main className="min-h-dvh bg-gray-100 dark:bg-gray-950">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-6">
        {/* Veredicto: lo primero que se ve al abrir desde la cámara */}
        <section
          aria-live="polite"
          className={`flex items-center gap-4 rounded-3xl p-5 text-white shadow-lg ${v.wrap}`}
        >
          <VerdictIcon className="h-12 w-12 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-2xl font-extrabold tracking-tight">{v.label}</p>
            <p className="text-sm font-medium text-white/90">{v.sub}</p>
          </div>
        </section>

        {data.verdictDetail && (
          <p className="mt-3 rounded-2xl border border-gray-200 bg-white p-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            {data.verdictDetail}
          </p>
        )}

        {/* Identidad: la foto es el trabajo — grande y sin adornos */}
        <section className="mt-4 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="aspect-square w-full bg-gray-200 dark:bg-gray-800">
            {data.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.photoUrl}
                alt={`Foto oficial de ${data.name}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400">
                <ImageOff className="h-10 w-10" aria-hidden="true" />
                <p className="px-6 text-center text-sm font-medium">
                  Ficha sin foto — verificá identidad con el DNI físico
                </p>
              </div>
            )}
          </div>
          <div className="p-5">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {data.name}
            </h1>
            <p className="mt-1 font-mono text-lg text-gray-600 tabular-nums dark:text-gray-300">
              DNI {data.maskedDni}
            </p>
            {data.position && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {data.position}
              </p>
            )}
          </div>
        </section>

        {/* Equipos en torneos vigentes */}
        <section className="mt-4 space-y-2">
          {data.teams.length === 0 ? (
            <p className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              Sin equipos en torneos vigentes.
            </p>
          ) : (
            data.teams.map((t) => (
              <div
                key={`${t.teamName}-${t.tournamentName}`}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
              >
                {t.teamLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.teamLogoUrl}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <UserCircle
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900 dark:text-white">
                    {t.teamName}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {t.tournamentName}
                  </p>
                </div>
                {t.number != null && (
                  <span className="shrink-0 rounded-lg bg-gray-100 px-2.5 py-1 font-mono text-sm font-bold text-gray-700 tabular-nums dark:bg-gray-800 dark:text-gray-200">
                    #{t.number}
                  </span>
                )}
              </div>
            ))
          )}
        </section>

        {/* Sello: qué es esto y de cuándo son los datos */}
        <footer className="mt-auto pt-6 text-center">
          <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-brand">
            <Trophy className="h-4 w-4" aria-hidden="true" />
            Datos oficiales · GOLAZO
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Consultado el {dateFmt.format(data.checkedAt)} — el estado puede
            cambiar fecha a fecha.
          </p>
        </footer>
      </div>
    </main>
  );
}
