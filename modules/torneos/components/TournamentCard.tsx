import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Eye,
  ChevronRight,
  MapPin,
  Shield,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { EntityCard } from "@/components/shared/EntityCard";
import { ITorneo } from "@modules/torneos/types";
import { tournamentPublicPath } from "@modules/torneos/utils/publicPath";
import {
  TOURNAMENT_STATUS_LABELS,
  TOURNAMENT_FORMAT_LABELS,
  formatTournamentCategory,
} from "@/lib/constants";
import { TOURNAMENT_STATUS_SOLID_COLORS } from "@/lib/status-colors";
import { formatDate } from "@/lib/formatDate";

/**
 * Card pública de torneo (F2, anatomía consistente con TeamCard/PlayerCard
 * vía <EntityCard>) — banner con logo superpuesto + badge de estado sólido
 * (ver TOURNAMENT_STATUS_SOLID_COLORS) + meta rows.
 */
export function TournamentCard({ tournament }: { tournament: ITorneo }) {
  return (
    <EntityCard href={tournamentPublicPath(tournament)}>
      {/* Banner con logo superpuesto */}
      <div className="relative h-32 bg-gradient-to-br from-brand/10 via-brand-mid/10 to-brand-2/10 dark:from-brand/20 dark:via-brand-mid/20 dark:to-brand-2/20">
        <div className="absolute inset-0 opacity-30" aria-hidden="true">
          <div className="absolute top-4 right-4 w-20 h-20 border-2 border-brand/20 rounded-full" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-brand-2/20 rounded-full" />
        </div>

        <div className="absolute bottom-0 left-6 translate-y-1/2">
          <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-2xl shadow-xl border-4 border-white dark:border-gray-800 overflow-hidden flex items-center justify-center">
            {tournament.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tournament.logoUrl}
                alt={tournament.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Trophy className="w-8 h-8 text-brand" />
            )}
          </div>
        </div>

        <div className="absolute top-4 right-4">
          <Badge
            className={`${(TOURNAMENT_STATUS_SOLID_COLORS as Record<string, string>)[tournament.status] ?? "bg-gray-400 text-white"} shadow-lg font-semibold`}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {TOURNAMENT_STATUS_LABELS[
              tournament.status as keyof typeof TOURNAMENT_STATUS_LABELS
            ] ?? tournament.status}
          </Badge>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 pt-14">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-brand transition-colors line-clamp-2 mb-3">
          {tournament.name}
        </h3>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="outline" className="border-2 border-brand/30 text-brand font-medium">
            {formatTournamentCategory(tournament)}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="h-3.5 w-3.5" />
            <span>{tournament.locality}</span>
          </div>
        </div>

        {tournament.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
            {tournament.description}
          </p>
        )}

        <div className="space-y-3 border-t border-gray-100 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4 text-brand" />
              <span>Inicio</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatDate(tournament.startDate, "dd MMM yyyy")}
            </span>
          </div>

          {tournament.nextMatch && (
            <div className="flex items-center justify-between text-sm bg-brand/5 dark:bg-brand/10 -mx-6 px-6 py-2">
              <div className="flex items-center gap-2 text-brand">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Próximo partido</span>
              </div>
              <span className="font-bold text-brand">
                {formatDate(tournament.nextMatch, "dd MMM")}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Users className="h-4 w-4 text-brand" />
              <span>Formato</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {TOURNAMENT_FORMAT_LABELS[
                tournament.format as keyof typeof TOURNAMENT_FORMAT_LABELS
              ] ?? tournament.format}
            </span>
          </div>

          {tournament.liga && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Shield className="h-4 w-4 text-brand" />
                <span>Liga</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                {tournament.liga}
              </span>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Button variant="brand" className="w-full h-12 font-semibold group/btn">
            <Eye className="w-4 h-4 mr-2" />
            Ver Torneo
            <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </EntityCard>
  );
}
