"use client";

import { useState } from "react";
import {
  Share2,
  Calendar,
  Clock,
  BookOpen,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatDate";

/**
 * Barra lateral de la ficha de noticia: compartir + info del artículo. Es el
 * único trozo interactivo (share nativo, copiar link, abrir redes con
 * `window`), aislado en un client component para que `page.tsx` sea Server
 * Component y Next fije el 404 correcto en las noticias inexistentes.
 */
export function ShareCard({
  title,
  publishedAt,
  updatedAt,
  readingTime,
}: Readonly<{
  title: string;
  publishedAt: Date | string | null;
  updatedAt: Date | string;
  readingTime: number;
}>) {
  const [copied, setCopied] = useState(false);

  const currentUrl = () =>
    typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: currentUrl() });
      } catch {
        // Usuario canceló el share nativo — no es un error
      }
    } else {
      handleCopyLink();
    }
  };

  const openShare = (url: string) => globalThis.open(url, "_blank");

  return (
    <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900 dark:text-white">
        <Share2 className="h-5 w-5 text-brand" />
        Compartir artículo
      </h3>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="sm"
          className="border-[#1DA1F2]/30 text-[#1DA1F2] transition-all hover:border-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white"
          onClick={() =>
            openShare(
              `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl())}&text=${encodeURIComponent(title)}`,
            )
          }
        >
          <ExternalLink className="mr-1.5 h-4 w-4" />X / Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-[#4267B2]/30 text-[#4267B2] transition-all hover:border-[#4267B2] hover:bg-[#4267B2] hover:text-white"
          onClick={() =>
            openShare(
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl())}`,
            )
          }
        >
          <ExternalLink className="mr-1.5 h-4 w-4" />
          Facebook
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-[#0A66C2]/30 text-[#0A66C2] transition-all hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white"
          onClick={() =>
            openShare(
              `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl())}`,
            )
          }
        >
          <ExternalLink className="mr-1.5 h-4 w-4" />
          LinkedIn
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`transition-all ${copied ? "border-green-500 bg-green-50 text-green-500 dark:bg-green-500/10" : "border-gray-300 text-gray-600 hover:border-brand hover:text-brand dark:border-gray-700 dark:text-gray-400"}`}
          onClick={handleCopyLink}
        >
          <LinkIcon className="mr-1.5 h-4 w-4" />
          {copied ? "¡Copiado!" : "Copiar"}
        </Button>
      </div>

      <Button
        className="w-full bg-gradient-to-r from-brand to-brand-2 text-white shadow-lg shadow-brand/25 hover:from-brand-hover hover:to-brand-2-hover"
        onClick={handleShare}
      >
        <Share2 className="mr-2 h-4 w-4" />
        Compartir
      </Button>

      <div className="my-6 border-t border-gray-100 dark:border-gray-800" />

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Información del artículo
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              Publicado
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {publishedAt ? formatDate(publishedAt, "dd/MM/yyyy") : "Sin fecha"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              Actualizado
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatDate(updatedAt, "dd/MM/yyyy")}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <BookOpen className="h-4 w-4" />
              Lectura
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              ~{readingTime} minutos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
