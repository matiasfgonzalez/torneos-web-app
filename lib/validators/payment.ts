import { z } from "zod";
import { nullableString } from "./common";

export const paymentCreateSchema = z.object({
  planCode: z.string().trim().min(1).max(20),
  periodMonths: z.coerce.number().int().min(1).max(12),
  method: z.enum(["TRANSFERENCIA", "EFECTIVO"]), // MERCADOPAGO llega por webhook
  receiptUrl: nullableString(500).optional(),
  receiptPublicId: nullableString(255).optional(),
  notes: nullableString(500).optional(),
});

export const paymentReviewSchema = z.object({
  action: z.enum(["APROBAR", "RECHAZAR"]),
  reviewNotes: nullableString(500).optional(),
});

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
export type PaymentReviewInput = z.infer<typeof paymentReviewSchema>;
