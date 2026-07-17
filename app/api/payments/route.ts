import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { getOrCreateOwnOrg } from "@/lib/orgAuth";
import { getOrCreateSubscription } from "@/lib/planLimits";
import { apiError } from "@/lib/apiResponse";
import { paymentCreateSchema } from "@/lib/validators/payment";
import { validationErrorResponse } from "@/lib/validators/common";
import { getPlatformAdminIds, notify } from "@/lib/notifications";

/**
 * POST /api/payments — informar un pago manual (D8).
 * Solo el OWNER de la organización (o admin). Crea Payment PENDIENTE;
 * el admin lo aprueba/rechaza en /admin/pagos.
 */
export async function POST(req: Request) {
  try {
    const user = await checkUser();
    if (!user) {
      return apiError(401, "Debes iniciar sesión");
    }

    const org = await getOrCreateOwnOrg(user);

    // Pagos: solo OWNER de la org (o ADMINISTRADOR)
    if (user.role !== "ADMINISTRADOR") {
      const membership = await db.organizationMember.findUnique({
        where: {
          organizationId_userId: { organizationId: org.id, userId: user.id },
        },
      });
      if (membership?.role !== "OWNER") {
        return apiError(403, "Solo el dueño de la organización gestiona pagos");
      }
    }

    const body = await req.json();
    const parsed = paymentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const plan = await db.plan.findUnique({
      where: { code: parsed.data.planCode },
    });
    if (!plan || !plan.isActive) {
      return apiError(404, "Plan no encontrado");
    }
    if (plan.priceMonthly.equals(new Prisma.Decimal(0))) {
      return apiError(400, "El plan gratuito no requiere pago");
    }

    const subscription = await getOrCreateSubscription(org.id);

    // El monto lo calcula el server (nunca el cliente)
    const amount = plan.priceMonthly.mul(parsed.data.periodMonths);

    const payment = await db.payment.create({
      data: {
        subscriptionId: subscription.id,
        planId: plan.id,
        amount,
        currency: plan.currency,
        periodMonths: parsed.data.periodMonths,
        method: parsed.data.method,
        receiptUrl: parsed.data.receiptUrl ?? null,
        receiptPublicId: parsed.data.receiptPublicId ?? null,
        notes: parsed.data.notes ?? null,
      },
    });

    // Pendiente de N5: el pago quedaba PENDIENTE esperando que el admin se
    // asomara a /admin/pagos. Mientras tanto la liga espera su plan.
    await notify(
      await getPlatformAdminIds(),
      {
        type: "PAGO_INFORMADO",
        orgName: org.name,
        planName: plan.name,
        amount: `${plan.currency} ${amount.toFixed(2)}`,
      },
      { exclude: user.id },
    );

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error al informar pago:", error);
    return apiError(500, "Error al informar el pago");
  }
}

/**
 * GET /api/payments — admin: todos (filtro ?status=); organizador: los de su org.
 */
export async function GET(req: Request) {
  try {
    const user = await checkUser();
    if (!user) {
      return apiError(401, "Debes iniciar sesión");
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: Prisma.PaymentWhereInput = {};
    if (status && ["PENDIENTE", "APROBADO", "RECHAZADO"].includes(status)) {
      where.status = status as "PENDIENTE" | "APROBADO" | "RECHAZADO";
    }

    if (user.role !== "ADMINISTRADOR") {
      const org = await getOrCreateOwnOrg(user);
      where.subscription = { organizationId: org.id };
    }

    const payments = await db.payment.findMany({
      where,
      include: {
        subscription: {
          include: {
            organization: { select: { id: true, name: true, slug: true } },
            plan: { select: { code: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    return apiError(500, "Error al obtener los pagos");
  }
}
