import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright — tests end-to-end (A8).
 *
 * Es la última capa que faltaba de la pirámide del repo:
 *
 *   `npm test`              → 487 tests de lógica pura, sin infra (~3s)
 *   `npm run test:integration` → queries reales contra una Postgres descartable
 *   `npm run test:e2e`      → el navegador contra la app corriendo de verdad
 *
 * Lo que solo se puede verificar acá: que el middleware redirija a sign-in, que
 * un formulario de React Hook Form + Zod llegue a la base, que el resultado de
 * un partido aparezca en la tabla de posiciones renderizada. Nada de eso lo ve
 * `tsc` ni un test de unidad.
 */

// La app lee su configuración de `.env` (base, Clerk, Cloudinary). En CI las
// variables vienen del entorno y el archivo no existe: no es un error.
try {
  process.loadEnvFile();
} catch {
  // Sin `.env`: se usan las variables ya presentes en el entorno.
}

const PORT = Number(process.env.E2E_PORT ?? 3000);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",

  // Un solo worker a propósito: los tests de admin escriben en la base y
  // comparten el estado del torneo que crean. Paralelizarlos sería pelearse
  // entre ellos por los mismos datos.
  fullyParallel: false,
  workers: 1,

  forbidOnly: !!process.env.CI,
  // Un reintento en CI cubre el arranque en frío de Next (la primera visita a
  // una ruta la compila). En local no: un test que falla tiene que doler.
  retries: process.env.CI ? 1 : 0,

  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"]],

  // 2 minutos, no 30 segundos: en modo dev Next compila cada ruta la primera
  // vez que se la visita, y en un disco lento eso solo puede tardar más de un
  // minuto (`/terminos` tardó 1,3 min en la primera corrida). No es la app
  // siendo lenta — es el compilador —, así que apretar este número solo
  // produciría fallos falsos. En CI se corre sobre el build de producción y
  // ninguna ruta se acerca a este techo.
  timeout: 120_000,
  expect: { timeout: 10_000 },

  globalSetup: "./e2e/global-setup.ts",

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Locale y zona horaria reales del producto: las fechas date-only se
    // interpretan en hora local (ver lib/validators/tournament.ts), así que
    // correr en UTC escondería justamente el bug que esa regla evita.
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
  },

  projects: [
    {
      name: "escritorio",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // Solo la superficie pública en móvil: es donde la mira el hincha.
      // 375px a propósito —el ancho del iPhone SE/12 mini, el más angosto que
      // sigue siendo común—: es donde aparece el desborde horizontal. Un Pixel
      // de 412px lo dejaría pasar.
      name: "movil",
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 375, height: 812 },
      },
      testMatch: /publico\.spec\.ts/,
    },
  ],

  // Con `E2E_BASE_URL` apuntando a un servidor ya levantado (o a un preview de
  // Vercel) Playwright no arranca nada: prueba contra eso.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        // En CI se prueba el **build de producción**: es lo que se despliega, y
        // además evita el compilado por ruta del modo dev, que es lo único que
        // hace lentos a estos tests. En local se usa `next dev` para no esperar
        // un build entero en cada iteración.
        command: process.env.CI
          ? `npm run build && npm run start -- --port ${PORT}`
          : `npm run dev -- --port ${PORT}`,
        url: BASE_URL,
        // En local se reutiliza el `npm run dev` que ya esté abierto; en CI
        // siempre se levanta uno limpio.
        reuseExistingServer: !process.env.CI,
        // El build de producción de este proyecto tarda varios minutos.
        timeout: 600_000,
        stdout: "pipe",
        stderr: "pipe",
      },
});
