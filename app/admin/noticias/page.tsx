"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/DataTable";
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
  Filter,
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
import { CloudinaryUpload } from "@/components/ui/cloudinary-upload";

export default function AdminNoticias() {
  const [noticias, setNoticias] = useState<INoticia[]>([]);
  // Arranca en true: la carga inicial ya está en curso en el primer render, así
  // no hace falta un setState en el cuerpo del effect (set-state-in-effect) ni
  // se ve la tabla vacía un frame antes de que llegue la respuesta.
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: "",
    summary: "",
    content: "",
    coverImageUrl: "",
    coverImagePublicId: "",
    published: false,
  });

  useEffect(() => {
    fetch("/api/noticias")
      .then((res) => res.json())
      .then((data) => {
        setNoticias(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Orden por defecto: más recientes primero. El DataTable permite reordenar
  // por columna encima de esto.
  const sortedNews = [...noticias].sort(
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
        coverImagePublicId: "",
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

  // Funciones de render, no componentes: declarar un componente dentro del
  // render lo remontaría en cada render (react-hooks/static-components).
  const renderRowActions = (article: INoticia) => (
    <>
      <Button
        variant="outline"
        size="sm"
        asChild
        title="Ver noticia"
        className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
      >
        <Link href={`/admin/noticias/${article.id}`}>
          <Eye className="h-4 w-4" />
          <span className="sr-only">Ver {article.title}</span>
        </Link>
      </Button>
      <Button
        variant="outline"
        size="sm"
        asChild
        title="Editar noticia"
        className="border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
      >
        <Link href={`/admin/noticias/${article.id}/edit`}>
          <Edit className="h-4 w-4" />
          <span className="sr-only">Editar {article.title}</span>
        </Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            title="Eliminar noticia"
            className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar {article.title}</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">
              ¿Estás seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la noticia{" "}
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
              onClick={() => handleDeleteArticle(article.id)}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  const newsColumns: DataTableColumn<INoticia>[] = [
    {
      id: "article",
      header: "Noticia",
      sortValue: (a) => a.title,
      cell: (article) => (
        <div className="flex items-center space-x-3">
          <div className="w-16 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600 shrink-0">
            {article.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.coverImageUrl}
                alt=""
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
      ),
    },
    {
      id: "publishedAt",
      header: "Fecha",
      sortValue: (a) => (a.publishedAt ? new Date(a.publishedAt).getTime() : 0),
      cell: (article) => (
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Calendar className="mr-1 h-4 w-4 text-brand shrink-0" />
          {article.publishedAt ? formatDate(article.publishedAt) : "Sin fecha"}
        </div>
      ),
    },
    {
      id: "status",
      header: "Estado",
      sortValue: (a) => (a.published ? 0 : 1),
      cell: (article) => (
        <button
          type="button"
          onClick={() => togglePublishStatus(article.id)}
          className="cursor-pointer"
          title={article.published ? "Pasar a borrador" : "Publicar"}
        >
          {getStatusBadge(article.published)}
        </button>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      align: "right",
      hideOnCard: true,
      cell: (article) => (
        <div className="flex justify-end space-x-2">
          {renderRowActions(article)}
        </div>
      ),
    },
  ];

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
              <div className="w-1 h-8 bg-gradient-to-b from-brand to-brand-2 rounded-full" />
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
              <Button className="bg-gradient-to-r from-brand to-brand-2 dark:from-brand dark:to-brand-2 hover:from-brand-hover hover:to-brand-2 dark:hover:from-brand-hover dark:hover:to-brand-2 text-white border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 rounded-2xl px-8 py-6 text-base font-semibold">
                <Plus className="mr-2 h-5 w-5" />
                Nueva Noticia
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
              {/* Header con gradiente */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand via-brand-2 to-brand rounded-t-2xl" />

              <DialogHeader className="space-y-4 pt-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-2 rounded-xl flex items-center justify-center shadow-lg">
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
                    <div className="w-1 h-5 bg-gradient-to-b from-brand to-brand-2 rounded-full" />
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
                    className="h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-brand dark:focus:border-brand-2 focus:ring-2 focus:ring-brand/20 dark:focus:ring-brand-2/20 text-gray-900 dark:text-white rounded-xl transition-all duration-200"
                  />
                </div>

                {/* Resumen */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-brand to-brand-2 rounded-full" />
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
                    className="bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-brand dark:focus:border-brand-2 focus:ring-2 focus:ring-brand/20 dark:focus:ring-brand-2/20 text-gray-900 dark:text-white rounded-xl resize-none transition-all duration-200"
                  />
                </div>

                {/* Contenido */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-brand to-brand-2 rounded-full" />
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
                    className="bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-brand dark:focus:border-brand-2 focus:ring-2 focus:ring-brand/20 dark:focus:ring-brand-2/20 text-gray-900 dark:text-white rounded-xl resize-none transition-all duration-200"
                  />
                </div>

                {/* Imagen de portada */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-brand to-brand-2 rounded-full" />
                    <Label
                      htmlFor="coverImage"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      Imagen de Portada
                    </Label>
                  </div>
                  <CloudinaryUpload
                    folder="noticias/covers"
                    value={newArticle.coverImageUrl || null}
                    publicId={newArticle.coverImagePublicId || null}
                    onChange={(url, publicId) =>
                      setNewArticle({
                        ...newArticle,
                        coverImageUrl: url || "",
                        coverImagePublicId: publicId || "",
                      })
                    }
                    placeholder="Arrastra la imagen o haz clic para seleccionar"
                  />
                </div>

                {/* Estado de publicación */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-brand to-brand-2 rounded-full" />
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
                    className="px-8 py-2.5 bg-gradient-to-r from-brand to-brand-2 dark:from-brand dark:to-brand-2 hover:from-brand-hover hover:to-brand-2 dark:hover:from-brand-hover dark:hover:to-brand-2 text-white border-0 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
          <Card className="border-2 border-brand/20 dark:border-brand/30 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Noticias
              </CardTitle>
              <div className="w-8 h-8 bg-gradient-to-r from-brand to-brand-2 rounded-lg flex items-center justify-center">
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

        {/* Lista de noticias — DataTable común (F3) */}
        <DataTable
          rows={sortedNews}
          columns={newsColumns}
          getRowKey={(a) => a.id}
          icon={FileText}
          title="Lista de Noticias"
          description="Gestiona todas las noticias y artículos publicados"
          searchable={{
            placeholder: "Buscar noticias...",
            getText: (a) => `${a.title} ${a.summary}`,
          }}
          filters={[
            {
              id: "published",
              label: "Estado",
              icon: Filter,
              options: [
                { value: "all", label: "Todas" },
                { value: "published", label: "Publicadas" },
                { value: "draft", label: "Borradores" },
              ],
              test: (a, value) =>
                value === "published" ? a.published : !a.published,
            },
          ]}
          empty={{
            icon: FileText,
            title: "Todavía no hay noticias",
            description: "Creá tu primera noticia para comenzar.",
            filteredTitle: "No se encontraron noticias",
            filteredDescription:
              "Ninguna noticia coincide con los filtros aplicados.",
          }}
          rowActions={renderRowActions}
        />
      </div>
    </div>
  );
}
