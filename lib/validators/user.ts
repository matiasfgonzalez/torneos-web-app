import { z } from "zod";
import { UserRole, UserStatus } from "@prisma/client";
import { emptyToUndefined, nullableString } from "./common";

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

export const userCreateSchema = userBase
  .omit({ emailVerified: true })
  .partial({
    phone: true,
    location: true,
    bio: true,
    role: true,
    status: true,
    imageUrl: true,
  })
  .extend({
    email: z.email().max(255),
    clerkUserId: z.preprocess(
      emptyToUndefined,
      z.string().max(64).optional(),
    ),
  });

export const userUpdateSchema = userBase.partial();

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
