import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  User,
  BookOpen,
  Newspaper,
  ChevronRight,
  Trophy,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatDate";
import { getNoticiaById } from "@modules/noticias/actions/getNoticiaById";
import { JsonLd } from "@/components/seo/JsonLd";
import { ShareCard } from "./ShareCard";

type RouteParams = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { id } = await params;
  const noticia = await getNoticiaById(id);
  if (!noticia) return { title: "Noticia no encontrada | GOLAZO" };

  const description = noticia.summary ?? noticia.content.slice(0, 160);
  return {
    title: `${noticia.title} | GOLAZO`,
    description,
    openGraph: {
      title: noticia.title,
      description,
      type: "article",
      images: noticia.coverImageUrl
        ? [{ url: noticia.coverImageUrl }]
        : undefined,
    },
  };
}

/**
 * Ficha pública de una noticia (`/noticias/[id]`). Server Component: la noticia
 * se trae en el server y, si no existe (o es borrador/eliminada), `notFound()`
 * devuelve un **404 real** — antes esto era client-fetched y quedaba en 200
 * (soft-404, malo para SEO). Lo interactivo (compartir) vive en `ShareCard`.
 */
export default async function NoticiaIndividualPage({
  params,
}: Readonly<{ params: RouteParams }>) {
  const { id } = await params;
  const noticia = await getNoticiaById(id);
  if (!noticia) return notFound();

  const wordCount = noticia.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: noticia.title,
    description: noticia.summary ?? noticia.content.slice(0, 160),
    datePublished: new Date(noticia.publishedAt).toISOString(),
    dateModified: new Date(noticia.updatedAt).toISOString(),
    image: noticia.coverImageUrl ? [noticia.coverImageUrl] : undefined,
    author: { "@type": "Person", name: noticia.user?.name ?? "GOLAZO" },
    publisher: { "@type": "Organization", name: "GOLAZO" },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <JsonLd data={jsonLd} />
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 h-[650px] sm:h-[550px] lg:h-[600px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={noticia.coverImageUrl || "/placeholder.svg"}
            alt={noticia.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/90 to-gray-950/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand/20 to-brand-2/20" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
          <nav className="mb-8 flex items-center gap-2 text-sm text-white/70">
            <Link href="/" className="transition-colors hover:text-white">
              Inicio
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href="/noticias"
              className="transition-colors hover:text-white"
            >
              Noticias
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="line-clamp-1 font-medium text-white/90">
              {noticia.title.length > 40
                ? noticia.title.substring(0, 40) + "..."
                : noticia.title}
            </span>
          </nav>

          <Link href="/noticias" className="mb-8 inline-block">
            <Button
              variant="ghost"
              size="sm"
              className="border border-white/20 text-white/80 backdrop-blur-sm hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Noticias
            </Button>
          </Link>

          <header className="max-w-4xl space-y-6">
            <div className="flex items-center gap-3">
              <Badge className="border-0 bg-gradient-to-r from-brand to-brand-mid px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-brand/30">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Noticia Destacada
              </Badge>
            </div>

            <h1 className="text-balance text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              {noticia.title}
            </h1>

            {noticia.summary && (
              <p className="hidden max-w-3xl text-pretty text-lg leading-relaxed text-white/90 sm:block lg:text-xl">
                {noticia.summary}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/20 pt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-brand to-brand-2 shadow-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-white">
                  {noticia.user.name || "Anónimo"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Calendar className="h-4 w-4" />
                <span>
                  {noticia.publishedAt
                    ? formatDate(noticia.publishedAt, "dd 'de' MMMM, yyyy")
                    : "Sin fecha"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <BookOpen className="h-4 w-4" />
                <span>{readingTime} min de lectura</span>
              </div>
            </div>
          </header>
        </div>
      </section>

      {/* Contenido */}
      <section className="relative -mt-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <article className="lg:col-span-8">
              <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={noticia.coverImageUrl || "/placeholder.svg"}
                    alt={noticia.title}
                    className="h-64 w-full object-cover lg:h-80"
                  />
                </div>

                <div className="p-6 sm:p-8 lg:p-10">
                  {/* Texto plano (whitespace-pre-line): nunca dangerouslySetInnerHTML (C5) */}
                  <div className="prose prose-lg max-w-none whitespace-pre-line dark:prose-invert prose-headings:font-bold prose-headings:text-gray-900 prose-p:leading-relaxed prose-p:text-gray-700 prose-a:text-brand prose-a:no-underline prose-strong:text-gray-900 prose-img:rounded-xl prose-img:shadow-lg hover:prose-a:underline dark:prose-headings:text-white dark:prose-p:text-gray-300 dark:prose-strong:text-white">
                    {noticia.content}
                  </div>
                </div>

                <div className="px-6 pb-8 sm:px-8 lg:px-10">
                  <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-6 dark:border-gray-800">
                    {["Deportes", "Torneos", "Actualidad"].map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Autor */}
              <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:p-8">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand via-brand-mid to-brand-2 p-0.5 shadow-lg shadow-brand/20 sm:h-20 sm:w-20">
                      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white dark:bg-gray-900">
                        {noticia.user.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={noticia.user.imageUrl}
                            alt={noticia.user.name || "Autor"}
                            className="h-full w-full rounded-2xl object-cover"
                          />
                        ) : (
                          <User className="h-8 w-8 text-brand" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {noticia.user.name || "Autor Anónimo"}
                      </h3>
                      <Badge className="border-0 bg-brand/10 text-xs text-brand">
                        Autor
                      </Badge>
                    </div>
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                      Periodista deportivo especializado en cobertura de torneos
                      y eventos deportivos locales.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Miembro desde{" "}
                      {formatDate(noticia.user.createdAt, "MMMM yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar interactiva */}
            <aside className="lg:col-span-4">
              <ShareCard
                title={noticia.title}
                publishedAt={noticia.publishedAt}
                updatedAt={noticia.updatedAt}
                readingTime={readingTime}
              />
            </aside>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a0a2e] via-[#2d1b4e] to-[#1a0a2e] p-8 sm:p-12 lg:p-16">
            <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-brand-2/20 blur-3xl" />

            <div className="relative z-10 space-y-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
                <Newspaper className="h-4 w-4" />
                Más contenido para ti
              </div>

              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                ¿Te gustó esta{" "}
                <span className="bg-gradient-to-r from-brand via-brand-mid to-brand-2 bg-clip-text text-transparent">
                  noticia
                </span>
                ?
              </h2>

              <p className="mx-auto max-w-2xl text-lg text-white/70">
                Explora más contenido y mantente al día con las últimas novedades
                deportivas de tu comunidad.
              </p>

              <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
                <Link href="/noticias">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-brand to-brand-2 px-8 text-lg text-white shadow-xl shadow-brand/30 hover:from-brand-hover hover:to-brand-2-hover"
                  >
                    <Newspaper className="mr-2 h-5 w-5" />
                    Ver más noticias
                  </Button>
                </Link>
                <Link href="/torneos">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 px-8 text-lg text-white hover:bg-white/10"
                  >
                    <Trophy className="mr-2 h-5 w-5" />
                    Explorar torneos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
