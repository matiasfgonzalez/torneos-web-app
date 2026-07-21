"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  toggleFavoriteTournament,
  toggleFavoriteTeam,
} from "@modules/favoritos/actions/favorites";

interface FollowButtonProps {
  type: "tournament" | "team";
  id: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
  /**
   * "icon" botón redondo solo-ícono (headers claros), "full" con texto
   * (cards/detalle sobre fondo claro), "hero" pill de vidrio para heroes
   * oscuros fijos (ej. HeaderTorneo) — no usar "icon"/"full" ahí, sus
   * colores están pensados para fondo claro con soporte dark:.
   */
  variant?: "icon" | "full" | "hero";
  className?: string;
}

/**
 * Botón de seguir/dejar de seguir un torneo o equipo (N10). Server actions
 * en modules/favoritos/actions/favorites.ts.
 */
export function FollowButton({
  type,
  id,
  initialFavorited,
  isLoggedIn,
  variant = "full",
  className,
}: Readonly<FollowButtonProps>) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!isLoggedIn) {
      router.push("/sign-in");
      return;
    }

    setLoading(true);
    const toggle = type === "tournament" ? toggleFavoriteTournament : toggleFavoriteTeam;
    try {
      const res = await toggle(id);
      if (res.success) {
        setFavorited(res.favorited);
        toast.success(
          res.favorited
            ? `Empezaste a seguir ${type === "tournament" ? "el torneo" : "el equipo"}`
            : "Dejaste de seguirlo",
        );
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const icon = loading ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Heart className={`h-4 w-4 ${favorited ? "fill-current" : ""}`} />
  );

  if (variant === "icon") {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleClick}
        disabled={loading}
        aria-pressed={favorited}
        title={favorited ? "Dejar de seguir" : "Seguir"}
        className={`rounded-full transition-colors ${
          favorited
            ? "border-brand text-brand bg-brand/10 hover:bg-brand/20"
            : "border-gray-200 dark:border-gray-700 text-gray-500 hover:text-brand hover:border-brand/50"
        } ${className ?? ""}`}
      >
        {icon}
      </Button>
    );
  }

  if (variant === "hero") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-pressed={favorited}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium backdrop-blur-sm border transition-all ${
          favorited
            ? "bg-gradient-to-r from-brand to-brand-mid border-transparent text-white shadow-lg shadow-brand/30"
            : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
        } ${className ?? ""}`}
      >
        {icon}
        {favorited ? "Siguiendo" : "Seguir"}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={loading}
      aria-pressed={favorited}
      className={`gap-2 rounded-xl transition-colors ${
        favorited
          ? "border-brand text-brand bg-brand/10 hover:bg-brand/20"
          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-brand hover:border-brand/50"
      } ${className ?? ""}`}
    >
      {icon}
      {favorited ? "Siguiendo" : "Seguir"}
    </Button>
  );
}
