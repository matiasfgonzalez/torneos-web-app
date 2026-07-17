import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getTournamentMetaBySlug } from "@modules/torneos/actions/getTorneoBySlug";
import { tournamentQrSvg } from "@/lib/qr";
import { absoluteUrl } from "@/lib/urls";
import { PrintButton } from "@modules/torneos/components/PrintButton";

type RouteParams = Promise<{ slug: string; torneo: string }>;

export const metadata: Metadata = {
  title: "QR del torneo | GOLAZO",
  // Un cartel para pegar en la pared no aporta nada al índice de Google, y sí
  // ensuciaría los resultados con una página que no es contenido.
  robots: { index: false, follow: false },
};

/**
 * Cartel imprimible con el QR del torneo (S4).
 *
 * Pensado para Ctrl+P → pared de la cancha: el hincha escanea y cae en la
 * página pública. Todo lo que no es el cartel (header, footer, botones) se
 * oculta al imprimir con `print:hidden`.
 */
export default async function TournamentQrPage({
  params,
}: Readonly<{ params: RouteParams }>) {
  const { slug, torneo } = await params;
  const meta = await getTournamentMetaBySlug(slug, torneo);
  if (!meta) return notFound();

  const url = absoluteUrl(`/liga/${slug}/${torneo}`);
  const qrSvg = await tournamentQrSvg(url);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center px-4 py-10 print:py-0">
      {/* Barra de acciones: fuera de la impresión */}
      <div className="mb-8 flex w-full items-center justify-between print:hidden">
        <a
          href={`/liga/${slug}/${torneo}`}
          className="text-sm font-medium text-brand hover:underline"
        >
          ← Volver al torneo
        </a>
        <PrintButton />
      </div>

      {/* El cartel: esto es lo único que se imprime */}
      <div className="flex w-full flex-col items-center rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm print:border-0 print:shadow-none dark:border-gray-800 dark:bg-gray-900 print:dark:bg-white">
        <div className="mb-2 flex items-center gap-2 text-brand">
          <span className="text-2xl" aria-hidden="true">
            🏆
          </span>
          <span className="text-xl font-bold tracking-tight print:text-black">
            GOLAZO
          </span>
        </div>

        <p className="text-sm text-gray-500 print:text-gray-600 dark:text-gray-400">
          {meta.organizationName}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900 print:text-black dark:text-white">
          {meta.name}
        </h1>

        <p className="mt-6 text-lg font-medium text-gray-700 print:text-black dark:text-gray-200">
          Escaneá para seguir el torneo en vivo
        </p>

        {qrSvg ? (
          // El SVG viene de `qrcode` (no de entrada de usuario) y es contenido
          // estático; se inyecta para poder escalarlo con el contenedor.
          <div
            className="mx-auto mt-6 h-64 w-64 sm:h-80 sm:w-80 [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
        ) : (
          <p className="mt-6 text-sm text-red-600">
            No se pudo generar el código QR. Compartí el link de abajo.
          </p>
        )}

        <p className="mt-6 break-all text-sm text-gray-500 print:text-gray-700 dark:text-gray-400">
          {url}
        </p>

        <p className="mt-4 text-xs text-gray-400 print:text-gray-500">
          Tabla de posiciones · Fixture · Resultados · Goleadores
        </p>
      </div>
    </main>
  );
}
