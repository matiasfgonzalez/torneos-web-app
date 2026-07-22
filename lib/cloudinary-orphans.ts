/**
 * Detección y limpieza de imágenes huérfanas en Cloudinary (M9).
 *
 * Un asset es "huérfano" cuando vive en una de las carpetas gestionadas por la
 * app (`ALLOWED_UPLOAD_FOLDERS`) pero NINGUNA fila de la BD lo referencia.
 *
 * Seguridad del cálculo (el borrado es irreversible):
 * - El set "referenciado" se arma con las columnas `*PublicId` **y** con el
 *   publicId extraído de las columnas de URL (`*Url`). Así, aunque un formulario
 *   viejo no haya persistido el publicId, la URL viva igual marca el asset como
 *   usado y NO se borra.
 * - Se incluyen las filas soft-deleted (p. ej. torneos con `deletedAt`): siguen
 *   siendo recuperables, así que su imagen NO es huérfana.
 */

import { db } from "@/lib/db";
import {
  listResourcesByPrefix,
  deleteImages,
  type CloudinaryResource,
} from "@/lib/cloudinary";
import { ALLOWED_UPLOAD_FOLDERS, deleteRequestSchema } from "@/types/cloudinary";

/**
 * Extrae el `public_id` de una URL de Cloudinary.
 * Maneja transformaciones (`f_auto,q_auto,w_200`) y el segmento de versión
 * (`v123456`). Devuelve `null` si la URL no es de Cloudinary.
 *
 * Ej: `.../upload/f_auto,q_auto/v1699/torneos/logos/abc.png` → `torneos/logos/abc`
 */
export function extractPublicId(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = "/upload/";
  const i = url.indexOf(marker);
  if (i === -1) return null;

  const rest = url.slice(i + marker.length).split("?")[0].split("#")[0];
  const segments = rest.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const isTransform = (seg: string) =>
    seg.includes(",") || /^[a-z]{1,3}_[^/]+$/.test(seg);

  const versionIdx = segments.findIndex((s) => /^v\d+$/.test(s));
  const pidSegments =
    versionIdx !== -1
      ? segments.slice(versionIdx + 1)
      : segments.slice(
          (() => {
            let s = 0;
            while (s < segments.length && isTransform(segments[s])) s++;
            return s;
          })(),
        );

  const pid = pidSegments.join("/").replace(/\.[a-zA-Z0-9]+$/, "");
  return pid || null;
}

/**
 * Conjunto de todos los publicId referenciados por la BD (todas las entidades
 * con imágenes, incluidas las soft-deleted). Combina columnas `*PublicId` y el
 * publicId derivado de las columnas `*Url`.
 */
export async function getReferencedPublicIds(): Promise<Set<string>> {
  const refs = new Set<string>();
  const add = (v: string | null | undefined) => {
    if (v) refs.add(v);
  };
  const addUrl = (u: string | null | undefined) => add(extractPublicId(u));

  const [organizations, orgPosts, payments, news, tournaments, teams, players] =
    await Promise.all([
      db.organization.findMany({ select: { logoPublicId: true, logoUrl: true } }),
      db.orgPost.findMany({
        select: { coverImagePublicId: true, coverImageUrl: true },
      }),
      db.payment.findMany({
        select: { receiptPublicId: true, receiptUrl: true },
      }),
      db.news.findMany({
        select: { coverImagePublicId: true, coverImageUrl: true },
      }),
      db.tournament.findMany({
        select: { logoPublicId: true, logoUrl: true },
      }),
      db.team.findMany({ select: { logoPublicId: true, logoUrl: true } }),
      db.player.findMany({
        select: {
          imagePublicId: true,
          imageUrl: true,
          imageFacePublicId: true,
          imageUrlFace: true,
        },
      }),
    ]);

  for (const o of organizations) {
    add(o.logoPublicId);
    addUrl(o.logoUrl);
  }
  for (const p of orgPosts) {
    add(p.coverImagePublicId);
    addUrl(p.coverImageUrl);
  }
  for (const p of payments) {
    add(p.receiptPublicId);
    addUrl(p.receiptUrl);
  }
  for (const n of news) {
    add(n.coverImagePublicId);
    addUrl(n.coverImageUrl);
  }
  for (const t of tournaments) {
    add(t.logoPublicId);
    addUrl(t.logoUrl);
  }
  for (const t of teams) {
    add(t.logoPublicId);
    addUrl(t.logoUrl);
  }
  for (const p of players) {
    add(p.imagePublicId);
    addUrl(p.imageUrl);
    add(p.imageFacePublicId);
    addUrl(p.imageUrlFace);
  }

  return refs;
}

export interface OrphanImage extends CloudinaryResource {
  /** Carpeta raíz gestionada a la que pertenece (para agrupar en la UI) */
  managedFolder: string;
}

/**
 * Lista los assets huérfanos de todas las carpetas gestionadas.
 * Recorre `ALLOWED_UPLOAD_FOLDERS` y resta el set referenciado.
 */
export async function findOrphans(): Promise<OrphanImage[]> {
  const referenced = await getReferencedPublicIds();
  const orphans: OrphanImage[] = [];

  for (const folder of ALLOWED_UPLOAD_FOLDERS) {
    const assets = await listResourcesByPrefix(folder);
    for (const asset of assets) {
      if (!referenced.has(asset.public_id)) {
        orphans.push({ ...asset, managedFolder: folder });
      }
    }
  }

  return orphans;
}

export interface DeleteOrphansResult {
  deleted: string[];
  /** publicIds que se saltaron por estar ahora referenciados o ser inválidos */
  skipped: string[];
}

/**
 * Borra assets huérfanos de forma segura:
 * 1. Valida que cada publicId esté dentro de una carpeta gestionada.
 * 2. RE-VERIFICA contra la BD que sigan sin estar referenciados (evita borrar
 *    un asset que se referenció entre que se listó y se confirmó el borrado).
 * 3. Recién ahí borra en Cloudinary.
 */
export async function deleteOrphans(
  publicIds: string[],
): Promise<DeleteOrphansResult> {
  const referenced = await getReferencedPublicIds();
  const toDelete: string[] = [];
  const skipped: string[] = [];

  for (const publicId of publicIds) {
    const valid = deleteRequestSchema.safeParse({ publicId }).success;
    if (!valid || referenced.has(publicId)) {
      skipped.push(publicId);
      continue;
    }
    toDelete.push(publicId);
  }

  if (toDelete.length > 0) {
    await deleteImages(toDelete);
  }

  return { deleted: toDelete, skipped };
}
