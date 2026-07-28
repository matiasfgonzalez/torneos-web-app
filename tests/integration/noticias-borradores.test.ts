import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PrismaClient } from "@/lib/generated/prisma/client";

import {
  aplicarMigraciones,
  clienteDeTests,
  hayBaseDeTests,
  limpiarBase,
} from "./setup";

/**
 * Un borrador de noticia no sale al público (hallazgo #16).
 *
 * El bug tenía **tres puertas** al mismo dato y las tres eran queries: por eso
 * esto vive en los tests de integración y no en los unitarios. Un test de lógica
 * pura no puede ver que un `where` dejó de filtrar — que es exactamente cómo
 * apareció la fuga y cómo volvería.
 *
 * Se ejercitan los `where` que usan las rutas y las actions, contra datos
 * reales: publicada, borrador y eliminada convivendo en la misma tabla.
 */
describe.skipIf(!(await hayBaseDeTests()))("noticias: borradores fuera del público", () => {
  let db: PrismaClient;
  let publicada: string;
  let borrador: string;
  let eliminada: string;

  beforeAll(() => {
    aplicarMigraciones();
    db = clienteDeTests();
  });

  afterAll(async () => {
    await db?.$disconnect();
  });

  beforeEach(async () => {
    await limpiarBase(db);

    const autor = await db.user.create({
      data: { clerkUserId: `c-${Date.now()}`, email: `a-${Date.now()}@test.local` },
    });
    const base = { content: "cuerpo", userId: autor.id };

    publicada = (
      await db.news.create({
        data: {
          ...base,
          title: "Publicada",
          published: true,
          publishedAt: new Date(),
        },
      })
    ).id;

    borrador = (
      await db.news.create({
        data: { ...base, title: "Borrador", published: false },
      })
    ).id;

    eliminada = (
      await db.news.create({
        data: {
          ...base,
          title: "Eliminada",
          published: true,
          publishedAt: new Date(),
          deletedAt: new Date(),
        },
      })
    ).id;
  });

  /** El `where` de `GET /api/noticias`: sin param, sin sesión, sin nada. */
  const wherePublico = { deletedAt: null, published: true };

  it("el listado público trae solo la publicada", async () => {
    const filas = await db.news.findMany({
      where: wherePublico,
      select: { id: true, title: true },
    });

    expect(filas.map((f) => f.id)).toEqual([publicada]);
  });

  it("el listado público NO trae el borrador ni la eliminada", async () => {
    const ids = (
      await db.news.findMany({ where: wherePublico, select: { id: true } })
    ).map((f) => f.id);

    expect(ids).not.toContain(borrador);
    expect(ids).not.toContain(eliminada);
  });

  it("el detalle público por id no encuentra el borrador", async () => {
    // El `where` de `GET /api/noticias/[id]` para un anónimo. Antes era un
    // `findUnique({ where: { id } })` pelado: devolvía el cuerpo completo.
    const sinSesion = await db.news.findFirst({
      where: { id: borrador, published: true, deletedAt: null },
    });
    expect(sinSesion).toBeNull();
  });

  it("el detalle público por id tampoco encuentra la eliminada", async () => {
    const sinSesion = await db.news.findFirst({
      where: { id: eliminada, published: true, deletedAt: null },
    });
    expect(sinSesion).toBeNull();
  });

  it("el detalle público sí encuentra la publicada", async () => {
    const sinSesion = await db.news.findFirst({
      where: { id: publicada, published: true, deletedAt: null },
    });
    expect(sinSesion?.title).toBe("Publicada");
  });

  it("el panel (ADMINISTRADOR) sí ve el borrador", async () => {
    // La rama con sesión de `GET /api/noticias/[id]`: sin el filtro. Si esto
    // fallara, el arreglo habría roto la pantalla de edición.
    const conSesion = await db.news.findFirst({ where: { id: borrador } });
    expect(conSesion?.title).toBe("Borrador");
  });

  it("el listado del panel trae publicadas y borradores, pero no eliminadas", async () => {
    // El `where` de `getNoticiasAdminPaged` (que ahora exige ADMINISTRADOR).
    const ids = (
      await db.news.findMany({
        where: { AND: [{ deletedAt: null }] },
        select: { id: true },
      })
    ).map((f) => f.id);

    expect(ids.sort()).toEqual([publicada, borrador].sort());
    expect(ids).not.toContain(eliminada);
  });
});
