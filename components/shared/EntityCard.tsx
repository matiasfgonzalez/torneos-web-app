import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Anatomía compartida de las cards de listado público (F2) — torneo, equipo
 * y jugador tienen contenido distinto pero el mismo "marco": esquinas,
 * elevación en hover, glow y barra de acento de marca. Cada entidad decide
 * su propio layout interno (`children`); esto solo resuelve el chrome.
 *
 * Ver TournamentCard/TeamCard/PlayerCard como consumidores de referencia.
 */
export interface EntityCardProps {
  href: string;
  children: React.ReactNode;
  /** Barra de gradiente de marca que aparece arriba al hacer hover. Default: true. */
  topAccent?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function EntityCard({
  href,
  children,
  topAccent = true,
  className,
  ...aria
}: EntityCardProps) {
  return (
    <Link
      href={href}
      className="group block h-full"
      aria-label={aria["aria-label"]}
    >
      <article
        className={cn(
          // El hover (elevación + borde de marca) sale de `interactive-surface`
          // (F4): antes cada card lo escribía a mano con duraciones distintas.
          // El borde arranca transparente para que la card siga leyéndose como
          // vidrio y el color de marca solo aparezca al apuntarla.
          "interactive-surface relative h-full overflow-hidden rounded-2xl border border-transparent bg-card/80 shadow-lg backdrop-blur-xl",
          className,
        )}
      >
        {topAccent && (
          <div className="absolute top-0 left-0 z-10 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-brand to-brand-2 transition-transform duration-200 ease-brand group-hover:scale-x-100" />
        )}
        {children}
      </article>
    </Link>
  );
}

/** Círculo de logo/avatar con glow de marca en hover — patrón compartido de las 3 cards. */
export function EntityCardAvatar({
  src,
  alt,
  fallback,
  size = "md",
  shape = "rounded",
  className,
}: {
  src?: string | null;
  alt: string;
  fallback: React.ReactNode;
  size?: "sm" | "md" | "lg";
  shape?: "rounded" | "circle";
  className?: string;
}) {
  const sizeClass = { sm: "w-14 h-14", md: "w-20 h-20", lg: "w-24 h-24" }[size];
  return (
    <div className={cn("relative shrink-0", sizeClass, className)}>
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-brand/20 to-brand-2/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          shape === "circle" ? "rounded-full" : "rounded-2xl",
        )}
      />
      <div
        className={cn(
          "relative z-10 w-full h-full flex items-center justify-center overflow-hidden border-2 bg-white dark:bg-gray-700 border-gray-100 dark:border-gray-600 group-hover:border-brand/30 transition-colors",
          shape === "circle" ? "rounded-full" : "rounded-2xl",
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          fallback
        )}
      </div>
    </div>
  );
}
