import { describe, expect, it } from "vitest";
import {
  inviteMemberSchema,
  memberRoleSchema,
  organizationStatusSchema,
  organizationUpdateSchema,
} from "@/lib/validators/organization";
import { planCreateSchema, planUpdateSchema } from "@/lib/validators/plan";
import { siteSettingsUpdateSchema } from "@/lib/validators/site-settings";

/**
 * A8 — validadores de organización, planes y configuración del sitio.
 *
 * Los tres son `.strict()`: acá el rechazo de campos desconocidos no es una
 * cortesía sino la defensa contra mass assignment (C2) en las entidades que
 * definen quién paga, quién entra y qué se muestra en público.
 */

describe("organizationUpdateSchema", () => {
  it("acepta una edición parcial del perfil", () => {
    expect(
      organizationUpdateSchema.safeParse({ name: "Liga del Sur" }).success,
    ).toBe(true);
    expect(organizationUpdateSchema.safeParse({}).success).toBe(true);
  });

  it("rechaza un nombre demasiado corto", () => {
    expect(organizationUpdateSchema.safeParse({ name: "A" }).success).toBe(
      false,
    );
  });

  it("rechaza campos que el esquema no declara (strict)", () => {
    // `plan`, `status` y `ownerId` se deciden server-side: si entraran por acá,
    // cualquier miembro se auto-asignaría un plan pago.
    expect(
      organizationUpdateSchema.safeParse({ name: "Liga", planId: "pro" })
        .success,
    ).toBe(false);
    expect(
      organizationUpdateSchema.safeParse({ name: "Liga", status: "ACTIVA" })
        .success,
    ).toBe(false);
  });

  it("acepta un color de marca en formato #RRGGBB", () => {
    const result = organizationUpdateSchema.parse({ brandColor: "#1D4ED8" });
    expect(result.brandColor).toBe("#1D4ED8");
  });

  it("acepta minúsculas en el hex", () => {
    expect(
      organizationUpdateSchema.safeParse({ brandColor: "#ff00aa" }).success,
    ).toBe(true);
  });

  it("rechaza cualquier color que no sea #RRGGBB", () => {
    for (const invalido of ["#FFF", "rojo", "rgb(0,0,0)", "FF0000", "#12345G"]) {
      expect(
        organizationUpdateSchema.safeParse({ brandColor: invalido }).success,
      ).toBe(false);
    }
  });

  it('un color vacío vuelve a null (quitar el branding)', () => {
    const result = organizationUpdateSchema.parse({ brandColor: "" });
    expect(result.brandColor).toBeNull();
  });
});

describe("inviteMemberSchema", () => {
  it("normaliza el email a minúsculas", () => {
    const result = inviteMemberSchema.parse({
      email: "  Delegado@Club.COM  ",
      role: "COLABORADOR",
    });
    expect(result.email).toBe("delegado@club.com");
  });

  it("rechaza un email inválido", () => {
    expect(
      inviteMemberSchema.safeParse({ email: "delegado", role: "COLABORADOR" })
        .success,
    ).toBe(false);
  });

  it("no se puede invitar a alguien como OWNER (es quien creó la liga)", () => {
    expect(
      inviteMemberSchema.safeParse({ email: "a@b.com", role: "OWNER" }).success,
    ).toBe(false);
  });

  it("rechaza roles de plataforma que no son de organización", () => {
    expect(
      inviteMemberSchema.safeParse({ email: "a@b.com", role: "ADMINISTRADOR" })
        .success,
    ).toBe(false);
  });

  it("rechaza campos extra (strict)", () => {
    expect(
      inviteMemberSchema.safeParse({
        email: "a@b.com",
        role: "COLABORADOR",
        organizationId: "org_ajena",
      }).success,
    ).toBe(false);
  });
});

describe("memberRoleSchema y organizationStatusSchema", () => {
  it("el cambio de rol solo admite roles de trabajo", () => {
    expect(memberRoleSchema.safeParse({ role: "ORGANIZADOR" }).success).toBe(
      true,
    );
    expect(memberRoleSchema.safeParse({ role: "OWNER" }).success).toBe(false);
  });

  it("el estado de la organización es ACTIVA o SUSPENDIDA (N10)", () => {
    expect(
      organizationStatusSchema.safeParse({ status: "SUSPENDIDA" }).success,
    ).toBe(true);
    expect(
      organizationStatusSchema.safeParse({ status: "ELIMINADA" }).success,
    ).toBe(false);
  });
});

describe("planCreateSchema", () => {
  const base = {
    code: "PRO",
    name: "Profesional",
    priceMonthly: 15000,
    maxActiveTournaments: 5,
    maxTeamsPerTournament: 32,
    maxMembers: 10,
    features: {},
  };

  it("acepta un plan con lo mínimo y aplica los defaults", () => {
    const result = planCreateSchema.parse(base);
    expect(result.currency).toBe("ARS");
    expect(result.isActive).toBe(true);
    expect(result.order).toBe(0);
    // Las features arrancan apagadas: un plan nuevo no habilita nada por accidente.
    expect(result.features).toEqual({
      exportPdf: false,
      customBranding: false,
      liveMatch: false,
      orgNews: false,
    });
  });

  it("normaliza el código a mayúsculas", () => {
    // `getFreePlan()` busca "FREE" por código: si entrara "free" no lo encuentra.
    expect(planCreateSchema.parse({ ...base, code: "free" }).code).toBe("FREE");
  });

  it("rechaza códigos con caracteres que no son [A-Z0-9_]", () => {
    for (const invalido of ["pro-max", "PRO MAX", "PRO!", "P"]) {
      expect(planCreateSchema.safeParse({ ...base, code: invalido }).success).toBe(
        false,
      );
    }
  });

  it("exige el objeto features completo", () => {
    const { features, ...sinFeatures } = base;
    void features;
    expect(planCreateSchema.safeParse(sinFeatures).success).toBe(false);
  });

  it("rechaza un precio negativo", () => {
    expect(
      planCreateSchema.safeParse({ ...base, priceMonthly: -1 }).success,
    ).toBe(false);
  });

  it("acepta 0 en los límites (plan sin cupo)", () => {
    expect(
      planCreateSchema.safeParse({ ...base, maxActiveTournaments: 0 }).success,
    ).toBe(true);
  });

  it("la moneda es un código de 3 letras", () => {
    expect(planCreateSchema.safeParse({ ...base, currency: "US" }).success).toBe(
      false,
    );
    expect(
      planCreateSchema.safeParse({ ...base, currency: "USD" }).success,
    ).toBe(true);
  });

  it("rechaza campos extra (strict)", () => {
    expect(
      planCreateSchema.safeParse({ ...base, organizations: 999 }).success,
    ).toBe(false);
  });
});

describe("planUpdateSchema", () => {
  it("acepta una edición parcial", () => {
    expect(planUpdateSchema.safeParse({ priceMonthly: 20000 }).success).toBe(
      true,
    );
  });

  it("no deja renombrar el código (la lógica de negocio lo usa como clave)", () => {
    expect(planUpdateSchema.safeParse({ code: "OTRO" }).success).toBe(false);
  });
});

describe("siteSettingsUpdateSchema", () => {
  it("acepta una edición parcial", () => {
    expect(
      siteSettingsUpdateSchema.safeParse({ contactPhone: "341 555-0000" })
        .success,
    ).toBe(true);
  });

  it("normaliza el email de contacto a minúsculas", () => {
    const result = siteSettingsUpdateSchema.parse({
      contactEmail: " Contacto@GOLAZO.com ",
    });
    expect(result.contactEmail).toBe("contacto@golazo.com");
  });

  it("vacía el email y las redes a null (borrar el dato del footer)", () => {
    const result = siteSettingsUpdateSchema.parse({
      contactEmail: "",
      instagramUrl: "",
    });
    expect(result.contactEmail).toBeNull();
    expect(result.instagramUrl).toBeNull();
  });

  it("rechaza una red social que no es una URL", () => {
    expect(
      siteSettingsUpdateSchema.safeParse({ facebookUrl: "@golazo" }).success,
    ).toBe(false);
  });

  it("rechaza campos extra (strict)", () => {
    expect(
      siteSettingsUpdateSchema.safeParse({ adminEmail: "yo@example.com" })
        .success,
    ).toBe(false);
  });
});
