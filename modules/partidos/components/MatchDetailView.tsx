import Link from "next/link";
import { ArrowLeft, Award, Trophy, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/shared/PageHeader";
import { IPartidos } from "@modules/partidos/types";
import { tournamentPublicPath } from "@modules/torneos/utils/publicPath";
import LiveMatch from "@modules/partidos/components/LiveMatch";

/**
 * Ficha pública de un partido (`/partidos/[id]`) — patrón §2 de
 * docs/UI_PATTERNS.md (detalle público).
 *
 * Es la vista "de hincha": marcador, cronología de goles y tarjetas, plantel de
 * árbitros y accesos a los dos equipos y al torneo. Todo lo editable vive en el
 * panel (`/admin/partidos/[id]/cargar`), acá no hay ninguna acción de escritura.
 *
 * El marcador y la cronología viven en `<LiveMatch>` (client): mientras el
 * partido está EN_JUEGO/ENTRETIEMPO se actualizan solos por polling (S6). El
 * resto de la ficha —árbitros y accesos— es estático y lo renderiza el server.
 */

const REFEREE_ROLE_LABELS: Record<string, string> = {
  PRINCIPAL: "Árbitro principal",
  ASISTENTE_1: "Asistente 1",
  ASISTENTE_2: "Asistente 2",
  CUARTO_ARBITRO: "Cuarto árbitro",
};

export default function MatchDetailView({
  match,
  liveEnabled = false,
}: Readonly<{ match: IPartidos; liveEnabled?: boolean }>) {
  const referees = match.referees ?? [];

  return (
    <div className="min-h-screen premium-gradient-bg">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <Button
          variant="ghost"
          asChild
          className="mb-6 -ml-2 text-gray-600 hover:text-brand dark:text-gray-300"
        >
          <Link href="/partidos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Todos los partidos
          </Link>
        </Button>

        {/* Marcador + cronología (se actualizan en vivo por polling si el
            plan de la liga incluye el centro en vivo, S6) */}
        <LiveMatch initialMatch={match} liveEnabled={liveEnabled} />

        {/* Árbitros */}
        {referees.length > 0 && (
          <section className="mt-10 space-y-4">
            <SectionTitle>Terna arbitral</SectionTitle>
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
              <CardContent className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                {referees.map((r) => (
                  <div key={r.id} className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand dark:bg-brand/20">
                      <Award className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900 dark:text-white">
                        {r.referee.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {REFEREE_ROLE_LABELS[r.role] ?? r.role}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Accesos */}
        <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Button variant="outline" asChild className="h-12 justify-start">
            <Link href={`/equipos/${match.homeTeam.team.id}`}>
              <Users className="mr-2 h-4 w-4 text-brand" />
              <span className="truncate">{match.homeTeam.team.name}</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-12 justify-start">
            <Link href={`/equipos/${match.awayTeam.team.id}`}>
              <Users className="mr-2 h-4 w-4 text-brand" />
              <span className="truncate">{match.awayTeam.team.name}</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-12 justify-start">
            <Link href={tournamentPublicPath(match.tournament)}>
              <Trophy className="mr-2 h-4 w-4 text-brand" />
              <span className="truncate">{match.tournament.name}</span>
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
