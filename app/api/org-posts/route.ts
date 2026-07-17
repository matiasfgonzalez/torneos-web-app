import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiOrgContext } from "@/lib/orgAuth";
import { hasFeature } from "@/lib/planLimits";
import { orgPostCreateSchema } from "@/lib/validators/org-post";
import { validationErrorResponse } from "@/lib/validators/common";

/**
 * Crear una novedad de la liga (S12). Gateado por la feature de plan `orgNews`:
 * si el plan no la incluye → 402 con upsell. La org se resuelve del usuario
 * (su membresía), igual que la creación de torneos/equipos.
 */
export async function POST(req: Request) {
  const auth = await requireApiOrgContext();
  if (auth.error) return auth.error;
  const { org } = auth;

  if (!(await hasFeature(org.id, "orgNews"))) {
    return NextResponse.json(
      {
        error:
          "Tu plan no incluye Novedades de la liga. Mejorá tu plan para publicar novedades.",
      },
      { status: 402 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = orgPostCreateSchema.safeParse(body);
  if (!parsed.success) return validationErrorResponse(parsed.error);
  const data = parsed.data;

  const post = await db.orgPost.create({
    data: {
      organizationId: org.id,
      title: data.title,
      summary: data.summary ?? null,
      content: data.content,
      coverImageUrl: data.coverImageUrl ?? null,
      coverImagePublicId: data.coverImagePublicId ?? null,
      published: data.published ?? false,
      // publishedAt se setea al publicar (nullable): un borrador no tiene fecha
      // de publicación, así el orden público es honesto.
      publishedAt: data.published ? new Date() : null,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
