import { z } from "zod";
import { nullableString } from "./common";

export const paymentCreateSchema = z.object({
  planCode: z.string().trim().min(1).max(20),
  periodMonths: z.coerce.number().int().min(1).max(12),
  method: z.enum(["TRANSFERENCIA", "EFECTIVO"]), // MERCADOPAGO llega por webhook
  // Comprobante OBLIGATORIO (N5): el pago es "manual informado con comprobante".
  // Sin el comprobante el admin no puede verificar la transferencia.
  receiptUrl: z
    .string()
    .trim()
    .url("Adjuntá el comprobante de la transferencia")
    .max(500),
  receiptPublicId: nullableString(255).optional(),
  notes: nullableString(500).optional(),
});

export const paymentReviewSchema = z.object({
  action: z.enum(["APROBAR", "RECHAZAR"]),
  reviewNotes: nullableString(500).optional(),
});

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
export type PaymentReviewInput = z.infer<typeof paymentReviewSchema>;
