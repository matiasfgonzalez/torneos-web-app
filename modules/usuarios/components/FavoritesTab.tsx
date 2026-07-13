import Link from "next/link";
import { ArrowRight, Shield, Trophy, Users } from "lucide-react";
import type {
  FavoriteTournamentItem,
  FavoriteTeamItem,
} from "@modules/favoritos/actions/favorites";
import { FollowButton } from "@modules/favoritos/components/FollowButton";
import { tournamentPublicPath } from "@modules/torneos/utils/publicPath";

interface FavoritesTabProps {
  tournaments: FavoriteTournamentItem[];
  teams: FavoriteTeamItem[];
}

/** Torneos/equipos que sigue el usuario — tab "Favoritos" de /profile (N10). */
export function FavoritesTab({ tournaments, teams }: Readonly<FavoritesTabProps>) {
  const isEmpty = tournaments.length === 0 && teams.length === 0;

  if (isEmpty) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#ad45ff]/10 to-[#a3b3ff]/10 flex items-center justify-center">
          <Users className="w-8 h-8 text-[#ad45ff]" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Todavía no seguís nada
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Seguí torneos y equipos para verlos acá y en tu inicio.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm font-semibold">
          <Link href="/torneos" className="inline-flex items-center gap-1 text-[#ad45ff] hover:text-[#c77dff]">
            Explorar torneos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/equipos" className="inline-flex items-center gap-1 text-[#ad45ff] hover:text-[#c77dff]">
            Explorar equipos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tournaments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Torneos ({tournaments.length})
          </h3>
          <div className="space-y-2">
            {tournaments.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50"
              >
                <Link href={tournamentPublicPath(t)} className="flex items-center gap-3 min-w-0 flex-1 group">
                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#ad45ff]/20 flex items-center justify-center bg-gray-50 dark:bg-gray-700 shrink-0">
                    {t.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.logoUrl} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      <Trophy className="w-4 h-4 text-[#ad45ff]" />
                    )}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white truncate group-hover:text-[#ad45ff] transition-colors">
                    {t.name}
                  </span>
                </Link>
                <FollowButton type="tournament" id={t.id} initialFavorited isLoggedIn variant="icon" />
              </div>
            ))}
          </div>
        </div>
      )}

      {teams.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Equipos ({teams.length})
          </h3>
          <div className="space-y-2">
            {teams.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50"
              >
                <Link href={`/equipos/${t.id}`} className="flex items-center gap-3 min-w-0 flex-1 group">
                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#ad45ff]/20 flex items-center justify-center bg-gray-50 dark:bg-gray-700 shrink-0">
                    {t.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.logoUrl} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-4 h-4 text-[#ad45ff]" />
                    )}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white truncate group-hover:text-[#ad45ff] transition-colors">
                    {t.name}
                  </span>
                </Link>
                <FollowButton type="team" id={t.id} initialFavorited isLoggedIn variant="icon" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
