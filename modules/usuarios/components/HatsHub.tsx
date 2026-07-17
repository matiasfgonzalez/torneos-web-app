import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Shield,
  Trophy,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ORG_ROLE_LABELS } from "@/lib/constants";
import type { UserHats } from "@/lib/userHats";

/**
 * Hub "Mis vínculos" del perfil (N14a, decisión D10): las mismas cuatro
 * puertas de /bienvenida —hincha, jugador, delegado, liga— pero con el estado
 * real de cada una y acceso a sumar las que falten. /bienvenida es de alta y
 * redirige a quien ya tiene un vínculo; este hub es el lugar prometido por su
 * "podés cambiarla cuando quieras", que hasta ahora no existía.
 *
 * Server component puro: recibe los datos ya resueltos por getUserHats().
 */

type HatState = "active" | "pending" | "none";

const STATE_BADGE_CLASS: Record<HatState, string> = {
  active:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-300",
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300",
  none: "border-gray-200 bg-gray-100 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

interface HatCard {
  key: string;
  icon: LucideIcon;
  title: string;
  description: string;
  state: HatState;
  badge: string;
  href: string;
  cta: string;
}

function buildCards(hats: UserHats): HatCard[] {
  const fan: HatCard =
    hats.favoritesCount > 0
      ? {
          key: "fan",
          icon: Heart,
          title: "Hincha",
          description: `Seguís ${hats.favoritesCount} ${
            hats.favoritesCount === 1 ? "favorito" : "favoritos"
          } — los ves en tu inicio.`,
          state: "active",
          badge: `${hats.favoritesCount} ${hats.favoritesCount === 1 ? "seguido" : "seguidos"}`,
          href: "/",
          cta: "Ver mi inicio",
        }
      : {
          key: "fan",
          icon: Heart,
          title: "Hincha",
          description:
            "Seguí torneos y equipos para tenerlos siempre a mano en tu inicio.",
          state: "none",
          badge: "Sin favoritos",
          href: "/torneos",
          cta: "Explorar torneos",
        };

  let player: HatCard;
  if (hats.claim?.status === "APROBADO") {
    player = {
      key: "player",
      icon: UserCircle,
      title: "Jugador",
      description: `Tu ficha: ${hats.claim.playerName}. Mirá tu trayectoria y gestioná tus datos.`,
      state: "active",
      badge: "Vinculada",
      href: "/mi-ficha",
      cta: "Ver mi ficha",
    };
  } else if (hats.claim) {
    player = {
      key: "player",
      icon: UserCircle,
      title: "Jugador",
      description: `Pediste vincular la ficha de ${hats.claim.playerName}. Tu liga o tu delegado tienen que confirmarlo.`,
      state: "pending",
      badge: "Pendiente",
      href: "/mi-ficha",
      cta: "Ver estado",
    };
  } else {
    player = {
      key: "player",
      icon: UserCircle,
      title: "Jugador",
      description:
        "Vinculá tu ficha con tu DNI y mirá tus torneos, goles y tarjetas.",
      state: "none",
      badge: "Sin vínculo",
      href: "/mi-ficha",
      cta: "Buscar mi ficha",
    };
  }

  const approvedTeams = hats.managedTeams.filter(
    (t) => t.status === "APROBADO",
  );
  const pendingTeams = hats.managedTeams.filter(
    (t) => t.status === "PENDIENTE",
  );
  let delegate: HatCard;
  if (approvedTeams.length > 0) {
    delegate = {
      key: "delegate",
      icon: Shield,
      title: "Delegado",
      description: `Representás a ${approvedTeams
        .map((t) => t.teamName)
        .join(", ")}.`,
      state: "active",
      badge:
        approvedTeams.length === 1
          ? "1 equipo"
          : `${approvedTeams.length} equipos`,
      href: "/mi-equipo",
      cta: "Ir a mi equipo",
    };
  } else if (pendingTeams.length > 0) {
    delegate = {
      key: "delegate",
      icon: Shield,
      title: "Delegado",
      description: `Tu solicitud por ${pendingTeams[0].teamName} espera la respuesta de la liga.`,
      state: "pending",
      badge: "Pendiente",
      href: "/mi-equipo",
      cta: "Ver estado",
    };
  } else {
    delegate = {
      key: "delegate",
      icon: Shield,
      title: "Delegado",
      description:
        "Reclamá o proponé tu equipo, cargá el plantel e inscribilo en torneos.",
      state: "none",
      badge: "Sin vínculo",
      href: "/mi-equipo",
      cta: "Buscar mi equipo",
    };
  }

  let org: HatCard;
  if (hats.membership) {
    org = {
      key: "org",
      icon: Trophy,
      title: "Mi liga",
      description: `${hats.membership.orgName}.`,
      state: "active",
      badge: ORG_ROLE_LABELS[hats.membership.role],
      href: "/admin/dashboard",
      cta: "Ir a mi panel",
    };
  } else if (hats.isPlatformAdmin) {
    org = {
      key: "org",
      icon: Trophy,
      title: "Plataforma",
      description: "Administrás GOLAZO: organizaciones, planes y pagos.",
      state: "active",
      badge: "Administrador",
      href: "/admin/dashboard",
      cta: "Ir al panel",
    };
  } else {
    org = {
      key: "org",
      icon: Trophy,
      title: "Mi liga",
      description:
        "Creá tu liga gratis: torneos, fixture automático y estadísticas.",
      state: "none",
      badge: "Sin liga",
      href: "/crear-liga",
      cta: "Crear mi liga",
    };
  }

  return [fan, player, delegate, org];
}

export function HatsHub({ hats }: Readonly<{ hats: UserHats }>) {
  const cards = buildCards(hats);

  return (
    <section aria-labelledby="hats-hub-title" className="space-y-4">
      <div>
        <h2
          id="hats-hub-title"
          className="text-xl font-bold text-gray-900 dark:text-white"
        >
          Mis vínculos
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tus roles en GOLAZO — entrá a cada área o sumá una nueva.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="interactive-surface group flex flex-col rounded-2xl border border-gray-200 bg-card p-5 shadow-sm dark:border-gray-700"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-mid shadow-lg shadow-brand/25">
                <card.icon className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <Badge
                variant="outline"
                className={STATE_BADGE_CLASS[card.state]}
              >
                {card.badge}
              </Badge>
            </div>

            <h3 className="font-bold text-gray-900 dark:text-white">
              {card.title}
            </h3>
            <p className="mt-1 flex-grow text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {card.description}
            </p>

            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
              {card.cta}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 ease-brand group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
