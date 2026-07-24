import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api-client";

/** Respuesta fake para mockear `fetch`. */
function mockFetch(status: number, body: unknown, ok = status < 400) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok,
      status,
      text: async () => text,
    })) as unknown as typeof fetch,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("api-client", () => {
  it("éxito → { ok:true, data }", async () => {
    mockFetch(200, { id: "1", name: "Racing" });
    const res = await api.get<{ id: string; name: string }>("/api/x");
    expect(res).toEqual({ ok: true, data: { id: "1", name: "Racing" } });
  });

  it("error con { error } → toma ese mensaje", async () => {
    mockFetch(400, { error: "El equipo ya existe" });
    const res = await api.post("/api/x", {});
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe("El equipo ya existe");
      expect(res.status).toBe(400);
    }
  });

  it("error con { message } (envelope users) → cae a message", async () => {
    mockFetch(500, { success: false, message: "Error al cargar usuarios" });
    const res = await api.get("/api/users");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("Error al cargar usuarios");
  });

  it("validación Zod → conserva details por campo", async () => {
    mockFetch(400, {
      error: "Datos inválidos",
      details: [{ path: "name", message: "Requerido" }],
    });
    const res = await api.post("/api/x", {});
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.details).toEqual([{ path: "name", message: "Requerido" }]);
    }
  });

  it("sin cuerpo de error → mensaje genérico con el status", async () => {
    mockFetch(503, "");
    const res = await api.del("/api/x/1");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("Error 503");
  });

  it("red caída (fetch tira) → status 0 y mensaje de conexión", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }) as unknown as typeof fetch,
    );
    const res = await api.get("/api/x");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.status).toBe(0);
      expect(res.error).toMatch(/conectar/i);
    }
  });

  it("204/empty → data null sin romper", async () => {
    mockFetch(200, "");
    const res = await api.del("/api/x/1");
    expect(res).toEqual({ ok: true, data: null });
  });
});
