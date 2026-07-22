import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronRight,
  Newspaper,
  Trophy,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatDate";
import { getNoticiaById } from "@modules/noticias/actions/getNoticiaById";
import { getNoticiasRelacionadas } from "@modules/noticias/actions/getNoticiasRelacionadas";
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
    alternates: { canonical: `/noticias/${id}` },
    openGraph: {
      title: noticia.title,
      description,
      type: "article",
      publishedTime: new Date(noticia.publishedAt).toISOString(),
      images: noticia.coverImageUrl
        ? [{ url: noticia.coverImageUrl }]
        : undefined,
    },
  };
}

/**
 * Ficha pública de una noticia (`/noticias/[id]`) — patrón §2 de UI_PATTERNS.
 *
 * Server Component: la noticia se trae en el server y, si no existe (o es
 * borrador/eliminada), `notFound()` devuelve un **404 real** — antes esto era
 * client-fetched y quedaba en 200 (soft-404, malo para SEO). Lo interactivo
 * (compartir) vive en `ShareCard`.
 */
export default async function NoticiaIndividualPage({
  params,
}: Readonly<{ params: RouteParams }>) {
  const { id } = await params;
  const noticia = await getNoticiaById(id);
  if (!noticia) return notFound();

  const relacionadas = await getNoticiasRelacionadas(noticia.id);

  const wordCount = noticia.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const cover = noticia.coverImageUrl;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: noticia.title,
    description: noticia.summary ?? noticia.content.slice(0, 160),
    datePublished: new Date(noticia.publishedAt).toISOString(),
    dateModified: new Date(noticia.updatedAt).toISOString(),
    image: cover ? [cover] : undefined,
    author: { "@type": "Person", name: noticia.user?.name ?? "GOLAZO" },
    publisher: { "@type": "Organization", name: "GOLAZO" },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <JsonLd data={jsonLd} />

      {/* ---------------------------------------------------------------- */}
      {/* Hero. La altura la define el CONTENIDO (padding + texto), no un
          `h-[650px]` fijo: la versión anterior era más alta en mobile (650px)
          que en desktop (600px) — más que la pantalla de un teléfono — y si el
          título era largo, el texto se salía del fondo. `isolate` + `-z-10`
          dejan la foto detrás sin sacarla del flujo. */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {cover ? (
            <Image
              src={cover}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            // Sin portada no se muestra un placeholder gris: la marca es un
            // fondo digno por sí sola y evita que la nota "se vea rota".
            <div className="h-full w-full bg-gradient-to-br from-brand via-brand-mid to-brand-2" />
          )}
          {/* Velo: garantiza contraste AA del texto blanco sobre cualquier foto */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/85 to-gray-950/60" />
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-8">
          <nav
            aria-label="Migas de pan"
            className="mb-6 flex items-center gap-1.5 text-sm text-white/70 sm:gap-2"
          >
            <Link href="/" className="transition-colors hover:text-white">
              Inicio
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            <Link href="/noticias" className="transition-colors hover:text-white">
              Noticias
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            {/* `line-clamp-1` ya recorta: el `substring(0,40)` anterior cortaba
                a mitad de palabra y encima duplicaba el trabajo del CSS. */}
            <span
              aria-current="page"
              className="line-clamp-1 font-medium text-white/90"
            >
              {noticia.title}
            </span>
          </nav>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mb-8 border border-white/20 text-white/80 backdrop-blur-sm hover:bg-white/10 hover:text-white"
          >
            <Link href="/noticias">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver a noticias
            </Link>
          </Button>

          <header className="max-w-4xl space-y-5">
            <h1 className="text-balance text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              {noticia.title}
            </h1>

            {/* El resumen es lo que engancha: antes estaba `hidden sm:block`,
                así que en mobile —donde se lee la mayoría de las noticias— el
                hero ocupaba media pantalla para mostrar solo el título. */}
            {noticia.summary && (
              <p className="max-w-3xl text-pretty text-base leading-relaxed text-white/90 sm:text-lg lg:text-xl">
                {noticia.summary}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/20 pt-5 text-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-brand to-brand-2 shadow-lg">
                  <User className="h-4 w-4 text-white" aria-hidden="true" />
                </span>
                <span className="font-medium text-white">
                  {noticia.user?.name || "Redacción GOLAZO"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <time dateTime={new Date(noticia.publishedAt).toISOString()}>
                  {formatDate(noticia.publishedAt, "dd 'de' MMMM, yyyy")}
                </time>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                <span>{readingTime} min de lectura</span>
              </div>
            </div>
          </header>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Cuerpo */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative -mt-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <article className="lg:col-span-8">
              {/* La portada NO se repite acá: ya es el fondo del hero, y verla
                  dos veces en el mismo scroll era redundante. */}
              <div className="rounded-3xl border border-gray-100 bg-card p-6 shadow-2xl sm:p-8 lg:p-10 dark:border-gray-800">
                {/* Texto plano con `whitespace-pre-line`: nunca
                    `dangerouslySetInnerHTML` (C5). Se tipografía a mano y no
                    con `prose`, porque sin etiquetas HTML los modificadores
                    `prose-p:*` no aplicaban a nada — el color salía por
                    herencia, de casualidad. */}
                <div className="whitespace-pre-line text-pretty text-[1.0625rem] leading-[1.75] text-gray-700 sm:text-lg dark:text-gray-300">
                  {noticia.content}
                </div>
              </div>

              {/* Autor. Sin la bio inventada que decía "Periodista deportivo
                  especializado en…" para cualquiera: era texto falso presentado
                  como dato real (AGENT_RULES: sin datos mock). */}
              <div className="mt-8 rounded-2xl border border-gray-100 bg-card p-6 shadow-xl dark:border-gray-800">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-brand via-brand-mid to-brand-2 p-0.5 shadow-lg shadow-brand/20">
                    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[0.9rem] bg-card">
                      {noticia.user?.imageUrl ? (
                        <Image
                          src={noticia.user.imageUrl}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <User
                          className="h-7 w-7 text-brand"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-brand">
                      Escrito por
                    </p>
                    <h2 className="truncate text-lg font-bold text-gray-900 dark:text-white">
                      {noticia.user?.name || "Redacción GOLAZO"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Publicando en GOLAZO desde{" "}
                      {formatDate(noticia.user.createdAt, "MMMM yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            </article>

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

      {/* ---------------------------------------------------------------- */}
      {/* Seguir leyendo. Reemplaza al CTA genérico que decía "Más contenido
          para ti" y mandaba al índice: ahora son noticias de verdad, con su
          link. Si no hay otras publicadas, la sección no se renderiza en vez
          de mostrar una grilla vacía. */}
      {/* ---------------------------------------------------------------- */}
      {relacionadas.length > 0 && (
        <section className="mx-auto mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-2">
            <span className="h-6 w-1 rounded-full bg-gradient-to-b from-brand to-brand-2" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Seguí leyendo
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relacionadas.map((n) => (
              <Link
                key={n.id}
                href={`/noticias/${n.id}`}
                className="interactive-surface group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-card shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-gray-800"
              >
                <div className="relative aspect-[16/9] w-full bg-gray-100 dark:bg-gray-800">
                  {n.coverImageUrl ? (
                    <Image
                      src={n.coverImageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 20rem, (min-width: 640px) 45vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/15 to-brand-2/15">
                      <Newspaper
                        className="h-8 w-8 text-brand"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  <time
                    dateTime={new Date(n.publishedAt).toISOString()}
                    className="text-xs text-gray-500 dark:text-gray-400"
                  >
                    {formatDate(n.publishedAt, "dd 'de' MMMM, yyyy")}
                  </time>
                  <h3 className="line-clamp-2 font-semibold leading-snug text-gray-900 group-hover:text-brand dark:text-white">
                    {n.title}
                  </h3>
                  {n.summary && (
                    <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {n.summary}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA de cierre. El fondo sale de los tokens de marca: antes eran hex
          crudos (`#1a0a2e`/`#2d1b4e`), que M6 prohíbe. */}
      <section className="mx-auto mt-16 max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-mid via-brand to-brand-mid p-8 text-center sm:p-12">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          />
          <div className="relative z-10 space-y-5">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Seguí a tu equipo en GOLAZO
            </h2>
            <p className="mx-auto max-w-xl text-white/80">
              Tabla de posiciones, fixture y resultados de tu liga, actualizados
              en el momento.
            </p>
            <div className="flex flex-col justify-center gap-3 pt-1 sm:flex-row">
              <Button asChild size="lg" variant="secondary">
                <Link href="/torneos">
                  <Trophy className="h-5 w-5" aria-hidden="true" />
                  Explorar torneos
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/noticias">
                  <Newspaper className="h-5 w-5" aria-hidden="true" />
                  Ver más noticias
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
