import { z } from "zod";
import { UserRole, UserStatus } from "@prisma/client";
import { nullableString } from "./common";

// No hay `userCreateSchema`: las cuentas las crea Clerk, no un alta manual
// (ver el comentario de `app/api/users/route.ts`, A4). Solo se editan.
const userBase = z.object({
  name: z.string().trim().min(1).max(120),
  phone: nullableString(30),
  location: nullableString(120),
  bio: nullableString(1000),
  role: z.enum(UserRole),
  status: z.enum(UserStatus),
  imageUrl: nullableString(500),
  emailVerified: z.boolean(),
});

export const userUpdateSchema = userBase.partial();

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
