import { NextResponse } from "next/server";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/db";

/**
 * Autorización del **delegado de equipo** (N13).
 *
 * Un delegado representa a UN equipo: carga su plantel y lo inscribe en
 * torneos. **No es `OrganizationMember`** — los roles de `OrgRole` son personal
 * de la liga y todas las consultas del panel se acotan por organización
 * (`getPanelOrgIds`). Si el delegado fuera miembro, vería todos los equipos y
 * jugadores de la liga entera; colgando del equipo, el aislamiento sale solo.
 *
 * Este archivo es el espejo de `lib/orgAuth.ts`, pero para el otro lado del
 * mostrador: allá se pregunta "¿puede gestionar esta liga?", acá "¿es delegado
 * **aprobado** de este equipo?".
 */

type AppUser = NonNullable<Awaited<ReturnType<typeof checkUser>>>;

/** Equipos que el usuario representa (solicitud APROBADA). */
export async function getManagedTeamIds(user?: AppUser | null): Promise<string[]> {
  const current = user ?? (await checkUser());
  if (!current) return [];

  const rows = await db.teamManager.findMany({
    where: { userId: current.id, status: "APROBADO" },
    select: { teamId: true },
  });
  return rows.map((r) => r.teamId);
}

/**
 * ¿Es delegado aprobado de este equipo?
 *
 * El ADMINISTRADOR de plataforma pasa (gestiona todo), igual que en `orgAuth`.
 * El organizador de la liga **no** pasa por acá: gestiona el equipo por su
 * membresía (`orgAuth`), que es un permiso distinto y más amplio.
 */
export async function canManageTeam(
  user: AppUser,
  teamId: string,
): Promise<boolean> {
  if (user.role === "ADMINISTRADOR") return true;

  const managership = await db.teamManager.findUnique({
    where: { userId_teamId: { userId: user.id, teamId } },
    select: { status: true },
  });
  return managership?.status === "APROBADO";
}

// ============================================================
// Guards para SERVER ACTIONS (devuelven string en error)
// ============================================================

export async function requireActionTeamManager(
  teamId: string,
): Promise<{ user: AppUser; error?: never } | { user?: never; error: string }> {
  const user = await checkUser();
  if (!user) return { error: "Debes iniciar sesión para realizar esta acción" };

  const ok = await canManageTeam(user, teamId);
  if (!ok) return { error: "No representás a este equipo" };

  return { user };
}

// ============================================================
// Guards para API ROUTES (devuelven NextResponse en error)
// ============================================================

export async function requireApiTeamManager(
  teamId: string,
): Promise<
  | { user: AppUser; error?: never }
  | { user?: never; error: NextResponse }
> {
  const user = await checkUser();
  if (!user) {
    return {
      error: NextResponse.json({ error: "No autenticado" }, { status: 401 }),
    };
  }

  const ok = await canManageTeam(user, teamId);
  if (!ok) {
    return {
      error: NextResponse.json(
        { error: "No representás a este equipo" },
        { status: 403 },
      ),
    };
  }

  return { user };
}
