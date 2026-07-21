// Campos NO sensibles del autor para exponer en lecturas de noticias.
// Las noticias son públicas (GET abierto), así que el join del autor debe
// filtrar PII: NUNCA email/phone/role/dni/clerkUserId/bio/status (M1, OWASP A01).
// Solo lo que la UI realmente muestra: nombre, foto y antigüedad.
export const newsAuthorSelect = {
  select: {
    id: true,
    name: true,
    imageUrl: true,
    createdAt: true,
  },
} as const;
