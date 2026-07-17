import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, ArrowLeft, CalendarDays, Megaphone } from "lucide-react";
import { getPublishedOrgPost } from "@modules/novedades/actions/orgPosts";

type RouteParams = Promise<{ slug: string; postId: string }>;

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { slug, postId } = await params;
  const post = await getPublishedOrgPost(postId);
  // Mismo check que la página: sin esto, el <title> filtraría el nombre de la
  // novedad en una URL con slug de otra liga (aunque el body ya da 404).
  if (!post || post.organization.slug !== slug)
    return { title: "Novedad no encontrada | GOLAZO" };

  const description = post.summary ?? post.content.slice(0, 160);
  return {
    title: `${post.title} — ${post.organization.name} | GOLAZO`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
  };
}

export default async function OrgPostPage({
  params,
}: Readonly<{ params: RouteParams }>) {
  const { slug, postId } = await params;
  const post = await getPublishedOrgPost(postId);

  // La novedad tiene que pertenecer a la liga del slug: evita URLs cruzadas.
  if (!post || post.organization.slug !== slug) return notFound();

  const publishedLabel = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="transition-colors hover:text-brand">
            Inicio
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/liga/${post.organization.slug}`}
            className="max-w-[160px] truncate transition-colors hover:text-brand"
          >
            {post.organization.name}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="max-w-[180px] truncate font-medium text-gray-900 dark:text-white">
            {post.title}
          </span>
        </nav>

        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          <Megaphone className="h-3.5 w-3.5" />
          Novedad de la liga
        </div>

        <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white sm:text-4xl">
          {post.title}
        </h1>

        {publishedLabel && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <CalendarDays className="h-4 w-4" />
            {publishedLabel}
          </p>
        )}

        {post.coverImageUrl && (
          <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
            <Image
              src={post.coverImageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {post.summary && (
          <p className="mt-6 text-lg font-medium leading-relaxed text-gray-700 dark:text-gray-200">
            {post.summary}
          </p>
        )}

        {/* Contenido: texto plano (whitespace-pre-line conserva los saltos de
            línea). Nunca dangerouslySetInnerHTML — regla C5. */}
        <div className="mt-6 whitespace-pre-line text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {post.content}
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-800">
          <Link
            href={`/liga/${post.organization.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-mid"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a {post.organization.name}
          </Link>
        </div>
      </article>
    </div>
  );
}
