import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { validateApiRole } from "@/lib/apiRoleValidation";
import { apiError, apiOk } from "@/lib/apiResponse";
import { getEffectivePlan } from "@/lib/planLimits";

/**
 * GET /api/admin/organizations — listado de organizaciones para el admin de
 * plataforma (N10): plan efectivo, estado de suscripción, último pago y
 * uso actual. Solo ADMINISTRADOR.
 *
 * Paginado server-side (M7): `?q` (nombre/slug/localidad), `?page`, `?limit`.
 * Devuelve `{ data, meta }` (antes: array plano). Importa además porque el
 * `getEffectivePlan` por org es un N+1 — al paginar solo se calcula para la
 * página visible, no para todas las ligas de la plataforma.
 */
export async function GET(req: NextRequest) {
  const { error } = await validateApiRole(["ADMINISTRADOR"]);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    const pageRaw = parseInt(searchParams.get("page") ?? "1", 10);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const limitRaw = parseInt(searchParams.get("limit") ?? "10", 10);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 10;

    const where: Prisma.OrganizationWhereInput = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
            { locality: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};

    const total = await db.organization.count({ where });

    const organizations = await db.organization.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        subscription: {
          include: {
            plan: { select: { code: true, name: true } },
            payments: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                amount: true,
                currency: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            tournaments: { where: { deletedAt: null } },
          },
        },
      },
    });

    const data = await Promise.all(
      organizations.map(async (org) => {
        const effectivePlan = await getEffectivePlan(org.id);
        return {
          id: org.id,
          name: org.name,
          slug: org.slug,
          locality: org.locality,
          status: org.status,
          createdAt: org.createdAt,
          members: org._count.members,
          tournaments: org._count.tournaments,
          effectivePlan: { code: effectivePlan.code, name: effectivePlan.name },
          subscription: org.subscription
            ? {
                status: org.subscription.status,
                currentPeriodEnd: org.subscription.currentPeriodEnd,
                contractedPlan: org.subscription.plan.name,
              }
            : null,
          lastPayment: org.subscription?.payments[0]
            ? {
                amount: org.subscription.payments[0].amount,
                currency: org.subscription.payments[0].currency,
                status: org.subscription.payments[0].status,
                createdAt: org.subscription.payments[0].createdAt,
              }
            : null,
        };
      }),
    );

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return apiOk({
      data,
      meta: { total, page, limit, totalPages },
    });
  } catch (err) {
    console.error("Error al listar organizaciones:", err);
    return apiError(500, "Error al listar organizaciones");
  }
}
