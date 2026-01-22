"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  FileText,
  ImageIcon,
} from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import { LoadingPage } from "@/components/loading-spinner";
import { INoticia } from "@modules/noticias/types";
import { toast } from "sonner";

export default function AdminNoticias() {
  const [noticias, setNoticias] = useState<INoticia[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: "",
    summary: "",
    content: "",
    coverImageUrl: "",
    published: false,
  });

  useEffect(() => {
    setLoading(true); // ✅ activar loading al inicio
    fetch("/api/noticias")
      .then((res) => res.json())
      .then((data) => {
        setNoticias(data);
        setLoading(false); // ✅ desactivar al terminar
      })
      .catch(() => {
        setLoading(false); // también desactivar en caso de error
      });
  }, []);

  const filteredNews = noticias.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedNews = [...filteredNews].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const getStatusBadge = (published: boolean) => {
    return published ? (
      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
        Publicado
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20"
      >
        Borrador
      </Badge>
    );
  };

  const handleCreateArticle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/noticias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newArticle),
      });

      if (!res.ok) throw new Error("Error al crear noticia");

      const data = await res.json();
      setNoticias((prev) => [...prev, data]);
      setIsCreateDialogOpen(false);
      setNewArticle({
        title: "",
        summary: "",
        content: "",
        coverImageUrl: "",
        published: false,
      });
    } catch (err) {
      console.error(err);
      // Podés agregar notificación o alerta aquí
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      const res = await fetch(`/api/noticias/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar la noticia");

      setNoticias((prev) => prev.filter((n) => n.id !== id));
      toast.success("Noticia eliminada correctamente");
    } catch (error) {
      toast.error(`Error al eliminar la noticia: ${error}`);
    }
  };

  const togglePublishStatus = async (id: string) => {
    const article = noticias.find((n) => n.id === id);
    if (!article) return;

    try {
      const res = await fetch(`/api/noticias/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...article,
          published: !article.published,
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar estado");

      const updated = await res.json();
      setNoticias((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingPage message="Cargando noticias..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-8 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Gestión de Noticias
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Administra todas las noticias y artículos de la plataforma
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] dark:from-[#8b39cc] dark:to-[#829bd9] hover:from-[#9c3ee6] hover:to-[#92a6ff] dark:hover:from-[#7a32b8] dark:hover:to-[#7189c5] text-white border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 rounded-2xl px-8 py-6 text-base font-semibold">
                <Plus className="mr-2 h-5 w-5" />
                Nueva Noticia
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
              {/* Header con gradiente */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#ad45ff] via-[#a3b3ff] to-[#ad45ff] rounded-t-2xl" />

              <DialogHeader className="space-y-4 pt-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center shadow-lg">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      Crear Nueva Noticia
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-300 text-base">
                      Completa la información del artículo para publicarlo en
                      GOLAZO
                    </DialogDescription>
                  </div>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-600 to-transparent" />
              </DialogHeader>
              <div className="grid gap-6 py-6 px-1">
                {/* Título */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                    <Label
                      htmlFor="title"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      Título del Artículo
                    </Label>
                  </div>
                  <Input
                    id="title"
                    placeholder="Ingresa un título llamativo para tu noticia..."
                    value={newArticle.title}
                    onChange={(e) =>
                      setNewArticle({
                        ...newArticle,
                        title: e.target.value,
                      })
                    }
                    className="h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl transition-all duration-200"
                  />
                </div>

                {/* Resumen */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                    <Label
                      htmlFor="summary"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      Resumen Ejecutivo
                    </Label>
                  </div>
                  <Textarea
                    id="summary"
                    placeholder="Escribe un resumen atractivo que capture la esencia de la noticia..."
                    rows={3}
                    value={newArticle.summary}
                    onChange={(e) =>
                      setNewArticle({
                        ...newArticle,
                        summary: e.target.value,
                      })
                    }
                    className="bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl resize-none transition-all duration-200"
                  />
                </div>

                {/* Contenido */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                    <Label
                      htmlFor="content"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      Contenido Completo
                    </Label>
                  </div>
                  <Textarea
                    id="content"
                    placeholder="Desarrolla aquí el contenido completo de la noticia..."
                    rows={8}
                    value={newArticle.content}
                    onChange={(e) =>
                      setNewArticle({
                        ...newArticle,
                        content: e.target.value,
                      })
                    }
                    className="bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl resize-none transition-all duration-200"
                  />
                </div>

                {/* Imagen de portada */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                    <Label
                      htmlFor="coverImage"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      Imagen de Portada
                    </Label>
                  </div>
                  <div className="space-y-3">
                    <Input
                      id="coverImage"
                      placeholder="https://ejemplo.com/imagen-noticia.jpg"
                      value={newArticle.coverImageUrl}
                      onChange={(e) =>
                        setNewArticle({
                          ...newArticle,
                          coverImageUrl: e.target.value,
                        })
                      }
                      className="h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl transition-all duration-200"
                    />
                    {newArticle.coverImageUrl && (
                      <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-lg">
                        <img
                          src={newArticle.coverImageUrl}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                          Vista previa
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estado de publicación */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Configuración de Publicación
                    </Label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="published"
                        checked={newArticle.published}
                        onCheckedChange={(checked) =>
                          setNewArticle({
                            ...newArticle,
                            published: checked,
                          })
                        }
                      />
                      <div>
                        <Label
                          htmlFor="published"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                        >
                          Publicar inmediatamente
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {newArticle.published
                            ? "La noticia será visible para todos los usuarios"
                            : "Se guardará como borrador para editar más tarde"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Footer con botones mejorados */}
              <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200 dark:border-gray-600">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Los campos marcados son obligatorios para la publicación
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl font-medium transition-all duration-200"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateArticle}
                    disabled={
                      !newArticle.title.trim() || !newArticle.content.trim()
                    }
                    className="px-8 py-2.5 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] dark:from-[#8b39cc] dark:to-[#829bd9] hover:from-[#9c3ee6] hover:to-[#92a6ff] dark:hover:from-[#7a32b8] dark:hover:to-[#7189c5] text-white border-0 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {newArticle.published
                      ? "Crear y Publicar"
                      : "Guardar Borrador"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-2 border-[#ad45ff]/20 dark:border-[#8b39cc]/30 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Noticias
              </CardTitle>
              <div className="w-8 h-8 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {noticias.length}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Artículos en total
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-green-200 dark:border-green-800 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Publicadas
              </CardTitle>
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Eye className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {noticias.filter((n) => n.published).length}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Visibles al público
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-orange-200 dark:border-orange-800 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Borradores
              </CardTitle>
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <Edit className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {noticias.filter((n) => !n.published).length}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                En desarrollo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* News Table */}
        <Card className="border-2 border-[#ad45ff]/20 dark:border-[#8b39cc]/30 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Lista de Noticias
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Gestiona todas las noticias y artículos publicados
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  placeholder="Buscar noticias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="rounded-xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden">
              <Table>
                <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                  <TableRow className="border-b dark:border-gray-700">
                    <TableHead className="text-gray-900 dark:text-white font-semibold">
                      Noticia
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white font-semibold">
                      Fecha
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white font-semibold">
                      Estado
                    </TableHead>
                    <TableHead className="text-right text-gray-900 dark:text-white font-semibold">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedNews.map((article) => (
                    <TableRow
                      key={article.id}
                      className="border-b dark:border-gray-700 hover:bg-gray-50/80 dark:hover:bg-gray-700/50"
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600">
                            {article.coverImageUrl ? (
                              <img
                                src={article.coverImageUrl}
                                alt={article.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                            )}
                          </div>
                          <div className="max-w-xs">
                            <div className="font-medium line-clamp-1 text-gray-900 dark:text-white">
                              {article.title}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {article.summary}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <Calendar className="mr-1 h-4 w-4 text-[#ad45ff]" />
                          {article.publishedAt
                            ? formatDate(article.publishedAt)
                            : "Sin fecha"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => togglePublishStatus(article.id)}
                          className="cursor-pointer"
                        >
                          {getStatusBadge(article.published)}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Link href={`/admin/noticias/${article.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <Link href={`/admin/noticias/${article.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-gray-900 dark:text-white">
                                  ¿Estás seguro?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                                  Esta acción no se puede deshacer. Esto
                                  eliminará permanentemente la noticia{" "}
                                  <strong className="text-gray-900 dark:text-white">
                                    {article.title}
                                  </strong>
                                  .
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteArticle(article.id)
                                  }
                                  className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
