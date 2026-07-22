import { describe, it, expect } from "vitest";
import { ligasDelEquipo } from "@modules/equipos/utils/ligas";

const tt = (name: string | null, slug?: string) => ({
  tournament: { organization: name ? { name, slug: slug ?? name } : null },
});

describe("ligasDelEquipo", () => {
  it("un club de una sola liga devuelve una", () => {
    expect(ligasDelEquipo([tt("Liga Federalense"), tt("Liga Federalense")])).toEqual([
      { name: "Liga Federalense", slug: "Liga Federalense" },
    ]);
  });

  it("no repite la liga aunque el club haya jugado varios torneos suyos", () => {
    const ligas = ligasDelEquipo([
      tt("Liga A", "a"),
      tt("Liga A", "a"),
      tt("Liga B", "b"),
      tt("Liga A", "a"),
    ]);
    expect(ligas.map((l) => l.slug)).toEqual(["a", "b"]);
  });

  it("conserva el orden de aparición", () => {
    const ligas = ligasDelEquipo([tt("Liga C", "c"), tt("Liga A", "a"), tt("Liga B", "b")]);
    expect(ligas.map((l) => l.slug)).toEqual(["c", "a", "b"]);
  });

  it("ignora torneos sin organización en vez de romper", () => {
    expect(ligasDelEquipo([tt(null), tt("Liga A", "a")]).map((l) => l.slug)).toEqual(["a"]);
  });

  it("sin torneos devuelve lista vacía (la ficha no muestra el resumen)", () => {
    expect(ligasDelEquipo([])).toEqual([]);
  });
});
