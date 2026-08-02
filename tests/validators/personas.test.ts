import { describe, expect, it } from "vitest";
import {
  refereeCreateSchema,
  refereeUpdateSchema,
} from "@/lib/validators/referee";
import { userUpdateSchema } from "@/lib/validators/user";
import {
  playerCreateSchema,
  playerUpdateSchema,
} from "@/lib/validators/player";

/**
 * A8 — validadores de personas: árbitro, usuario y jugador.
 *
 * La normalización del DNI ya está cubierta en tests/players/national-id.test.ts;
 * acá van el resto de los campos del jugador y los dos esquemas que no tenían
 * ninguna cobertura.
 */

describe("refereeCreateSchema", () => {
  const base = { name: "Ana Gómez" };

  it("acepta el mínimo: el nombre", () => {
    expect(refereeCreateSchema.safeParse(base).success).toBe(true);
  });

  it("rechaza un nombre en blanco", () => {
    expect(refereeCreateSchema.safeParse({ name: "  " }).success).toBe(false);
  });

  it("status y enabled se fijan server-side al crear: se descartan", () => {
    const result = refereeCreateSchema.parse({
      ...base,
      status: "ACTIVO",
      enabled: true,
    });
    expect(result).not.toHaveProperty("status");
    expect(result).not.toHaveProperty("enabled");
  });

  it("un email vacío queda en null, no en cadena vacía", () => {
    expect(refereeCreateSchema.parse({ ...base, email: "" }).email).toBeNull();
  });

  it("rechaza un email inválido", () => {
    expect(
      refereeCreateSchema.safeParse({ ...base, email: "ana(arroba)mail" })
        .success,
    ).toBe(false);
  });

  it("acepta los datos opcionales de contacto y certificación", () => {
    const result = refereeCreateSchema.safeParse({
      ...base,
      email: "ana@liga.com",
      phone: "341 555-0000",
      nationalId: "23456789",
      birthDate: "1990-05-20T00:00:00.000Z",
      certificationLevel: "Nacional",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza una fecha de nacimiento inválida", () => {
    expect(
      refereeCreateSchema.safeParse({ ...base, birthDate: "20/05/1990" })
        .success,
    ).toBe(false);
  });
});

describe("refereeUpdateSchema", () => {
  it("sí acepta status y enabled (a diferencia del create)", () => {
    const result = refereeUpdateSchema.parse({
      status: "SUSPENDIDO",
      enabled: false,
    });
    expect(result.status).toBe("SUSPENDIDO");
    expect(result.enabled).toBe(false);
  });

  it("rechaza un estado que no existe", () => {
    expect(refereeUpdateSchema.safeParse({ status: "VACACIONES" }).success).toBe(
      false,
    );
  });

  it("acepta una edición parcial", () => {
    expect(refereeUpdateSchema.safeParse({}).success).toBe(true);
  });
});

describe("userUpdateSchema", () => {
  it("acepta una edición parcial del perfil", () => {
    expect(userUpdateSchema.safeParse({ name: "Matías G." }).success).toBe(true);
    expect(userUpdateSchema.safeParse({}).success).toBe(true);
  });

  it("rechaza un nombre en blanco", () => {
    expect(userUpdateSchema.safeParse({ name: "   " }).success).toBe(false);
  });

  it("el rol solo puede ser uno de los dos de plataforma", () => {
    expect(userUpdateSchema.safeParse({ role: "ADMINISTRADOR" }).success).toBe(
      true,
    );
    expect(userUpdateSchema.safeParse({ role: "SUPERADMIN" }).success).toBe(
      false,
    );
  });

  it("rechaza un estado de cuenta inventado", () => {
    expect(userUpdateSchema.safeParse({ status: "BANEADO" }).success).toBe(
      false,
    );
    expect(userUpdateSchema.safeParse({ status: "SUSPENDIDO" }).success).toBe(
      true,
    );
  });

  it("descarta lo que no declara: el email y el id de Clerk no se editan acá", () => {
    // Las cuentas las crea y las sincroniza Clerk (A4): si el email entrara por
    // este PATCH, la app y Clerk quedarían diciendo cosas distintas.
    const result = userUpdateSchema.parse({
      name: "Matías",
      email: "otro@example.com",
      clerkUserId: "user_falso",
    });
    expect(result).not.toHaveProperty("email");
    expect(result).not.toHaveProperty("clerkUserId");
  });

  it("los opcionales vacíos quedan en null", () => {
    const result = userUpdateSchema.parse({ phone: "", location: "", bio: "" });
    expect(result.phone).toBeNull();
    expect(result.location).toBeNull();
    expect(result.bio).toBeNull();
  });
});

describe("playerCreateSchema — campos más allá del DNI", () => {
  const base = { name: "Juan Pérez", nationalId: "12345678" };

  it("acepta el mínimo: nombre y DNI", () => {
    expect(playerCreateSchema.safeParse(base).success).toBe(true);
  });

  it("acota altura y peso a valores humanos", () => {
    expect(playerCreateSchema.parse({ ...base, height: "1.85" }).height).toBe(
      1.85,
    );
    expect(playerCreateSchema.safeParse({ ...base, height: 301 }).success).toBe(
      false,
    );
    expect(playerCreateSchema.safeParse({ ...base, weight: 501 }).success).toBe(
      false,
    );
  });

  it("acota el número de camiseta", () => {
    expect(playerCreateSchema.safeParse({ ...base, number: 1000 }).success).toBe(
      false,
    );
    expect(playerCreateSchema.safeParse({ ...base, number: 10 }).success).toBe(
      true,
    );
  });

  it("rechaza un pie o una posición que no están en el enum", () => {
    expect(
      playerCreateSchema.safeParse({ ...base, dominantFoot: "AMBIDIESTRO" })
        .success,
    ).toBe(false);
    expect(
      playerCreateSchema.safeParse({ ...base, position: "MEDIOCAMPISTA" })
        .success,
    ).toBe(false);
    expect(
      playerCreateSchema.safeParse({ ...base, position: "ARQUERO" }).success,
    ).toBe(true);
  });

  it("los enums vacíos quedan en null (el formulario manda '')", () => {
    const result = playerCreateSchema.parse({
      ...base,
      dominantFoot: "",
      position: "",
    });
    expect(result.dominantFoot).toBeNull();
    expect(result.position).toBeNull();
  });

  it("rechaza una fecha de nacimiento inválida (C3)", () => {
    expect(
      playerCreateSchema.safeParse({ ...base, birthDate: "no-es-fecha" })
        .success,
    ).toBe(false);
  });
});

describe("playerUpdateSchema", () => {
  it("acepta una edición parcial sin repetir el DNI", () => {
    expect(playerUpdateSchema.safeParse({ number: 9 }).success).toBe(true);
    expect(playerUpdateSchema.safeParse({}).success).toBe(true);
  });

  it("si el DNI viene, se sigue normalizando", () => {
    expect(playerUpdateSchema.parse({ nationalId: "12.345.678" }).nationalId)
      .toBe("12345678");
  });
});
