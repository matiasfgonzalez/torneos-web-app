"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  User,
  Share2,
  Clock,
  BookOpen,
  Newspaper,
  ChevronRight,
  Trophy,
  Link as LinkIcon,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/formatDate";
import { FullscreenLoading } from "@/components/fullscreen-loading";
import { INoticia } from "@modules/noticias/types";
import { notFound } from "next/navigation";

interface NoticiaPageProps {
  params: Promise<{ id: string }>;
}

export default function NoticiaIndividualPage({
  params,
}: Readonly<NoticiaPageProps>) {
  const [noticia, setNoticia] = useState<INoticia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noticiaId, setNoticiaId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setNoticiaId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!noticiaId) return;

    const fetchNoticia = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/noticias/${noticiaId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError("Noticia no encontrada");
            return;
          }
          throw new Error("Error al cargar la noticia");
        }

        const data = await response.json();
        setNoticia(data);
      } catch (err) {
        console.error("Error fetching noticia:", err);
        setError("Error al cargar la noticia");
      } finally {
        setLoading(false);
      }
    };

    fetchNoticia();
  }, [noticiaId]);

  if (loading) {
    return <FullscreenLoading isVisible={true} message="Cargando noticia" />;
  }

  if (error || !noticia) {
    return notFound();
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: noticia.title,
          text: noticia.summary ?? "",
          url: globalThis.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(globalThis.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calcular tiempo de lectura estimado
  const wordCount = noticia.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section con imagen de fondo */}
      <section className="relative">
        {/* Background Image con overlay */}
        <div className="absolute inset-0 h-[500px] lg:h-[600px]">
          <img
            src={noticia.coverImageUrl || "/placeholder.svg"}
            alt={noticia.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-gray-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff]/20 to-[#a3b3ff]/20" />
        </div>

        {/* Content */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              href="/noticias"
              className="hover:text-white transition-colors"
            >
              Noticias
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white/90 font-medium line-clamp-1">
              {noticia.title.length > 40
                ? noticia.title.substring(0, 40) + "..."
                : noticia.title}
            </span>
          </nav>

          {/* Back Button */}
          <Link href="/noticias" className="inline-block mb-8">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Noticias
            </Button>
          </Link>

          {/* Article Header */}
          <header className="space-y-6 max-w-4xl">
            {/* Badge */}
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-[#ad45ff] to-[#c77dff] text-white border-0 px-4 py-1.5 text-sm font-medium shadow-lg shadow-[#ad45ff]/30">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Noticia Destacada
              </Badge>
              {noticia.published && (
                <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1">
                  Publicado
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-balance leading-tight">
              {noticia.title}
            </h1>

            {/* Summary */}
            {noticia.summary && (
              <p className="text-lg lg:text-xl text-white/80 text-pretty leading-relaxed max-w-3xl">
                {noticia.summary}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/60 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90 font-medium">
                  {noticia.user.name || "Anónimo"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {noticia.publishedAt
                    ? formatDate(noticia.publishedAt, "dd 'de' MMMM, yyyy")
                    : "Sin fecha"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{readingTime} min de lectura</span>
              </div>
            </div>
          </header>
        </div>
      </section>

      {/* Article Content */}
      <section className="relative -mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <article className="lg:col-span-8">
              {/* Content Card */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {/* Featured Image (visible en móvil) */}
                <div className="lg:hidden">
                  <img
                    src={noticia.coverImageUrl || "/placeholder.svg"}
                    alt={noticia.title}
                    className="w-full h-48 object-cover"
                  />
                </div>

                {/* Article Body */}
                <div className="p-6 sm:p-8 lg:p-10">
                  <div
                    className="prose prose-lg dark:prose-invert max-w-none
                      prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                      prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                      prose-a:text-[#ad45ff] prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-gray-900 dark:prose-strong:text-white
                      prose-img:rounded-xl prose-img:shadow-lg"
                    dangerouslySetInnerHTML={{
                      __html: noticia.content.replaceAll("\n", "<br/>"),
                    }}
                  />
                </div>

                {/* Tags / Categories */}
                <div className="px-6 sm:px-8 lg:px-10 pb-8">
                  <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      Deportes
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      Torneos
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      Actualidad
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Author Card */}
              <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
                <div className="flex items-start gap-5">
                  {/* Author Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] p-0.5 shadow-lg shadow-[#ad45ff]/20">
                      <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center">
                        {noticia.user.imageUrl ? (
                          <img
                            src={noticia.user.imageUrl}
                            alt={noticia.user.name || "Autor"}
                            className="w-full h-full rounded-2xl object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-[#ad45ff]" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Author Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {noticia.user.name || "Autor Anónimo"}
                      </h3>
                      <Badge className="bg-[#ad45ff]/10 text-[#ad45ff] border-0 text-xs">
                        Autor
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
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

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              {/* Share Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-[#ad45ff]" />
                  Compartir artículo
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#1DA1F2]/30 text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-all"
                    onClick={() =>
                      globalThis.open(
                        `https://twitter.com/intent/tweet?url=${encodeURIComponent(globalThis.location.href)}&text=${encodeURIComponent(noticia.title)}`,
                        "_blank",
                      )
                    }
                  >
                    <ExternalLink className="w-4 h-4 mr-1.5" />X / Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#4267B2]/30 text-[#4267B2] hover:bg-[#4267B2] hover:text-white hover:border-[#4267B2] transition-all"
                    onClick={() =>
                      globalThis.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(globalThis.location.href)}`,
                        "_blank",
                      )
                    }
                  >
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#0A66C2]/30 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all"
                    onClick={() =>
                      globalThis.open(
                        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(globalThis.location.href)}`,
                        "_blank",
                      )
                    }
                  >
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`transition-all ${copied ? "border-green-500 text-green-500 bg-green-50 dark:bg-green-500/10" : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#ad45ff] hover:text-[#ad45ff]"}`}
                    onClick={handleCopyLink}
                  >
                    <LinkIcon className="w-4 h-4 mr-1.5" />
                    {copied ? "¡Copiado!" : "Copiar"}
                  </Button>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white shadow-lg shadow-[#ad45ff]/25"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </Button>

                {/* Divider */}
                <div className="my-6 border-t border-gray-100 dark:border-gray-800" />

                {/* Article Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    Información del artículo
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Publicado
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {noticia.publishedAt
                          ? formatDate(noticia.publishedAt, "dd/MM/yyyy")
                          : "Sin fecha"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Actualizado
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatDate(noticia.updatedAt, "dd/MM/yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Lectura
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        ~{readingTime} minutos
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a0a2e] via-[#2d1b4e] to-[#1a0a2e] p-8 sm:p-12 lg:p-16">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#ad45ff]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#a3b3ff]/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#c77dff]/10 rounded-full blur-3xl" />

            <div className="relative z-10 text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-white/80">
                <Newspaper className="w-4 h-4" />
                Más contenido para ti
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                ¿Te gustó esta{" "}
                <span className="bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] bg-clip-text text-transparent">
                  noticia
                </span>
                ?
              </h2>

              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Explora más contenido y mantente al día con las últimas
                novedades deportivas de tu comunidad.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/noticias">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white shadow-xl shadow-[#ad45ff]/30 text-lg px-8"
                  >
                    <Newspaper className="w-5 h-5 mr-2" />
                    Ver más noticias
                  </Button>
                </Link>
                <Link href="/torneos">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 text-lg px-8"
                  >
                    <Trophy className="w-5 h-5 mr-2" />
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
