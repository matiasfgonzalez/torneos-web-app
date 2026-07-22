/**
 * Inyecta un bloque JSON-LD (structured data) para SEO (M3). Escapa `<` para
 * evitar cierres de `</script>` desde datos de la BD. Renderizable en el body:
 * Google lee el JSON-LD en cualquier parte del documento.
 */
export function JsonLd({ data }: Readonly<{ data: Record<string, unknown> }>) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
