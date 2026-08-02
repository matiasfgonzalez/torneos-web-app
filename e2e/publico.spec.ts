import { expect, test, type Page } from "@playwright/test";

/**
 * Superficie pública: lo que ve el hincha sin cuenta.
 *
 * No necesita credenciales de ningún tipo, así que corre en cualquier máquina y
 * en cualquier CI. Cubre lo que ningún test de unidad puede ver: que la página
 * realmente **renderice** (un Server Component que revienta compila igual), que
 * no se desborde en un teléfono, y que el middleware efectivamente cierre el
 * panel a los anónimos.
 */

const RUTAS_PUBLICAS = [
  "/",
  "/torneos",
  "/partidos",
  "/equipos",
  "/jugadores",
  "/noticias",
  "/ligas",
  "/terminos",
  "/privacidad",
];

/** Captura las excepciones de cliente que Next se traga sin romper el render. */
function capturarErrores(page: Page): string[] {
  const errores: string[] = [];
  page.on("pageerror", (error) => errores.push(error.message));
  return errores;
}

test.describe("páginas públicas", () => {
  for (const ruta of RUTAS_PUBLICAS) {
    test(`${ruta} renderiza sin errores de cliente`, async ({ page }) => {
      const errores = capturarErrores(page);

      const response = await page.goto(ruta);
      expect(response?.status(), `status de ${ruta}`).toBe(200);

      // Un h1 visible es la prueba mínima de que el árbol de servidor llegó
      // hasta el final: si un Server Component tira, Next devuelve el error
      // boundary y este encabezado no está.
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

      expect(errores, `errores de cliente en ${ruta}`).toEqual([]);
    });
  }

  test("ninguna página pública se desborda a lo ancho", async ({ page }) => {
    for (const ruta of RUTAS_PUBLICAS) {
      await page.goto(ruta);
      const desborde = await page.evaluate(() => {
        const doc = document.documentElement;
        // 1px de tolerancia: el redondeo subpíxel de layout no es un desborde.
        return doc.scrollWidth - doc.clientWidth > 1;
      });
      expect(desborde, `${ruta} tiene scroll horizontal`).toBe(false);
    }
  });
});

test.describe("detalle de torneo", () => {
  test("muestra la tabla de posiciones del primer torneo publicado", async ({
    page,
    request,
  }) => {
    const response = await request.get("/api/tournaments");
    expect(response.status()).toBe(200);

    const torneos = (await response.json()) as { id: string; name: string }[];
    test.skip(torneos.length === 0, "La base no tiene torneos publicados.");

    await page.goto(`/torneos/${torneos[0].id}`);
    await expect(
      page.getByRole("heading", { level: 1 }).first(),
    ).toBeVisible();

    // La pestaña de posiciones es el corazón del producto: si desaparece, el
    // torneo dejó de tener tabla.
    await expect(page.getByText("Posiciones").first()).toBeVisible();
  });
});

test.describe("control de acceso desde el navegador", () => {
  const RUTAS_PROTEGIDAS = [
    "/admin/dashboard",
    "/admin/torneos",
    "/mi-equipo",
    "/notificaciones",
  ];

  for (const ruta of RUTAS_PROTEGIDAS) {
    test(`${ruta} manda a sign-in sin sesión`, async ({ page }) => {
      await page.goto(ruta);
      // El middleware (`proxy.ts`) redirige con `auth.protect()`. Es la única
      // forma de comprobar la redirección real, con cookies y todo.
      await expect(page).toHaveURL(/sign-in/);
    });
  }

  test("una mutación de API sin sesión responde 401", async ({ request }) => {
    // Defensa en profundidad del middleware: aunque el handler se olvidara de
    // validar, la escritura no pasa.
    const response = await request.post("/api/tournaments", {
      data: { name: "Torneo de un anónimo", locality: "X", format: "LIGA" },
      failOnStatusCode: false,
    });
    expect(response.status()).toBe(401);
  });

  test("los GET públicos siguen abiertos", async ({ request }) => {
    const response = await request.get("/api/tournaments");
    expect(response.status()).toBe(200);
  });
});
