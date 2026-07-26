import { describe, it, expect } from "vitest";
import { UserRole } from "@/lib/generated/prisma/enums";

import {
  USER_ROLE_RANK,
  canAssignRole,
  canManageUser,
} from "@/lib/userRoles";

describe("jerarquía de roles de plataforma", () => {
  it("son exactamente dos, los del schema (D5)", () => {
    // El panel llegó a ofrecer cinco (MODERADOR/EDITOR/ORGANIZADOR) contra los
    // dos que la base puede guardar. Este test es el que avisa si vuelve a
    // aparecer una tabla con roles que el enum de Prisma no tiene.
    expect(Object.keys(USER_ROLE_RANK).sort()).toEqual(
      Object.values(UserRole).sort(),
    );
  });

  it("el administrador gestiona a un usuario común", () => {
    expect(canManageUser("ADMINISTRADOR", "USUARIO")).toBe(true);
  });

  it("un administrador NO gestiona a otro administrador", () => {
    // Estrictamente mayor: es lo que evita que dos admins se borren entre sí.
    expect(canManageUser("ADMINISTRADOR", "ADMINISTRADOR")).toBe(false);
  });

  it("un usuario común no gestiona a nadie", () => {
    expect(canManageUser("USUARIO", "USUARIO")).toBe(false);
    expect(canManageUser("USUARIO", "ADMINISTRADOR")).toBe(false);
  });

  it("solo el administrador asigna roles, y puede asignar los dos", () => {
    // Poder promover a ADMINISTRADOR es necesario: si no, no habría forma de
    // sumar un segundo dueño del producto.
    expect(canAssignRole("ADMINISTRADOR", "ADMINISTRADOR")).toBe(true);
    expect(canAssignRole("ADMINISTRADOR", "USUARIO")).toBe(true);
    expect(canAssignRole("USUARIO", "USUARIO")).toBe(false);
    expect(canAssignRole("USUARIO", "ADMINISTRADOR")).toBe(false);
  });
});
