import Link from "next/link";
import {
  Trophy,
  Users,
  ArrowRight,
  Sparkles,
  Shield,
  Newspaper,
  UserCheck,
  Heart,
} from "lucide-react";
import { GradientText } from "@/components/ui-dev/gradient-text";
import type {
  FavoriteTournamentItem,
  FavoriteTeamItem,
} from "@modules/favoritos/actions/favorites";
import { FollowButton } from "@modules/favoritos/components/FollowButton";
import { tournamentPublicPath } from "@modules/torneos/utils/publicPath";

interface FanHomeProps {
  name: string;
  hasOrganization: boolean;
  favorites: { tournaments: FavoriteTournamentItem[]; teams: FavoriteTeamItem[] };
}

const discoveryLinks = [
  { label: "Torneos", href: "/torneos", icon: Trophy },
  { label: "Equipos", href: "/equipos", icon: Shield },
  { label: "Jugadores", href: "/jugadores", icon: UserCheck },
  { label: "Noticias", href: "/noticias", icon: Newspaper },
];

/**
 * Home personalizado para USUARIO logueado (N10): torneos/equipos que
 * sigue + CTA permanente. Reemplaza la landing de marketing una vez que el
 * usuario ya se registró.
 */
export function FanHome({ name, hasOrganization, favorites }: Readonly<FanHomeProps>) {
  const hasFavorites = favorites.tournaments.length > 0 || favorites.teams.length > 0;

  return (
    <div className="min-h-screen premium-gradient-bg">
      <section className="relative overflow-hidden py-16 lg:py-20">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-brand/15 to-brand-2/15 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Saludo */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand to-brand-2 text-white px-4 py-1.5 rounded-full shadow-lg shadow-brand/25 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Tu resumen en GOLAZO
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
              Hola, <GradientText>{name}</GradientText> 👋
            </h1>
          </div>

          {/* CTA permanente */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand to-brand-2 p-6 sm:p-8 shadow-xl shadow-brand/20">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {hasOrganization
                    ? "Tu panel de organizador te espera"
                    : "¿Todavía no tenés tu liga?"}
                </h2>
                <p className="text-white/85 mt-1 max-w-xl">
                  {hasOrganization
                    ? "Cargá resultados, gestioná equipos y seguí el estado de tu plan."
                    : "Creá tu liga gratis y empezá a gestionar torneos con herramientas profesionales."}
                </p>
              </div>
              <Link
                href={hasOrganization ? "/admin/dashboard" : "/crear-liga"}
                className="inline-flex items-center justify-center gap-2 bg-white text-brand px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 shrink-0 whitespace-nowrap"
              >
                <Trophy className="w-4 h-4" />
                {hasOrganization ? "Ir a mi panel" : "Creá tu liga gratis"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Torneos seguidos */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-7 bg-gradient-to-b from-brand to-brand-2 rounded-full" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Torneos que seguís
              </h2>
            </div>
            {favorites.tournaments.length === 0 ? (
              <EmptyFollowState
                message="Todavía no seguís ningún torneo."
                href="/torneos"
                cta="Explorar torneos"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.tournaments.map((t) => (
                  <div
                    key={t.id}
                    className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={tournamentPublicPath(t)}
                        className="flex items-center gap-3 min-w-0 flex-1"
                      >
                        <div className="w-11 h-11 rounded-xl overflow-hidden border border-brand/20 flex items-center justify-center bg-gray-50 dark:bg-gray-700 shrink-0">
                          {t.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={t.logoUrl} alt={t.name} className="w-full h-full object-cover" />
                          ) : (
                            <Trophy className="w-5 h-5 text-brand" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand transition-colors">
                            {t.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {t.locality}
                          </p>
                        </div>
                      </Link>
                      <FollowButton
                        type="tournament"
                        id={t.id}
                        initialFavorited
                        isLoggedIn
                        variant="icon"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Equipos seguidos */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-7 bg-gradient-to-b from-brand to-brand-2 rounded-full" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Equipos que seguís
              </h2>
            </div>
            {favorites.teams.length === 0 ? (
              <EmptyFollowState
                message="Todavía no seguís ningún equipo."
                href="/equipos"
                cta="Explorar equipos"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.teams.map((t) => (
                  <div
                    key={t.id}
                    className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/equipos/${t.id}`}
                        className="flex items-center gap-3 min-w-0 flex-1"
                      >
                        <div className="w-11 h-11 rounded-xl overflow-hidden border border-brand/20 flex items-center justify-center bg-gray-50 dark:bg-gray-700 shrink-0">
                          {t.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={t.logoUrl} alt={t.name} className="w-full h-full object-cover" />
                          ) : (
                            <Shield className="w-5 h-5 text-brand" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand transition-colors">
                            {t.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {t.homeCity || "—"}
                          </p>
                        </div>
                      </Link>
                      <FollowButton
                        type="team"
                        id={t.id}
                        initialFavorited
                        isLoggedIn
                        variant="icon"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Descubrir */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-7 bg-gradient-to-b from-brand to-brand-2 rounded-full" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Descubrir
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {discoveryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex flex-col items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-2 rounded-xl flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-110 transition-transform">
                    <link.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {!hasFavorites && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              Tocá &quot;Seguir&quot; en cualquier torneo o equipo para verlo acá.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function EmptyFollowState({
  message,
  href,
  cta,
}: {
  message: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-300">{message}</p>
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-mid transition-colors shrink-0"
      >
        {cta}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
