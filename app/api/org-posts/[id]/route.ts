import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiOrgAccess } from "@/lib/orgAuth";
import { orgPostUpdateSchema } from "@/lib/validators/org-post";
import { validationErrorResponse } from "@/lib/validators/common";

/**
 * Editar una novedad (incluye publicar/despublicar). Editar contenido ya
 * cargado NO se gatea por plan (nunca se bloquea gestionar datos existentes);
 * solo la CREACIÓN pasa por `hasFeature`. Requiere gestionar la org dueña.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const existing = await db.orgPost.findUnique({
    where: { id },
    select: { id: true, organizationId: true, published: true, publishedAt: true, deletedAt: true },
  });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Novedad no encontrada" }, { status: 404 });
  }

  const auth = await requireApiOrgAccess(existing.organizationId);
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = orgPostUpdateSchema.safeParse(body);
  if (!parsed.success) return validationErrorResponse(parsed.error);
  const data = parsed.data;

  // publishedAt: se fija la primera vez que se publica y se conserva después
  // (re-publicar no reordena). Al despublicar se mantiene la fecha original.
  const willPublish = data.published ?? existing.published;
  const publishedAt = willPublish
    ? (existing.publishedAt ?? new Date())
    : existing.publishedAt;

  const post = await db.orgPost.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.summary !== undefined && { summary: data.summary ?? null }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.coverImageUrl !== undefined && {
        coverImageUrl: data.coverImageUrl ?? null,
      }),
      ...(data.coverImagePublicId !== undefined && {
        coverImagePublicId: data.coverImagePublicId ?? null,
      }),
      ...(data.published !== undefined && { published: data.published }),
      publishedAt,
    },
  });

  return NextResponse.json(post, { status: 200 });
}

/**
 * Eliminar una novedad (soft delete: conserva el dato, sale de los listados).
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const existing = await db.orgPost.findUnique({
    where: { id },
    select: { organizationId: true, deletedAt: true },
  });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Novedad no encontrada" }, { status: 404 });
  }

  const auth = await requireApiOrgAccess(existing.organizationId);
  if (auth.error) return auth.error;

  await db.orgPost.update({
    where: { id },
    data: { deletedAt: new Date(), published: false },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
