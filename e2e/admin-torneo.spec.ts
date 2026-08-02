import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { hayCuentaE2E, iniciarSesion, nombreUnico } from "./sesion";

/**
 * El flujo que pide A8: **crear torneo → inscribir equipos → cargar resultado →
 * verificar la tabla de posiciones**, con sesión real y base real.
 *
 * Es lo único del repo que ejercita la cadena entera: formulario de React Hook
 * Form → validador Zod del server → Prisma → `applyMatchResult` → la tabla
 * renderizada. Los tests de unidad conocen cada eslabón por separado; ninguno
 * sabe si están unidos.
 *
 * **Requisitos** (sin ellos el bloque se saltea, ver `e2e/sesion.ts`):
 *   E2E_CLERK_USER_EMAIL / E2E_CLERK_USER_PASSWORD  → cuenta de pruebas en Clerk
 *   La cuenta tiene que ser OWNER de una organización (o ADMINISTRADOR de la
 *   plataforma): crear torneos consume cupo del plan y el server exige ese rol.
 *
 * **Escribe en la base de la app bajo prueba.** El torneo, sus inscripciones y
 * su partido se borran al final (el DELETE del torneo cascadea). Los dos equipos
 * quedan: `Team` no tiene endpoint DELETE (ver TODO.md, hallazgo #31). Por eso
 * conviene correr esto contra la Postgres descartable, no contra la de
 * desarrollo — está explicado en el README.
 */

test.describe.configure({ mode: "serial" });

test.describe("flujo del organizador", () => {
  test.skip(
    !hayCuentaE2E(),
    "Sin E2E_CLERK_USER_EMAIL / E2E_CLERK_USER_PASSWORD no hay sesión que probar.",
  );

  const NOMBRE_TORNEO = nombreUnico("Copa");
  const NOMBRE_LOCAL = nombreUnico("Local");
  const NOMBRE_VISITA = nombreUnico("Visita");

  let page: Page;
  let api: APIRequestContext;

  const creado = {
    tournamentId: "",
    localId: "",
    visitaId: "",
    inscripcionLocalId: "",
    inscripcionVisitaId: "",
    matchId: "",
  };

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await iniciarSesion(page);
    // `page.request` comparte las cookies del navegador: los pedidos van
    // autenticados con la misma sesión, sin inventar tokens.
    api = page.request;
  });

  test.afterAll(async () => {
    if (creado.tournamentId) {
      // Cascadea a inscripciones y partidos (ver prisma/schema.prisma).
      await api.delete(`/api/tournaments/${creado.tournamentId}`, {
        failOnStatusCode: false,
      });
    }
    await page.close();
  });

  test("crea un torneo desde el panel", async () => {
    await page.goto("/admin/torneos");

    await page.getByRole("button", { name: "Crear torneo" }).click();

    // El resto de los campos ya vienen con default (categoría, género, formato,
    // puntaje 3-1-0): el alta mínima real son estos tres.
    await page.getByLabel("Nombre del torneo").fill(NOMBRE_TORNEO);
    await page.getByLabel("Localidad").fill("Rosario");
    await page.getByLabel("Fecha de inicio").fill("2026-03-01");

    await page
      .getByRole("button", { name: "Crear torneo", exact: true })
      .last()
      .click();

    // El listado se refresca solo (`router.refresh()`), sin recargar la página.
    await expect(page.getByText(NOMBRE_TORNEO).first()).toBeVisible();
  });

  test("el torneo quedó guardado con la fecha correcta", async () => {
    const response = await api.get("/api/tournaments");
    expect(response.status()).toBe(200);

    const torneos = (await response.json()) as {
      id: string;
      name: string;
      startDate: string;
    }[];
    const torneo = torneos.find((t) => t.name === NOMBRE_TORNEO);
    expect(torneo, "el torneo creado no aparece en la API").toBeTruthy();

    creado.tournamentId = torneo!.id;

    // El 1 de marzo tiene que seguir siendo el 1 de marzo: la regla de fechas
    // date-only en hora local (lib/validators/tournament.ts) es exactamente lo
    // que un test de unidad no puede comprobar de punta a punta.
    expect(new Date(torneo!.startDate).getDate()).toBe(1);
    expect(new Date(torneo!.startDate).getMonth()).toBe(2);
  });

  test("inscribe dos equipos en el torneo", async () => {
    // Los equipos en sí son andamio, no lo que se está probando: se crean por
    // API para que el test se concentre en la inscripción, que es el paso del
    // flujo que pide A8.
    for (const [nombre, clave] of [
      [NOMBRE_LOCAL, "localId"],
      [NOMBRE_VISITA, "visitaId"],
    ] as const) {
      const response = await api.post("/api/teams", {
        data: { name: nombre, yearFounded: 2020 },
      });
      expect(response.status(), `alta del equipo ${nombre}`).toBeLessThan(300);
      creado[clave] = ((await response.json()) as { id: string }).id;
    }

    await page.goto(`/admin/torneos/${creado.tournamentId}`);

    for (const nombre of [NOMBRE_LOCAL, NOMBRE_VISITA]) {
      await page.getByRole("button", { name: "Inscribir equipo" }).first().click();

      // El selector de equipo es un combobox: se abre, se escribe y se elige.
      await page.getByLabel("Equipo").click();
      await page.getByPlaceholder(/Busc/i).fill(nombre);
      await page.getByRole("option", { name: new RegExp(nombre) }).click();

      await page
        .getByRole("button", { name: "Inscribir equipo", exact: true })
        .last()
        .click();

      await expect(page.getByText("Equipo inscripto")).toBeVisible();
    }

    await expect(page.getByText(NOMBRE_LOCAL).first()).toBeVisible();
    await expect(page.getByText(NOMBRE_VISITA).first()).toBeVisible();
  });

  test("programa un partido entre los dos equipos", async () => {
    // Andamio otra vez: el fixture tiene su propia batería de tests de unidad
    // (tests/fixture/*). Acá solo hace falta un partido para cargar.
    const inscripciones = await api.get(
      `/api/tournaments/${creado.tournamentId}`,
    );
    expect(inscripciones.status()).toBe(200);

    const torneo = (await inscripciones.json()) as {
      tournamentTeams: { id: string; team: { name: string } }[];
    };
    const local = torneo.tournamentTeams.find(
      (tt) => tt.team.name === NOMBRE_LOCAL,
    );
    const visita = torneo.tournamentTeams.find(
      (tt) => tt.team.name === NOMBRE_VISITA,
    );
    expect(local && visita, "las inscripciones no llegaron a la base").toBeTruthy();

    creado.inscripcionLocalId = local!.id;
    creado.inscripcionVisitaId = visita!.id;

    const response = await api.post("/api/matches", {
      data: {
        dateTime: "2026-03-08T20:00:00.000Z",
        tournamentId: creado.tournamentId,
        // `homeTeamId`/`awayTeamId` apuntan a TournamentTeam, no a Team.
        homeTeamId: creado.inscripcionLocalId,
        awayTeamId: creado.inscripcionVisitaId,
      },
    });
    expect(response.status()).toBeLessThan(300);
    creado.matchId = ((await response.json()) as { id: string }).id;
  });

  test("carga el resultado 2-1 desde la pantalla de carga rápida", async () => {
    await page.goto(`/admin/partidos/${creado.matchId}/cargar`);

    // Los botones de gol tienen aria-label con el nombre del equipo: se puede
    // apuntar a ellos sin depender de la maquetación.
    const sumarLocal = page.getByRole("button", {
      name: `Sumar gol a ${NOMBRE_LOCAL}`,
    });
    const sumarVisita = page.getByRole("button", {
      name: `Sumar gol a ${NOMBRE_VISITA}`,
    });

    await sumarLocal.click();
    await sumarLocal.click();
    await sumarVisita.click();

    // Sin FINALIZADO el partido no suma puntos: es la transición que dispara
    // `applyMatchResult`.
    await page.getByRole("combobox", { name: /Estado/i }).click();
    await page.getByRole("option", { name: "Finalizado" }).click();

    await page.getByRole("button", { name: /Guardar resultado/ }).click();
    await expect(page.getByText(/[Gg]uardad/)).toBeVisible();
  });

  test("la tabla de posiciones refleja el resultado", async () => {
    await page.goto(`/admin/torneos/${creado.tournamentId}`);

    const tabla = page.getByText("Tabla de Posiciones").first();
    await expect(tabla).toBeVisible();

    // El ganador con el puntaje por defecto (3-1-0): 3 puntos, +1 de diferencia.
    const filaLocal = page.getByRole("row", {
      name: new RegExp(NOMBRE_LOCAL),
    });
    await expect(filaLocal).toContainText("3");

    const filaVisita = page.getByRole("row", {
      name: new RegExp(NOMBRE_VISITA),
    });
    await expect(filaVisita).toBeVisible();
  });
});
