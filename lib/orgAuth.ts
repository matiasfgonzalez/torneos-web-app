import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OrgRole, Organization } from "@prisma/client";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/db";

/**
 * Autorización por organización (decisiones D5/D6/D9, tarea N1/N2).
 *
 * Roles de organización:
 * - OWNER / ORGANIZADOR: gestión completa (crear/editar/borrar recursos de la org)
 * - COLABORADOR: solo carga de resultados y eventos de partido
 *
 * ADMINISTRADOR (rol de plataforma) pasa todos los checks.
 */

type AppUser = NonNullable<Awaited<ReturnType<typeof checkUser>>>;

const MANAGER_ROLES: OrgRole[] = ["OWNER", "ORGANIZADOR"];
const LOADER_ROLES: OrgRole[] = ["OWNER", "ORGANIZADOR", "COLABORADOR"];

// Slug de organización: vive en lib/slug.ts (N9). Se reexporta con el nombre
// `uniqueSlug` por compatibilidad con los consumidores existentes.
import { uniqueOrganizationSlug } from "@/lib/slug";
export { uniqueOrganizationSlug as uniqueSlug };

/**
 * Acepta las invitaciones PENDIENTES que apunten al email del usuario (N6):
 * crea la membresía con el rol invitado y marca la invitación como ACEPTADA.
 * Devuelve cuántas aceptó. Idempotente (la membresía duplicada se ignora).
 */
export async function acceptPendingInvites(user: AppUser): Promise<number> {
  const invites = await db.organizationInvite.findMany({
    where: { email: user.email.toLowerCase(), status: "PENDIENTE" },
  });
  if (invites.length === 0) return 0;

  let accepted = 0;
  for (const invite of invites) {
    await db.$transaction(async (tx) => {
      const existing = await tx.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: invite.organizationId,
            userId: user.id,
          },
        },
      });
      if (!existing) {
        await tx.organizationMember.create({
          data: {
            organizationId: invite.organizationId,
            userId: user.id,
            role: invite.role,
            invitedById: invite.invitedById,
          },
        });
        accepted += 1;
      }
      await tx.organizationInvite.update({
        where: { id: invite.id },
        data: { status: "ACEPTADA" },
      });
    });
  }
  return accepted;
}

/**
 * Organización "activa" del usuario: su primera membresía.
 * Antes de crear una organización personal se aceptan las invitaciones
 * pendientes a su email (si fue invitado, entra a esa liga en lugar de
 * crear una propia). Si no tiene ninguna, se crea su organización
 * personal (freemium self-service, decisión D7) con él como OWNER.
 */
export async function getOrCreateOwnOrg(user: AppUser): Promise<Organization> {
  const membership = await db.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });
  if (membership) return membership.organization;

  // ¿Fue invitado a una liga existente? Aceptar y usar esa organización.
  const accepted = await acceptPendingInvites(user);
  if (accepted > 0) {
    const invitedMembership = await db.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
      orderBy: { createdAt: "asc" },
    });
    if (invitedMembership) return invitedMembership.organization;
  }

  const slug = await uniqueOrganizationSlug(user.name ?? "mi-liga");
  return db.organization.create({
    data: {
      name: user.name ? `Liga de ${user.name}` : "Mi Liga",
      slug,
      ownerId: user.id,
      members: {
        create: { userId: user.id, role: "OWNER" },
      },
    },
  });
}

/**
 * ¿Es el usuario OWNER de la organización? (gestión de plan, pagos y
 * miembros — tabla de permisos N1). ADMINISTRADOR siempre pasa.
 */
export async function isOrgOwner(
  user: AppUser,
  organizationId: string,
): Promise<boolean> {
  if (user.role === "ADMINISTRADOR") return true;
  const membership = await db.organizationMember.findUnique({
    where: {
      organizationId_userId: { organizationId, userId: user.id },
    },
  });
  return membership?.role === "OWNER";
}

/**
 * ¿Puede el usuario gestionar recursos de esta organización?
 * @param allowCollaborator - true para endpoints de carga de resultados
 */
export async function canManageOrg(
  user: AppUser,
  organizationId: string,
  allowCollaborator = false,
): Promise<boolean> {
  if (user.role === "ADMINISTRADOR") return true;

  const membership = await db.organizationMember.findUnique({
    where: {
      organizationId_userId: { organizationId, userId: user.id },
    },
  });
  if (!membership) return false;

  const allowed = allowCollaborator ? LOADER_ROLES : MANAGER_ROLES;
  return allowed.includes(membership.role);
}

// ============================================================
// Guards para RUTAS API (devuelven NextResponse en error)
// ============================================================

type ApiAuthError = { user?: never; org?: never; error: NextResponse };

const apiUnauthorized = (): ApiAuthError => ({
  error: NextResponse.json(
    { error: "Debes iniciar sesión para acceder a este recurso" },
    { status: 401 },
  ),
});

const apiForbidden = (): ApiAuthError => ({
  error: NextResponse.json(
    { error: "No tienes permisos para realizar esta acción" },
    { status: 403 },
  ),
});

/**
 * Para endpoints de CREACIÓN de recursos raíz (torneo/equipo/jugador/árbitro):
 * devuelve el usuario y su organización (creándola si es su primera vez).
 */
export async function requireApiOrgContext(): Promise<
  { user: AppUser; org: Organization; error?: never } | ApiAuthError
> {
  const user = await checkUser();
  if (!user) return apiUnauthorized();

  const org = await getOrCreateOwnOrg(user);
  if (org.status === "SUSPENDIDA" && user.role !== "ADMINISTRADOR") {
    return apiForbidden();
  }
  return { user, org };
}

/**
 * Para endpoints que MUTAN un recurso existente: valida que el usuario
 * pueda gestionar la organización dueña del recurso.
 */
export async function requireApiOrgAccess(
  organizationId: string,
  opts: { allowCollaborator?: boolean } = {},
): Promise<{ user: AppUser; error?: never } | ApiAuthError> {
  const user = await checkUser();
  if (!user) return apiUnauthorized();

  const ok = await canManageOrg(
    user,
    organizationId,
    opts.allowCollaborator ?? false,
  );
  if (!ok) return apiForbidden();

  return { user };
}

// ============================================================
// Guards para SERVER ACTIONS (devuelven string en error)
// ============================================================

export async function requireActionOrgAccess(
  organizationId: string,
  opts: { allowCollaborator?: boolean } = {},
): Promise<{ user: AppUser; error?: never } | { user?: never; error: string }> {
  const user = await checkUser();
  if (!user) return { error: "Debes iniciar sesión para realizar esta acción" };

  const ok = await canManageOrg(
    user,
    organizationId,
    opts.allowCollaborator ?? false,
  );
  if (!ok) return { error: "No tienes permisos para realizar esta acción" };

  return { user };
}

export async function requireActionOrgContext(): Promise<
  | { user: AppUser; org: Organization; error?: never }
  | { user?: never; org?: never; error: string }
> {
  const user = await checkUser();
  if (!user) return { error: "Debes iniciar sesión para realizar esta acción" };

  const org = await getOrCreateOwnOrg(user);
  if (org.status === "SUSPENDIDA" && user.role !== "ADMINISTRADOR") {
    return { error: "La organización está suspendida" };
  }
  return { user, org };
}

// ============================================================
// Visibilidad de datos en el panel (N3)
// ============================================================

/**
 * Cookie que activa el modo "ver como organización" del ADMINISTRADOR:
 * scopea los LISTADOS del panel a esa organización sin tocar permisos
 * de mutación (el admin sigue pudiendo gestionar todo).
 */
export const ADMIN_ORG_VIEW_COOKIE = "golazo-admin-org-view";

/**
 * Organizaciones cuyos datos VE el usuario en los listados del panel (N3):
 * - `null` → sin restricción (ADMINISTRADOR sin "ver como" activo)
 * - ADMINISTRADOR con "ver como" activo → solo la organización elegida
 * - miembro → sus organizaciones
 * - sin sesión / sin membresías → `[]` (no ve ningún dato de gestión)
 */
export async function getPanelOrgIds(
  user?: AppUser | null,
): Promise<string[] | null> {
  const current = user ?? (await checkUser());
  if (!current) return [];

  if (current.role === "ADMINISTRADOR") {
    const store = await cookies();
    const viewOrgId = store.get(ADMIN_ORG_VIEW_COOKIE)?.value;
    return viewOrgId ? [viewOrgId] : null;
  }

  const memberships = await db.organizationMember.findMany({
    where: { userId: current.id },
    select: { organizationId: true },
    orderBy: { createdAt: "asc" },
  });
  return memberships.map((m) => m.organizationId);
}

/** Fragmento de `where` de Prisma para scopear listados del panel. */
export function orgScopeWhere(orgIds: string[] | null) {
  return orgIds === null ? {} : { organizationId: { in: orgIds } };
}

/** ¿El recurso (por su organizationId) es visible en el panel del usuario? */
export function canViewInPanel(
  orgIds: string[] | null,
  organizationId: string,
): boolean {
  return orgIds === null || orgIds.includes(organizationId);
}

/**
 * Organización del modo "ver como" activo (para el banner del panel).
 * Devuelve null si no hay cookie o el usuario no es ADMINISTRADOR;
 * `{ orgId, org: null }` si la cookie apunta a una org que ya no existe.
 */
export async function getAdminOrgView(
  user: AppUser,
): Promise<{ orgId: string; org: Organization | null } | null> {
  if (user.role !== "ADMINISTRADOR") return null;
  const store = await cookies();
  const orgId = store.get(ADMIN_ORG_VIEW_COOKIE)?.value;
  if (!orgId) return null;
  const org = await db.organization.findUnique({ where: { id: orgId } });
  return { orgId, org };
}

// ============================================================
// Resolución de organización de recursos anidados
// ============================================================

/** Organización dueña de un partido (vía torneo) */
export async function getMatchOrgId(matchId: string): Promise<string | null> {
  const match = await db.match.findUnique({
    where: { id: matchId },
    select: { tournament: { select: { organizationId: true } } },
  });
  return match?.tournament.organizationId ?? null;
}

/** Organización dueña de un torneo */
export async function getTournamentOrgId(
  tournamentId: string,
): Promise<string | null> {
  const tournament = await db.tournament.findUnique({
    where: { id: tournamentId },
    select: { organizationId: true },
  });
  return tournament?.organizationId ?? null;
}
