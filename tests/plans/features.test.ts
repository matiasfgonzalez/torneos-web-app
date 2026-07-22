import { describe, it, expect } from "vitest";
import { PLANS } from "../../prisma/plans.mjs";
import {
  FEATURE_KEYS,
  withAllFeatures,
} from "@/lib/constants/plan-features";

/**
 * El test que faltaba cuando se rompió `orgNews`.
 *
 * La feature se agregó al validador, a `/admin/planes` y al enforcement, pero
 * **no al seed**. Como `hasFeature` devuelve `false` ante una clave ausente, la
 * feature quedó apagada para todos los planes —Premium incluido— sin romper
 * nada ni loguear nada: el organizador pagaba y la pantalla le decía "función
 * de plan superior".
 *
 * Esto lo vuelve imposible de mergear en silencio: agregar una feature al
 * catálogo sin declararla en los planes rompe el build.
 */
describe("features de los planes", () => {
  it("todo plan declara TODAS las features del catálogo", () => {
    for (const plan of PLANS) {
      const declaradas = Object.keys(plan.features).sort();
      expect(declaradas, `el plan ${plan.code} no declara todas las features`)
        .toEqual([...FEATURE_KEYS].sort());
    }
  });

  it("ningún plan declara una feature que el catálogo no conoce", () => {
    const conocidas = new Set<string>(FEATURE_KEYS);
    for (const plan of PLANS) {
      for (const key of Object.keys(plan.features)) {
        expect(conocidas.has(key), `${plan.code} declara "${key}", que no está en el catálogo`)
          .toBe(true);
      }
    }
  });

  it("el plan más caro incluye al menos las features del más barato", () => {
    // Invariante comercial: subir de plan nunca puede quitarte algo.
    const ordenados = [...PLANS].sort((a, b) => a.order - b.order);
    for (let i = 1; i < ordenados.length; i++) {
      const menor = ordenados[i - 1];
      const mayor = ordenados[i];
      for (const key of FEATURE_KEYS) {
        if (menor.features[key] === true) {
          expect(
            mayor.features[key],
            `${mayor.code} pierde "${key}" que ${menor.code} sí tiene`,
          ).toBe(true);
        }
      }
    }
  });

  it("Premium incluye las novedades de la liga (el bug que se arregló)", () => {
    const premium = PLANS.find((p) => p.code === "PREMIUM");
    expect(premium?.features.orgNews).toBe(true);
  });
});

describe("withAllFeatures", () => {
  it("completa en false las claves ausentes", () => {
    const completo = withAllFeatures({ exportPdf: true });
    expect(completo.exportPdf).toBe(true);
    expect(completo.orgNews).toBe(false);
    expect(Object.keys(completo).sort()).toEqual([...FEATURE_KEYS].sort());
  });

  it("un plan sin features devuelve todo en false", () => {
    const completo = withAllFeatures(null);
    expect(Object.values(completo).every((v) => v === false)).toBe(true);
  });
});
