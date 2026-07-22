import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEquipoById } from "@modules/equipos/actions/getEquipoById";
import { getEquipoMeta } from "@modules/equipos/actions/getEquipoMeta";
import PublicTeamHeader from "@modules/equipos/components/public/PublicTeamHeader";
import PublicTabsTeam from "@modules/equipos/components/public/PublicTabsTeam";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { checkUser } from "@/lib/checkUser";
import { getFavoritedIds } from "@modules/favoritos/actions/favorites";
import { FollowButton } from "@modules/favoritos/components/FollowButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const team = await getEquipoMeta(id);
  if (!team) return { title: "Equipo no encontrado | GOLAZO" };

  const description =
    team.description ??
    `Plantel, historial y estadísticas de ${team.name}${
      team.homeCity ? ` (${team.homeCity})` : ""
    } en GOLAZO.`;

  return {
    title: `${team.name} | GOLAZO`,
    description,
    alternates: { canonical: `/equipos/${id}` },
    openGraph: {
      title: team.name,
      description,
      type: "website",
      images: team.logoUrl ? [{ url: team.logoUrl }] : undefined,
    },
  };
}

export default async function PublicTeamDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const [team, user, favoritedIds] = await Promise.all([
    getEquipoById(id),
    checkUser(),
    getFavoritedIds(),
  ]);

  // Equipo inexistente → 404 real (status HTTP), no una card con 200 (soft-404
  // malo para SEO). Usa el `not-found.tsx` global, consistente con el resto.
  if (!team) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="relative pb-20">
          {/* Background decorative blob */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-brand/10 blur-3xl -z-10 rounded-full pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <Link href="/" className="hover:text-brand transition-colors">
                Inicio
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link
                href="/equipos"
                className="hover:text-brand transition-colors"
              >
                Equipos
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
                {team.name}
              </span>
            </nav>

            {/* Back Button - Premium Style */}
            <Button
              variant="ghost"
              className="hover:bg-brand/10 hover:text-brand border border-gray-200 dark:border-gray-700"
              asChild
            >
              <Link href="/equipos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Equipos
              </Link>
            </Button>

            <PublicTeamHeader
              team={team}
              followButton={
                <FollowButton
                  type="team"
                  id={team.id}
                  initialFavorited={favoritedIds.teamIds.has(team.id)}
                  isLoggedIn={!!user}
                  variant="hero"
                />
              }
            />
            <PublicTabsTeam teamData={team} />
          </div>
        </div>
      </div>
    );
}
