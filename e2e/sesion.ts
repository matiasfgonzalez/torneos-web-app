import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import { expect, type Page } from "@playwright/test";

/**
 * Sesión real de Clerk para los tests que necesitan estar logueados.
 *
 * **Por qué hace falta una cuenta de verdad:** la app no tiene un modo "sin
 * auth". El middleware (`proxy.ts`) protege `/admin` y toda mutación de API, y
 * el rol se resuelve contra la base a partir del usuario de Clerk. Falsear la
 * sesión sería testear otra app.
 */

/** Credenciales de la cuenta de pruebas. Nunca se hardcodean. */
export const CUENTA_E2E = {
  email: process.env.E2E_CLERK_USER_EMAIL,
  password: process.env.E2E_CLERK_USER_PASSWORD,
};

/**
 * ¿Están las credenciales para correr los flujos con sesión?
 *
 * Misma regla que los tests de integración (#29): **saltear en silencio está
 * bien en una máquina cualquiera; en CI es lo peor que puede pasar** —un
 * pipeline verde que no probó nada—. Por eso en CI la ausencia de credenciales
 * es un error, no un motivo para saltear.
 */
export function hayCuentaE2E(): boolean {
  const completa = !!CUENTA_E2E.email && !!CUENTA_E2E.password;

  if (!completa && process.env.CI && process.env.E2E_REQUIRE_AUTH === "1") {
    throw new Error(
      "Faltan E2E_CLERK_USER_EMAIL / E2E_CLERK_USER_PASSWORD.\n" +
        "Con E2E_REQUIRE_AUTH=1 los flujos con sesión NO se saltean: sin cuenta " +
        "no hay nada verificado del panel.",
    );
  }

  return completa;
}

/**
 * Abre sesión con la cuenta de pruebas y deja a `page` dentro del panel.
 *
 * El orden importa: primero el testing token (desactiva el bot detection de
 * Clerk para este navegador), después una carga de la app —Clerk necesita estar
 * montado para que `clerk.signIn` tenga con qué hablar—, y recién ahí el login.
 */
export async function iniciarSesion(page: Page): Promise<void> {
  await setupClerkTestingToken({ page });

  // Una ruta pública y liviana: solo se necesita que el ClerkProvider cargue.
  await page.goto("/");
  await clerk.loaded({ page });

  await clerk.signIn({
    page,
    signInParams: {
      strategy: "password",
      identifier: CUENTA_E2E.email!,
      password: CUENTA_E2E.password!,
    },
  });

  await page.goto("/admin/dashboard");
  // Si la sesión no quedó abierta, el middleware redirige a /sign-in: esta
  // aserción convierte ese caso en un error claro en vez de un fallo raro tres
  // pasos más adelante.
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

/** Nombre único por corrida, para no chocar con datos previos ni entre tests. */
export function nombreUnico(prefijo: string): string {
  const marca = new Date().toISOString().replace(/[:.]/g, "-");
  return `${prefijo} E2E ${marca}`;
}
