import { cache } from "react";
import { ApprovalStatus, OrgRole } from "@prisma/client";
import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";

/**
 * Los "sombreros" del usuario (N14a, decisión D10): hincha, jugador, delegado
 * y miembro de liga son relaciones acumulables de la misma cuenta, no roles
 * excluyentes. La navegación y el hub "Mis vínculos" del perfil salen de acá —
 * una sola fuente, así el header no dice una cosa y el perfil otra.
 */

type AppUser = NonNullable<Awaited<ReturnType<typeof checkUser>>>;

export interface UserNavLink {
  href: string;
  label: string;
}

/**
 * Links de navegación del header para un usuario logueado, según sus
 * sombreros reales: "Mi Panel" (miembro de liga o ADMINISTRADOR), "Mi Equipo"
 * (delegado — cualquier estado: la página muestra el estado de la solicitud),
 * "Mi Ficha" (reclamo vigente). Sin ninguno → "Empezar" (/bienvenida).
 * "Mi Perfil" siempre cierra la lista.
 *
 * `cache()`: el header se renderiza en cada página pública — una sola tanda
 * de queries por request (3 `findFirst` sobre índices por userId).
 */
export const getUserNavLinks = cache(
  async (user?: AppUser | null): Promise<UserNavLink[]> => {
    const current = user ?? (await checkUser());
    if (!current) return [];

    const [membership, managership, claim] = await Promise.all([
      db.organizationMember.findFirst({
        where: { userId: current.id },
        select: { id: true },
      }),
      db.teamManager.findFirst({
        where: { userId: current.id },
        select: { id: true },
      }),
      db.playerClaim.findFirst({
        where: { userId: current.id, status: { in: ["PENDIENTE", "APROBADO"] } },
        select: { id: true },
      }),
    ]);

    const links: UserNavLink[] = [];
    if (current.role === "ADMINISTRADOR" || membership) {
      links.push({ href: "/admin/dashboard", label: "Mi Panel" });
    }
    if (managership) {
      links.push({ href: "/mi-equipo", label: "Mi Equipo" });
    }
    if (claim) {
      links.push({ href: "/mi-ficha", label: "Mi Ficha" });
    }
    if (links.length === 0) {
      links.push({ href: "/bienvenida", label: "Empezar" });
    }
    links.push({ href: "/profile", label: "Mi Perfil" });
    return links;
  },
);

export interface UserHats {
  favoritesCount: number;
  /** Reclamo de ficha vigente (PENDIENTE o APROBADO) con el nombre del jugador. */
  claim: { status: ApprovalStatus; playerName: string } | null;
  /** Delegaciones de equipo, en todos sus estados (la card distingue). */
  managedTeams: { teamName: string; status: ApprovalStatus }[];
  /** Primera membresía de liga (el mismo criterio que getOrCreateOwnOrg). */
  membership: { orgName: string; role: OrgRole } | null;
  isPlatformAdmin: boolean;
}

/** Datos del hub "Mis vínculos" del perfil (N14a). */
export async function getUserHats(
  user?: AppUser | null,
): Promise<UserHats | null> {
  const current = user ?? (await checkUser());
  if (!current) return null;

  const [favoritesCount, claim, managerships, membership] = await Promise.all([
    db.favorite.count({ where: { userId: current.id } }),
    db.playerClaim.findFirst({
      where: { userId: current.id, status: { in: ["PENDIENTE", "APROBADO"] } },
      select: { status: true, player: { select: { name: true } } },
    }),
    db.teamManager.findMany({
      where: { userId: current.id },
      select: { status: true, team: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
    db.organizationMember.findFirst({
      where: { userId: current.id },
      select: { role: true, organization: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return {
    favoritesCount,
    claim: claim
      ? { status: claim.status, playerName: claim.player.name }
      : null,
    managedTeams: managerships.map((m) => ({
      teamName: m.team.name,
      status: m.status,
    })),
    membership: membership
      ? { orgName: membership.organization.name, role: membership.role }
      : null,
    isPlatformAdmin: current.role === "ADMINISTRADOR",
  };
}
