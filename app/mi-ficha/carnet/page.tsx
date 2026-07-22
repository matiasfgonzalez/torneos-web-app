import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Trophy, UserCircle } from "lucide-react";

import { checkUser } from "@/lib/checkUser";
import { qrSvg } from "@/lib/qr";
import { absoluteUrl } from "@/lib/urls";
import { getMyPlayerClaim } from "@modules/jugadores/actions/claims";
import { getCarnetData } from "@modules/jugadores/actions/getCarnetData";
import { PrintButton } from "@modules/torneos/components/PrintButton";

export const metadata: Metadata = {
  title: "Mi carnet | GOLAZO",
  robots: { index: false, follow: false },
};

const VERDICT_CHIP = {
  HABILITADO: { label: "Habilitado", cls: "bg-green-100 text-green-800" },
  NO_HABILITADO: { label: "No habilitado", cls: "bg-red-100 text-red-800" },
  REVISAR: { label: "Revisar con la liga", cls: "bg-amber-100 text-amber-800" },
} as const;

/**
 * Carnet digital del jugador (N12) — solo el dueño de la ficha (claim
 * APROBADO). Se muestra en el celular en la cancha o se imprime.
 *
 * Decisión de diseño: el carnet NO cambia con el tema — una credencial física
 * no cambia de color según la hora; mantenerlo claro y fijo refuerza que es un
 * documento, no una pantalla más. El QR va sobre placa blanca SIEMPRE (los
 * lectores necesitan contraste negro-sobre-blanco).
 */
export default async function CarnetPage() {
  const user = await checkUser();
  if (!user) redirect("/sign-in");

  const claim = await getMyPlayerClaim();
  if (claim?.status !== "APROBADO") redirect("/mi-ficha");

  const data = await getCarnetData(claim.playerId);
  if (!data) redirect("/mi-ficha");

  const verifyUrl = absoluteUrl(`/verificar/${data.playerId}`);
  const qr = await qrSvg(verifyUrl);
  const chip = VERDICT_CHIP[data.verdict];

  return (
    <main className="min-h-dvh bg-gray-100 dark:bg-gray-950 print:bg-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col px-4 py-6 print:max-w-none print:py-0">
        {/* Acciones: fuera de la impresión */}
        <div className="mb-4 flex items-center justify-between print:hidden">
          <Link
            href="/mi-ficha"
            className="flex min-h-11 items-center gap-1.5 text-sm font-medium text-brand hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Mi ficha
          </Link>
          <PrintButton />
        </div>

        {/* La credencial */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/10 print:shadow-none print:ring-1 print:ring-gray-300">
          {/* Banda de marca */}
          <div className="bg-gradient-brand px-5 py-4 text-white">
            <p className="flex items-center gap-1.5 text-sm font-bold tracking-tight">
              <Trophy className="h-4 w-4" aria-hidden="true" />
              GOLAZO
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/85">
              Carnet de jugador
            </p>
          </div>

          {/* Identidad */}
          <div className="flex items-center gap-4 p-5">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
              {data.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.photoUrl}
                  alt={`Foto de ${data.name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserCircle
                    className="h-10 w-10 text-gray-300"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold leading-tight tracking-tight text-gray-900">
                {data.name}
              </h1>
              <p className="mt-1 font-mono text-sm text-gray-600 tabular-nums">
                DNI {data.nationalId}
              </p>
              {data.position && (
                <p className="text-xs text-gray-500">{data.position}</p>
              )}
              <span
                className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${chip.cls}`}
              >
                {chip.label}
              </span>
            </div>
          </div>

          {/* Equipos vigentes */}
          {data.teams.length > 0 && (
            <div className="border-t border-gray-100 px-5 py-3">
              {data.teams.map((t) => (
                <p
                  key={`${t.teamName}-${t.tournamentName}`}
                  className="truncate py-0.5 text-xs text-gray-600"
                >
                  <span className="font-semibold text-gray-800">
                    {t.teamName}
                  </span>
                  {t.number != null && (
                    <span className="font-mono tabular-nums"> #{t.number}</span>
                  )}{" "}
                  · {t.tournamentName}
                </p>
              ))}
            </div>
          )}

          {/* Placa de escaneo: blanca siempre, es la firma del carnet */}
          <div className="border-t border-gray-100 bg-white p-5 text-center">
            {qr ? (
              // SVG generado por `qrcode` (no entrada de usuario); se inyecta
              // para escalar con el contenedor.
              <div
                className="mx-auto h-44 w-44 [&>svg]:h-full [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: qr }}
              />
            ) : (
              <p className="break-all font-mono text-xs text-gray-500">
                {verifyUrl}
              </p>
            )}
            <p className="mt-3 text-xs font-medium text-gray-500">
              El árbitro escanea y compara: foto, DNI y habilitación salen de
              GOLAZO, no del papel.
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500 print:hidden dark:text-gray-400">
          Mostralo desde el celular o imprimilo. La verificación siempre
          consulta el estado actual.
        </p>
      </div>
    </main>
  );
}
