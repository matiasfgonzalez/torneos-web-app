import Link from "next/link";
import { ArrowRight, Globe2, Radio } from "lucide-react";

import { contarPartidosDeHoy } from "@/lib/futbol-hoy/consulta";

/**
 * Apartado "Ver todos los partidos que se juegan hoy" (home).
 *
 * Server component: las cifras salen de la caché ya guardada, con **una sola
 * consulta** y sin tocar API-Football (ver `contarPartidosDeHoy`). Si todavía
 * no hay nada guardado muestra su copy genérico y el link igual funciona — la
 * home no depende de que el proveedor haya respondido.
 *
 * `embebido` existe porque el apartado vive en **dos homes distintas**: la
 * landing de marketing, donde es una sección más de la página y trae su propio
 * ancho y aire; y el home del hincha logueado (`FanHome`), que ya lo pone
 * dentro de su contenedor y con su propio ritmo vertical. Sin la variante, ahí
 * quedaría con doble padding lateral — 32px de margen en un teléfono de 375px.
 */
export async function TodayFootballSection({
  embebido = false,
}: Readonly<{ embebido?: boolean }> = {}) {
  const { partidos, enVivo } = await contarPartidosDeHoy();

  const enVivoTexto = enVivo > 0 ? ` · ${enVivo} jugándose ahora` : "";
  const resumen =
    partidos === 0
      ? "Ligas de todo el mundo, agrupadas y actualizadas durante el día."
      : `${partidos} partidos hoy en el mundo${enVivoTexto}.`;

  const tarjeta = (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand to-brand-2 p-6 shadow-xl shadow-brand/20 sm:p-8">
      <div
        className="absolute right-0 top-0 h-48 w-48 -translate-y-1/2 translate-x-1/4 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
            {enVivo > 0 ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                {enVivo} en vivo ahora
              </>
            ) : (
              <>
                <Radio className="h-3.5 w-3.5" aria-hidden="true" />
                Fútbol mundial
              </>
            )}
          </div>

          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Mirá todos los partidos que se juegan hoy
          </h2>
          <p className="mt-1 max-w-xl text-white/85">{resumen}</p>
        </div>

        <Link
          href="/futbol-hoy"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-6 py-3 font-bold text-brand shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
        >
          <Globe2 className="h-4 w-4" aria-hidden="true" />
          Ver partidos de hoy
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );

  if (embebido) return tarjeta;

  return (
    <section className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{tarjeta}</div>
    </section>
  );
}
