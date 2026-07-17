/** Novedad de la liga (S12) — DTO para las vistas. */
export interface IOrgPost {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  coverImageUrl: string | null;
  coverImagePublicId: string | null;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Novedad publicada con el contexto de su liga (para la página pública). */
export interface IPublicOrgPost extends IOrgPost {
  organization: {
    slug: string;
    name: string;
    logoUrl: string | null;
  };
}
