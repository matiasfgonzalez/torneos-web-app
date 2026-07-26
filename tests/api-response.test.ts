import { describe, it, expect } from "vitest";
import { apiError, apiNoContent, apiOk } from "@/lib/apiResponse";

/**
 * La convención de A7 vive en estos tres helpers. Los tests fijan la forma del
 * cuerpo porque es un contrato con `lib/api-client.ts`: si alguien vuelve a
 * envolver los datos en `{ success, data }`, todas las pantallas leen `undefined`
 * y nada falla en compilación.
 */
describe("apiOk", () => {
  it("devuelve los datos directos, sin envelope", async () => {
    const res = apiOk({ id: "t1", name: "Apertura" });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ id: "t1", name: "Apertura" });
  });

  it("una lista vacía es `[]`, no un objeto con mensaje", async () => {
    const res = apiOk([]);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([]);
  });

  it("acepta un status propio (201 al crear)", () => {
    expect(apiOk({ id: "t1" }, 201).status).toBe(201);
  });
});

describe("apiNoContent", () => {
  it("es 204 y sin cuerpo", async () => {
    const res = apiNoContent();
    expect(res.status).toBe(204);
    await expect(res.text()).resolves.toBe("");
  });
});

describe("apiError", () => {
  it("es `{ error }` con el status HTTP correcto", async () => {
    const res = apiError(404, "Torneo no encontrado");
    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ error: "Torneo no encontrado" });
  });

  it("suma `details` para los errores por campo de Zod", async () => {
    const details = [{ path: "name", message: "Requerido" }];
    const res = apiError(400, "Datos inválidos", details);
    await expect(res.json()).resolves.toEqual({
      error: "Datos inválidos",
      details,
    });
  });

  it("suma campos propios del dominio (el 409 de players)", async () => {
    // La UI usa `existingPlayer` para ofrecer "sumalo al plantel" en vez de
    // duplicar la ficha; llega por `res.raw` del api-client.
    const res = apiError(409, "Ya existe un jugador con ese DNI", undefined, {
      existingPlayer: { id: "p1", name: "Messi" },
    });
    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toEqual({
      error: "Ya existe un jugador con ese DNI",
      existingPlayer: { id: "p1", name: "Messi" },
    });
  });

  it("nunca responde 200 con un error adentro", () => {
    // El anti-patrón que tenía `users/*`: `200 { success: false }`.
    for (const status of [400, 401, 403, 404, 409, 500]) {
      expect(apiError(status, "x").status).toBe(status);
    }
  });
});
