"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  User,
  Share2,
  Clock,
  Eye,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { formatDate } from "@/lib/formatDate";
import { FullscreenLoading } from "@/components/fullscreen-loading";
import { INoticia } from "@/components/noticias/types";
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
          text: noticia.summary,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Navigation */}
      <Header />

      {/* Breadcrumb Navigation */}
      <section className="py-4 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#ad45ff]">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/noticias" className="hover:text-[#ad45ff]">
              Noticias
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium line-clamp-1">
              {noticia.title}
            </span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/noticias">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-[#ad45ff] hover:bg-[#ad45ff]/5"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Noticias
              </Button>
            </Link>
          </div>

          {/* Article Header */}
          <header className="space-y-6 mb-8">
            {/* Category Badge */}
            <div className="flex items-center justify-between">
              <Badge className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white border-0">
                Noticia Destacada
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="border-[#ad45ff] text-[#ad45ff] hover:bg-[#ad45ff] hover:text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 text-balance leading-tight">
              {noticia.title}
            </h1>

            {/* Summary */}
            <p className="text-xl text-gray-600 text-pretty leading-relaxed">
              {noticia.summary}
            </p>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Por {noticia.user.name || "Anónimo"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Publicado el{" "}
                  {noticia.publishedAt
                    ? formatDate(noticia.publishedAt, "dd 'de' MMMM 'de' yyyy")
                    : "Sin fecha"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>
                  Actualizado el{" "}
                  {formatDate(noticia.updatedAt, "dd 'de' MMMM 'de' yyyy")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Lectura de ~5 min</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="mb-8">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={noticia.coverImageUrl || "/placeholder.svg"}
                alt={noticia.title}
                className="w-full h-64 lg:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
              <div
                className="text-gray-700 leading-relaxed space-y-6"
                dangerouslySetInnerHTML={{
                  __html: noticia.content.replace(/\n/g, "<br/>"),
                }}
              />
            </div>
          </div>

          {/* Author Info */}
          <div className="mt-12">
            <Card className="border-2 border-[#ad45ff]/20 bg-gradient-to-r from-[#ad45ff]/5 to-[#a3b3ff]/5">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">
                      {noticia.user.name || "Autor Anónimo"}
                    </h3>
                    <p className="text-gray-600">
                      Periodista deportivo especializado en torneos locales
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Miembro desde{" "}
                      {formatDate(noticia.user.createdAt, "MMMM yyyy")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={handleShare}
              className="border-[#ad45ff] text-[#ad45ff] hover:bg-[#ad45ff] hover:text-white"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Compartir Noticia
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Comentarios
            </Button>
          </div>
        </div>
      </article>

      {/* Related News CTA */}
      <section className="py-16 bg-gradient-to-r from-[#ad45ff]/5 to-[#a3b3ff]/5">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              ¿Te gustó esta noticia?
            </h2>
            <p className="text-lg text-gray-600">
              Explora más contenido y mantente al día con las últimas novedades
              deportivas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/noticias">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white text-lg px-8"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Ver Más Noticias
                </Button>
              </Link>
              <Link href="/torneos">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#ad45ff] text-[#ad45ff] hover:bg-[#ad45ff] hover:text-white text-lg px-8"
                >
                  Explorar Torneos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                GOLAZO
              </span>
            </div>
            <p className="text-gray-400 mb-8">
              La plataforma líder en gestión de torneos deportivos
              profesionales.
            </p>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-400">
                &copy; 2025 GOLAZO. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
