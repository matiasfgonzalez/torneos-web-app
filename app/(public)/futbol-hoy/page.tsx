import type { Metadata } from "next";
import { CalendarDays, Globe2, Radio, Trophy, Zap } from "lucide-react";

import { PageHero, HeroHighlight } from "@/components/shared/PageHero";
import { obtenerFutbolDelDia } from "@/lib/futbol-hoy/consulta";
import { FutbolHoyView } from "@modules/futbol-hoy/components/FutbolHoyView";

/**
 * `/futbol-hoy` — todos los partidos del fútbol mundial que se juegan hoy,
 * agrupados por liga. Pública, sin sesión.
 *
 * Los datos salen de la caché en base de datos que alimenta API-Football; la
 * página no habla con el proveedor: llama a `obtenerFutbolDelDia`, que decide
 * si corresponde ir a buscar datos frescos (ver `lib/futbol-hoy/politica.ts`).
 */

// Depende de la hora y del contenido de la caché: no se puede prerenderizar.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fútbol de hoy | GOLAZO",
  description:
    "Todos los partidos de fútbol que se juegan hoy en el mundo, agrupados por liga, con resultados en vivo, horarios y estadios.",
};

export default async function FutbolHoyPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ date?: string }> }>) {
  const { date } = await searchParams;
  const datos = await obtenerFutbolDelDia(date);

  return (
    <div className="min-h-screen premium-gradient-bg">
      <PageHero
        badge={{ icon: Globe2, text: "Fútbol Mundial", endIcon: Zap }}
        title={
          <>
            Partidos de <HeroHighlight>Hoy</HeroHighlight>
          </>
        }
        subtitle="Todo lo que se juega hoy en el mundo, liga por liga: resultados en vivo, horarios y estadios."
        stats={[
          {
            icon: CalendarDays,
            value: datos.totales.partidos,
            label: "Partidos",
          },
          {
            icon: Radio,
            value: datos.totales.enVivo,
            label: "En Vivo",
            gradient: "from-green-500 to-emerald-500",
            shadow: "shadow-green-500/20",
          },
          {
            icon: Trophy,
            value: datos.totales.ligas,
            label: "Ligas",
            gradient: "from-amber-500 to-orange-500",
            shadow: "shadow-amber-500/20",
          },
          {
            icon: Zap,
            value: datos.totales.finalizados,
            label: "Finalizados",
            gradient: "from-blue-500 to-cyan-500",
            shadow: "shadow-blue-500/20",
          },
        ]}
      />

      <section className="pb-16 lg:pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* `key`: cambiar de fecha trae datos nuevos del server, y remontar es
              la forma limpia de que el estado del listado arranque de cero en
              vez de arrastrar el día anterior. */}
          <FutbolHoyView key={datos.matchDay} inicial={datos} />
        </div>
      </section>
    </div>
  );
}
