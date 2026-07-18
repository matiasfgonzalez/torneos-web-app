import { describe, expect, it } from "vitest";
import { paymentCreateSchema } from "@/lib/validators/payment";

/**
 * N5: el pago manual exige comprobante. Estos tests fijan esa regla (antes el
 * comprobante era opcional y un pago sin él llegaba a revisión sin nada que
 * verificar).
 */
describe("paymentCreateSchema — comprobante obligatorio (N5)", () => {
  const base = {
    planCode: "PRO",
    periodMonths: 1,
    method: "TRANSFERENCIA" as const,
    receiptUrl: "https://res.cloudinary.com/demo/image/upload/comprobante.jpg",
  };

  it("acepta un pago con comprobante válido", () => {
    expect(paymentCreateSchema.safeParse(base).success).toBe(true);
  });

  it("rechaza un pago sin comprobante", () => {
    const { receiptUrl, ...withoutReceipt } = base;
    void receiptUrl;
    expect(paymentCreateSchema.safeParse(withoutReceipt).success).toBe(false);
  });

  it("rechaza un comprobante que no es una URL", () => {
    expect(
      paymentCreateSchema.safeParse({ ...base, receiptUrl: "no-es-url" })
        .success,
    ).toBe(false);
  });

  it("rechaza períodos fuera de rango", () => {
    expect(
      paymentCreateSchema.safeParse({ ...base, periodMonths: 0 }).success,
    ).toBe(false);
    expect(
      paymentCreateSchema.safeParse({ ...base, periodMonths: 24 }).success,
    ).toBe(false);
  });

  it("rechaza método MERCADOPAGO (llega por webhook, no por este endpoint)", () => {
    expect(
      paymentCreateSchema.safeParse({ ...base, method: "MERCADOPAGO" }).success,
    ).toBe(false);
  });
});
