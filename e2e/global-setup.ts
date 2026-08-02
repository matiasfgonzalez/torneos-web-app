import { clerkSetup } from "@clerk/testing/playwright";

/**
 * Prepara el *testing token* de Clerk una sola vez por corrida.
 *
 * Sin él, Clerk aplica su protección anti-bot al login automatizado y la sesión
 * nunca se abre. `clerkSetup()` lo pide con `CLERK_SECRET_KEY` y lo deja en el
 * entorno para que `setupClerkTestingToken()` lo use en cada test.
 *
 * **No es obligatorio para toda la suite.** Los tests públicos (`publico.spec.ts`)
 * no necesitan sesión, así que si las claves no están —o Clerk rechaza el
 * pedido— no se corta la corrida: se avisa y los tests con sesión se saltean
 * solos (ver `e2e/sesion.ts`).
 */
export default async function globalSetup(): Promise<void> {
  if (
    !process.env.CLERK_SECRET_KEY ||
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ) {
    return;
  }

  try {
    await clerkSetup();
  } catch (error) {
    const motivo = error instanceof Error ? error.message : String(error);
    console.warn(
      `[e2e] No se pudo inicializar el testing token de Clerk: ${motivo}\n` +
        "      Los tests con sesión se van a saltear; los públicos corren igual.",
    );
  }
}
