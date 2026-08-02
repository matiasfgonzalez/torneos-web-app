import { describe, expect, it } from "vitest";
import { newsCreateSchema, newsUpdateSchema } from "@/lib/validators/news";
import {
  orgPostCreateSchema,
  orgPostUpdateSchema,
} from "@/lib/validators/org-post";

/**
 * A8 — validadores de contenido editorial: noticias del sitio (admin) y
 * novedades de la liga (S12).
 *
 * `published` es el campo delicado de los dos: decide si el texto se ve desde
 * afuera. Que tenga un default y un tipo estricto es lo que evita que un
 * `"false"` string se lea como verdadero y publique un borrador.
 */

describe("newsCreateSchema", () => {
  const base = { title: "Arrancó el Apertura", content: "Contenido de la nota." };

  it("acepta el mínimo: título y contenido", () => {
    expect(newsCreateSchema.safeParse(base).success).toBe(true);
  });

  it.each(["title", "content"])("rechaza si falta %s", (campo) => {
    const payload: Record<string, unknown> = { ...base };
    delete payload[campo];
    expect(newsCreateSchema.safeParse(payload).success).toBe(false);
  });

  it("rechaza título o contenido en blanco", () => {
    expect(newsCreateSchema.safeParse({ ...base, title: "   " }).success).toBe(
      false,
    );
    expect(newsCreateSchema.safeParse({ ...base, content: "" }).success).toBe(
      false,
    );
  });

  it("recorta los espacios del título", () => {
    expect(newsCreateSchema.parse({ ...base, title: "  Gol  " }).title).toBe(
      "Gol",
    );
  });

  it("acota el título y el resumen", () => {
    expect(
      newsCreateSchema.safeParse({ ...base, title: "x".repeat(201) }).success,
    ).toBe(false);
    expect(
      newsCreateSchema.safeParse({ ...base, summary: "x".repeat(501) }).success,
    ).toBe(false);
  });

  it("un resumen vacío queda en null", () => {
    expect(newsCreateSchema.parse({ ...base, summary: "" }).summary).toBeNull();
  });

  it("published tiene que ser booleano de verdad", () => {
    // Un `"false"` de un formulario mal armado publicaría el borrador si el
    // esquema coercionara: no coerciona, lo rechaza.
    expect(
      newsCreateSchema.safeParse({ ...base, published: "false" }).success,
    ).toBe(false);
    expect(
      newsCreateSchema.safeParse({ ...base, published: true }).success,
    ).toBe(true);
  });

  it("descarta campos no declarados (C2)", () => {
    const result = newsCreateSchema.parse({ ...base, userId: "otro_autor" });
    expect(result).not.toHaveProperty("userId");
  });
});

describe("newsUpdateSchema", () => {
  it("acepta despublicar sin mandar el resto de la nota", () => {
    const result = newsUpdateSchema.safeParse({ published: false });
    expect(result.success).toBe(true);
  });

  it("sigue validando lo que viene", () => {
    expect(newsUpdateSchema.safeParse({ title: "" }).success).toBe(false);
  });
});

describe("orgPostCreateSchema", () => {
  const base = { title: "Fecha 3 reprogramada", content: "Se juega el sábado." };

  it("acepta el mínimo y deja la novedad como borrador", () => {
    const result = orgPostCreateSchema.parse(base);
    // El default es `false`: una novedad nueva nace sin publicar.
    expect(result.published).toBe(false);
  });

  it("el título necesita al menos 3 caracteres", () => {
    expect(orgPostCreateSchema.safeParse({ ...base, title: "ok" }).success).toBe(
      false,
    );
  });

  it("acota título, resumen y contenido", () => {
    expect(
      orgPostCreateSchema.safeParse({ ...base, title: "x".repeat(161) }).success,
    ).toBe(false);
    expect(
      orgPostCreateSchema.safeParse({ ...base, summary: "x".repeat(301) })
        .success,
    ).toBe(false);
    expect(
      orgPostCreateSchema.safeParse({ ...base, content: "x".repeat(10001) })
        .success,
    ).toBe(false);
  });

  it("acepta null en resumen y portada (quitar el dato)", () => {
    const result = orgPostCreateSchema.safeParse({
      ...base,
      summary: null,
      coverImageUrl: null,
    });
    expect(result.success).toBe(true);
  });

  it("la portada tiene que ser una URL", () => {
    expect(
      orgPostCreateSchema.safeParse({ ...base, coverImageUrl: "portada.jpg" })
        .success,
    ).toBe(false);
    expect(
      orgPostCreateSchema.safeParse({
        ...base,
        coverImageUrl: "https://res.cloudinary.com/demo/image/upload/p.jpg",
      }).success,
    ).toBe(true);
  });

  it("rechaza campos extra (strict): la organización no la elige el cliente", () => {
    expect(
      orgPostCreateSchema.safeParse({ ...base, organizationId: "org_ajena" })
        .success,
    ).toBe(false);
  });
});

describe("orgPostUpdateSchema", () => {
  it("acepta publicar una novedad ya escrita", () => {
    expect(orgPostUpdateSchema.safeParse({ published: true }).success).toBe(
      true,
    );
  });

  it("sigue siendo strict", () => {
    expect(
      orgPostUpdateSchema.safeParse({ published: true, authorId: "x" }).success,
    ).toBe(false);
  });
});
