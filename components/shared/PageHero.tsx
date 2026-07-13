import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Hero de página pública tipo listado/hub (F0) — patrón §1 de
 * docs/UI_PATTERNS.md: blobs decorativos + badge de marca + título con
 * palabra destacada + subtítulo + grid de stats glassmorphism.
 *
 * Uso:
 * <PageHero
 *   badge={{ icon: Trophy, text: "Competiciones Oficiales", endIcon: Zap }}
 *   title={<>Descubre Todos los <HeroHighlight>Torneos</HeroHighlight></>}
 *   subtitle="Desde ligas locales hasta campeonatos regionales..."
 *   stats={[{ icon: Trophy, value: 12, label: "Torneos Totales" }, ...]}
 * />
 */

export interface HeroStat {
  icon: LucideIcon;
  value: number | string;
  label: string;
  /** Clases from/to de la caja del ícono (literales). Default: marca. */
  gradient?: string;
  /** Clase shadow-* del glow del ícono. Default: marca. */
  shadow?: string;
}

export interface PageHeroProps {
  badge?: { icon: LucideIcon; text: string; endIcon?: LucideIcon };
  title: React.ReactNode;
  subtitle?: string;
  stats?: HeroStat[];
  /** Contenido extra debajo de las stats (CTAs, buscador, etc.) */
  children?: React.ReactNode;
}

/** Palabra destacada del título: gradiente de marca + subrayado dibujado. */
export function HeroHighlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative">
      <span className="bg-gradient-to-r from-brand via-brand-mid to-brand-2 bg-clip-text text-transparent">
        {children}
      </span>
      <svg
        className="absolute -bottom-2 left-0 w-full"
        height="8"
        viewBox="0 0 200 8"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M1 5.5C47.6667 2.16667 141.4 -2.3 199 5.5"
          stroke="url(#hero-underline-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient
            id="hero-underline-gradient"
            x1="0"
            y1="0"
            x2="200"
            y2="0"
          >
            <stop stopColor="var(--brand)" />
            <stop offset="1" stopColor="var(--brand-2)" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

export function PageHero({
  badge,
  title,
  subtitle,
  stats,
  children,
}: PageHeroProps) {
  const BadgeIcon = badge?.icon;
  const BadgeEndIcon = badge?.endIcon;

  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      {/* Blobs decorativos (obligatorios en el patrón — no hero plano) */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-brand/20 to-brand-2/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-brand-2/15 to-brand/15 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4" />
        {/* Acentos geométricos */}
        <div className="absolute top-20 right-20 w-32 h-0.5 bg-gradient-to-r from-brand to-transparent opacity-40" />
        <div className="absolute top-28 right-28 w-20 h-0.5 bg-gradient-to-r from-brand-2 to-transparent opacity-30" />
        <div className="absolute bottom-32 left-16 w-40 h-0.5 bg-gradient-to-l from-brand to-transparent opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          {badge && BadgeIcon && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand to-brand-2 text-white px-5 py-2 rounded-full shadow-lg shadow-brand/25 motion-safe:animate-pulse">
              <BadgeIcon className="w-5 h-5" />
              <span className="font-semibold">{badge.text}</span>
              {BadgeEndIcon && <BadgeEndIcon className="w-4 h-4" />}
            </div>
          )}

          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white text-balance leading-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-pretty leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {stats && stats.length > 0 && (
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-brand-2/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div
                      className={cn(
                        "w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center mb-4 shadow-lg",
                        stat.gradient ?? "from-brand to-brand-2",
                        stat.shadow ?? "shadow-brand/20",
                      )}
                    >
                      <StatIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {children}
      </div>
    </section>
  );
}
