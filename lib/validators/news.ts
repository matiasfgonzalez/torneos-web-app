import { z } from "zod";
import { nullableString } from "./common";

const newsBase = z.object({
  title: z.string().trim().min(1).max(200),
  summary: nullableString(500),
  content: z.string().trim().min(1).max(50000),
  coverImageUrl: nullableString(500),
  coverImagePublicId: nullableString(255),
  published: z.boolean(),
});

export const newsCreateSchema = newsBase.partial({
  summary: true,
  coverImageUrl: true,
  coverImagePublicId: true,
  published: true,
});

export const newsUpdateSchema = newsBase.partial();

export type NewsCreateInput = z.infer<typeof newsCreateSchema>;
export type NewsUpdateInput = z.infer<typeof newsUpdateSchema>;
