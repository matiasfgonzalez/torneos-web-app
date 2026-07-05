import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiRole } from "@/lib/apiRoleValidation";
import { apiError } from "@/lib/apiResponse";
import { paymentReviewSchema } from "@/lib/validators/payment";
import { validationErrorResponse } from "@/lib/validators/common";

type tParams = Promise<{ id: string }>;

/**
 * PATCH /api/payments/[id] — aprobar o rechazar un pago (solo ADMINISTRADOR).
 *
 * APROBAR: activa/extiende la suscripción — el período se suma al vencimiento
 * vigente si todavía no pasó, o arranca desde hoy si ya venció.
 */
export async function PATCH(req: NextRequest, { params }: { params: tParams }) {
  const authResult = await validateApiRole(["ADMINISTRADOR"]);
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const { id } = await params;

    const body = await req.json();
    const parsed = paymentReviewSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const payment = await db.payment.findUnique({
      where: { id },
      include: { subscription: true },
    });

    if (!payment) {
      return apiError(404, "Pago no encontrado");
    }
    if (payment.status !== "PENDIENTE") {
      return apiError(400, "El pago ya fue revisado");
    }

    const reviewFields = {
      reviewNotes: parsed.data.reviewNotes ?? null,
      reviewedById: authResult.user!.id,
      reviewedAt: new Date(),
    };

    if (parsed.data.action === "RECHAZAR") {
      const rejected = await db.payment.update({
        where: { id },
        data: { status: "RECHAZADO", ...reviewFields },
      });
      return NextResponse.json(rejected);
    }

    // APROBAR: pago + suscripción en una única transacción
    const approved = await db.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id },
        data: { status: "APROBADO", ...reviewFields },
      });

      const now = new Date();
      const base =
        payment.subscription.currentPeriodEnd &&
        payment.subscription.currentPeriodEnd > now
          ? payment.subscription.currentPeriodEnd
          : now;

      const newEnd = new Date(base);
      newEnd.setMonth(newEnd.getMonth() + payment.periodMonths);

      await tx.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: "ACTIVA",
          currentPeriodEnd: newEnd,
          // El plan pagado pasa a ser el vigente (upgrade/renovación)
          ...(payment.planId ? { planId: payment.planId } : {}),
        },
      });

      return updated;
    });

    return NextResponse.json(approved);
  } catch (error) {
    console.error("Error al revisar pago:", error);
    return apiError(500, "Error al revisar el pago");
  }
}
