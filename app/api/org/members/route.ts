import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { getOrCreateOwnOrg, isOrgOwner } from "@/lib/orgAuth";
import { assertPlanLimit } from "@/lib/planLimits";
import { apiError } from "@/lib/apiResponse";
import { inviteMemberSchema } from "@/lib/validators/organization";
import { validationErrorResponse } from "@/lib/validators/common";

/**
 * GET /api/org/members — miembros e invitaciones pendientes de la
 * organización del usuario. Cualquier miembro puede ver la lista;
 * solo el OWNER (o admin) muta.
 */
export async function GET() {
  try {
    const user = await checkUser();
    if (!user) {
      return apiError(401, "Debes iniciar sesión");
    }

    const org = await getOrCreateOwnOrg(user);

    const [members, invites] = await Promise.all([
      db.organizationMember.findMany({
        where: { organizationId: org.id },
        include: {
          user: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      db.organizationInvite.findMany({
        where: { organizationId: org.id, status: "PENDIENTE" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      organization: { id: org.id, name: org.name },
      canManage: await isOrgOwner(user, org.id),
      members: members.map((m) => ({
        id: m.id,
        role: m.role,
        createdAt: m.createdAt,
        user: m.user,
      })),
      invites: invites.map((i) => ({
        id: i.id,
        email: i.email,
        role: i.role,
        createdAt: i.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error al obtener miembros:", error);
    return apiError(500, "Error al obtener los miembros");
  }
}

/**
 * POST /api/org/members — invitar a alguien por email (solo OWNER o admin).
 *
 * - Email con cuenta existente → membresía inmediata.
 * - Email sin cuenta → invitación PENDIENTE que se acepta sola cuando esa
 *   persona se registra e ingresa al panel (acceptPendingInvites).
 * - Enforcea maxMembers del plan (402 = upsell), contando pendientes.
 */
export async function POST(req: Request) {
  try {
    const user = await checkUser();
    if (!user) {
      return apiError(401, "Debes iniciar sesión");
    }

    const org = await getOrCreateOwnOrg(user);

    if (!(await isOrgOwner(user, org.id))) {
      return apiError(403, "Solo el dueño de la liga puede invitar miembros");
    }

    const body = await req.json();
    const parsed = inviteMemberSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }
    const { email, role } = parsed.data;

    if (email === user.email.toLowerCase()) {
      return apiError(400, "No podés invitarte a vos mismo");
    }

    const check = await assertPlanLimit(org.id, "addMember");
    if (!check.ok) {
      return apiError(402, check.error);
    }

    const invitedUser = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, imageUrl: true, email: true },
    });

    if (invitedUser) {
      const existing = await db.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: org.id,
            userId: invitedUser.id,
          },
        },
      });
      if (existing) {
        return apiError(409, "Esa persona ya es miembro de tu liga");
      }

      const member = await db.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: invitedUser.id,
          role,
          invitedById: user.id,
        },
      });

      return NextResponse.json(
        {
          type: "member",
          member: {
            id: member.id,
            role: member.role,
            createdAt: member.createdAt,
            user: invitedUser,
          },
        },
        { status: 201 },
      );
    }

    // Sin cuenta todavía → invitación pendiente (se reactiva si estaba cancelada)
    const existingInvite = await db.organizationInvite.findUnique({
      where: {
        organizationId_email: { organizationId: org.id, email },
      },
    });
    if (existingInvite?.status === "PENDIENTE") {
      return apiError(409, "Ya hay una invitación pendiente para ese email");
    }

    const invite = existingInvite
      ? await db.organizationInvite.update({
          where: { id: existingInvite.id },
          data: { status: "PENDIENTE", role, invitedById: user.id },
        })
      : await db.organizationInvite.create({
          data: {
            organizationId: org.id,
            email,
            role,
            invitedById: user.id,
          },
        });

    return NextResponse.json(
      {
        type: "invite",
        invite: {
          id: invite.id,
          email: invite.email,
          role: invite.role,
          createdAt: invite.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error al invitar miembro:", error);
    return apiError(500, "Error al invitar al miembro");
  }
}
