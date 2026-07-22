import { describe, it, expect } from "vitest";
import { extractPublicId } from "@/lib/cloudinary-orphans";

describe("extractPublicId", () => {
  it("URL con versión", () => {
    expect(
      extractPublicId(
        "https://res.cloudinary.com/demo/image/upload/v1699999999/torneos/logos/abc123.png",
      ),
    ).toBe("torneos/logos/abc123");
  });

  it("URL con transformaciones + versión", () => {
    expect(
      extractPublicId(
        "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_200/v1699/equipos/logos/xyz.webp",
      ),
    ).toBe("equipos/logos/xyz");
  });

  it("URL sin versión (transformaciones sueltas)", () => {
    expect(
      extractPublicId(
        "https://res.cloudinary.com/demo/image/upload/c_fill,w_100/jugadores/rostro/uuid-abc.jpg",
      ),
    ).toBe("jugadores/rostro/uuid-abc");
  });

  it("URL sin versión ni transformaciones", () => {
    expect(
      extractPublicId(
        "https://res.cloudinary.com/demo/image/upload/torneos/logos/plain.jpg",
      ),
    ).toBe("torneos/logos/plain");
  });

  it("null / vacío / no-cloudinary → null", () => {
    expect(extractPublicId(null)).toBeNull();
    expect(extractPublicId(undefined)).toBeNull();
    expect(extractPublicId("")).toBeNull();
    expect(extractPublicId("https://example.com/foto.png")).toBeNull();
  });
});
