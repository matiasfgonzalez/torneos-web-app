import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { validateApiRole } from "@/lib/apiRoleValidation";
import { apiError, apiOk } from "@/lib/apiResponse";
import { planCreateSchema } from "@/lib/validators/plan";
import { validationErrorResponse } from "@/lib/validators/common";

/**
 * GET /api/admin/plans — todos los planes (activos e inactivos) para la
 * gestión del admin de plataforma. `GET /api/plans` (público) solo devuelve
 * los activos para pricing/checkout.
 */
export async function GET() {
  const { error } = await validateApiRole(["ADMINISTRADOR"]);
  if (error) return error;

  try {
    const plans = await db.plan.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { subscriptions: true } } },
    });
    return apiOk(plans);
  } catch (err) {
    console.error("Error al listar planes:", err);
    return apiError(500, "Error al listar planes");
  }
}

/**
 * POST /api/admin/plans — crear un plan nuevo. Solo ADMINISTRADOR.
 */
export async function POST(req: Request) {
  const { error } = await validateApiRole(["ADMINISTRADOR"]);
  if (error) return error;

  const body = await req.json();
  const parsed = planCreateSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const plan = await db.plan.create({ data: parsed.data });
    return apiOk(plan, 201);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return apiError(409, "Ya existe un plan con ese código");
    }
    console.error("Error al crear plan:", err);
    return apiError(500, "Error al crear el plan");
  }
}
