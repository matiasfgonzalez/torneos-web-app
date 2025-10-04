"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, User, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { formatDate } from "@/lib/formatDate";
import { FullscreenLoading } from "@/components/fullscreen-loading";
import { INoticia } from "@/components/noticias/types";

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<INoticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/noticias", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch noticias");
        }

        const data = await response.json();
        setNoticias(data);
      } catch (err) {
        console.error("Error fetching noticias:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, []);

  const noticiasFiltradas = noticias.filter((noticia) => {
    const matchesSearch =
      noticia.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      noticia.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      noticia.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      noticia.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return <FullscreenLoading isVisible={true} message="Cargando noticias" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Navigation */}
      <Header />

      {/* Header Section */}
      <section className="py-16 bg-gradient-to-r from-[#ad45ff]/5 to-[#a3b3ff]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <Badge className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white border-0">
              Últimas Noticias
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 text-balance">
              Centro de{" "}
              <span className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                Noticias
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
              Mantente informado con las últimas novedades, resultados y
              análisis del mundo de los torneos deportivos.
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar noticias por título, contenido o autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-[#ad45ff]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Noticias Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {noticiasFiltradas.length} Noticia
              {noticiasFiltradas.length !== 1 ? "s" : ""} Encontrada
              {noticiasFiltradas.length !== 1 ? "s" : ""}
            </h2>
            <div className="text-sm text-gray-600">
              Mostrando resultados para {searchTerm || "todas las noticias"}
            </div>
          </div>

          {noticiasFiltradas.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron noticias
              </h3>
              <p className="text-gray-600">
                Intenta con otros términos de búsqueda.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {noticiasFiltradas.map((noticia) => (
                <article
                  key={noticia.id}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100"
                >
                  <div className="relative">
                    <img
                      src={noticia.coverImageUrl || "/placeholder.svg"}
                      alt={noticia.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white border-0">
                        {noticia.user.name || "Anónimo"}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {noticia.publishedAt
                            ? formatDate(noticia.publishedAt, "dd/MM/yyyy")
                            : "Sin fecha"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{noticia.user.name || "Anónimo"}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#ad45ff] transition-colors line-clamp-2">
                      {noticia.title}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-3">
                      {noticia.summary}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-400">
                        Actualizada:{" "}
                        {formatDate(noticia.updatedAt, "dd/MM/yyyy")}
                      </div>
                      <Link href={`/noticias/${noticia.id}`}>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Leer más
                        </Button>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white text-balance">
              ¿Tienes una Historia que Contar?
            </h2>
            <p className="text-xl text-white/90 text-pretty">
              Comparte las últimas noticias y mantén a la comunidad informada
              sobre todo lo que sucede en el mundo deportivo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-[#ad45ff] hover:bg-gray-100 text-lg px-8"
              >
                Publicar Noticia
              </Button>
              <Link href="/torneos">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#ad45ff] text-lg px-8 bg-transparent"
                >
                  Ver Torneos
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
