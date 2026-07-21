import type { Metadata } from "next";
import { Trophy, MapPin, Building2, Zap } from "lucide-react";
import { PageHero, HeroHighlight } from "@/components/shared/PageHero";
import { getPublicOrganizations } from "@modules/organizaciones/actions/getPublicOrganizations";
import LeaguesList from "@modules/organizaciones/components/public/LeaguesList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ligas | GOLAZO",
  description:
    "Explorá todas las ligas y organizaciones deportivas en GOLAZO: seguí sus torneos, posiciones y resultados en tiempo real.",
};

export default async function LigasPage() {
  const leagues = await getPublicOrganizations();

  const totalLigas = leagues.length;
  const totalTorneos = leagues.reduce((acc, l) => acc + l.tournamentCount, 0);
  const localidades = new Set(
    leagues.map((l) => l.locality).filter(Boolean),
  ).size;

  return (
    <div className="min-h-screen premium-gradient-bg">
      <PageHero
        badge={{ icon: Building2, text: "Ligas y Organizaciones", endIcon: Zap }}
        title={
          <>
            Encontrá tu <HeroHighlight>Liga</HeroHighlight>
          </>
        }
        subtitle="Todas las ligas y organizaciones que gestionan sus torneos en GOLAZO. Entrá a la tuya para ver fixture, posiciones y novedades."
        stats={[
          { icon: Building2, value: totalLigas, label: "Ligas Activas" },
          {
            icon: Trophy,
            value: totalTorneos,
            label: "Torneos",
            gradient: "from-green-500 to-emerald-500",
            shadow: "shadow-green-500/20",
          },
          {
            icon: MapPin,
            value: localidades,
            label: "Localidades",
            gradient: "from-blue-500 to-cyan-500",
            shadow: "shadow-blue-500/20",
          },
        ]}
      />

      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LeaguesList leagues={leagues} />
        </div>
      </section>
    </div>
  );
}
