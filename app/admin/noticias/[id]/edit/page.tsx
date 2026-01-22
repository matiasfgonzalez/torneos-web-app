"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

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
import {
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  Upload,
  Calendar,
  Edit,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { INoticia } from "@modules/noticias/types";
import { formatDate } from "@/lib/formatDate";
import { LoadingPage } from "@/components/loading-spinner";

export default function EditNoticia() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [article, setArticle] = useState<INoticia | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    coverImageUrl: "",
    published: false,
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    async function loadArticle() {
      setLoadingArticle(true);
      try {
        const res = await fetch(`/api/noticias/${id}`);

        if (!res.ok) {
          if (res.status === 404) {
            setError("Noticia no encontrada");
            return;
          }
        }

        const data = await res.json();
        setArticle(data);
        setFormData({
          title: data.title || "",
          summary: data.summary || "",
          content: data.content || "",
          coverImageUrl: data.coverImageUrl || "",
          published: data.published || false,
          date:
            data.date?.split("T")[0] || new Date().toISOString().split("T")[0],
        });
      } catch (error) {
        setError(`Error al cargar la noticia: ${error}`);
        toast.error(`Error al cargar la noticia: ${error}`);
      } finally {
        setLoadingArticle(false);
      }
    }

    loadArticle();
  }, [id]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/noticias/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Error al actualizar la noticia");
      }

      toast.success("Noticia actualizada correctamente");
      setHasChanges(false);
    } catch (error) {
      toast.error(`Error al guardar los cambios: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/noticias/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Error al eliminar la noticia");
      }

      toast.success("Noticia eliminada correctamente");
      router.push("/admin/noticias");
    } catch (error) {
      toast.error(`Error al eliminar la noticia: ${error}`);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm("¿Estás seguro? Los cambios no guardados se perderán.")) {
        router.push(`/admin/noticias`);
      }
    } else {
      router.push(`/admin/noticias`);
    }
  };

  if (loadingArticle) {
    return <LoadingPage message="Cargando noticia..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              asChild
              className="text-[#ad45ff] dark:text-[#a3b3ff] hover:bg-[#ad45ff]/10"
            >
              <Link href="/admin/noticias">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a noticias
              </Link>
            </Button>
          </div>
          <Card className="glass-card border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Error al cargar la noticia
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              asChild
              className="text-[#ad45ff] dark:text-[#a3b3ff] hover:bg-[#ad45ff]/10"
            >
              <Link href="/admin/noticias">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a noticias
              </Link>
            </Button>
          </div>
          <Card className="glass-card border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Noticia no encontrada
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                La noticia que intentas editar no existe o ha sido eliminada.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              asChild
              className="text-[#ad45ff] dark:text-[#a3b3ff] hover:bg-[#ad45ff]/10 dark:hover:bg-[#8b39cc]/20"
            >
              <Link href="/admin/noticias">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a noticias
              </Link>
            </Button>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-8 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Editar Noticia
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Modifica la información de la noticia
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Link href={`/noticias/${article.id}`} target="_blank">
                <Eye className="h-4 w-4 mr-2" />
                Vista previa
              </Link>
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
              className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] dark:from-[#8b39cc] dark:to-[#829bd9] hover:from-[#9c3ee6] hover:to-[#92a6ff] dark:hover:from-[#7a32b8] dark:hover:to-[#7189c5] text-white border-0 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card border-0 shadow-xl">
              <CardHeader className="space-y-4 pb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      Información Principal
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Edita el contenido principal de la noticia
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Título *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Título de la noticia"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] text-gray-900 dark:text-white rounded-xl text-lg font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="summary"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Resumen *
                  </Label>
                  <Textarea
                    id="summary"
                    placeholder="Breve resumen que aparecerá en las listas y redes sociales"
                    rows={3}
                    value={formData.summary}
                    onChange={(e) =>
                      handleInputChange("summary", e.target.value)
                    }
                    className="bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] text-gray-900 dark:text-white rounded-xl resize-none"
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.summary.length}/200 caracteres recomendados
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="content"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Contenido *
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Contenido completo de la noticia"
                    rows={20}
                    value={formData.content}
                    onChange={(e) =>
                      handleInputChange("content", e.target.value)
                    }
                    className="min-h-[400px] bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] text-gray-900 dark:text-white rounded-xl resize-none"
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.content.length} caracteres
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publication Settings */}
            <Card className="glass-card border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <Edit className="h-5 w-5 text-[#ad45ff] dark:text-[#a3b3ff]" />
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Configuración de Publicación
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="published"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Estado
                    </Label>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formData.published
                        ? "Visible para todos"
                        : "Solo administradores"}
                    </div>
                  </div>
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) =>
                      handleInputChange("published", checked)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="date"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Fecha de Publicación
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-[#ad45ff] dark:text-[#a3b3ff]" />
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        handleInputChange("date", e.target.value)
                      }
                      className="pl-10 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] text-gray-900 dark:text-white rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cover Image */}
            <Card className="glass-card border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <Upload className="h-5 w-5 text-[#ad45ff] dark:text-[#a3b3ff]" />
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Imagen de Portada
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gray-100 dark:bg-gray-700/50 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                  {formData.coverImageUrl ? (
                    <img
                      src={formData.coverImageUrl || "/placeholder.svg"}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Sin imagen</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="coverImage"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    URL de Imagen
                  </Label>
                  <Input
                    id="coverImage"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={formData.coverImageUrl}
                    onChange={(e) =>
                      handleInputChange("coverImageUrl", e.target.value)
                    }
                    className="bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] text-gray-900 dark:text-white rounded-xl"
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[#ad45ff] hover:text-[#ad45ff] dark:hover:border-[#a3b3ff] dark:hover:text-[#a3b3ff] rounded-xl"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Imagen
                </Button>
              </CardContent>
            </Card>

            {/* Article Info */}
            <Card className="glass-card border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-[#ad45ff] dark:text-[#a3b3ff]" />
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Información del Artículo
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Autor
                  </Label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {article.user.name}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Creado
                  </Label>
                  <div className="text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg font-mono">
                    {formatDate(article.createdAt)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Última Modificación
                  </Label>
                  <div className="text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg font-mono">
                    {formatDate(article.updatedAt)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-lg font-semibold text-red-600 dark:text-red-400">
                    Zona de Peligro
                  </CardTitle>
                </div>
                <CardDescription className="text-red-500 dark:text-red-400">
                  Acciones irreversibles que afectarán permanentemente esta
                  noticia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-xl"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Noticia
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-gray-900 dark:text-white">
                        ¿Estás absolutamente seguro?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                        Esta acción no se puede deshacer. Esto eliminará
                        permanentemente la noticia{" "}
                        <strong className="text-gray-900 dark:text-white">
                          {article.title}
                        </strong>{" "}
                        y todos sus datos asociados.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
                      >
                        Sí, eliminar permanentemente
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Unsaved Changes Warning */}
        {hasChanges && (
          <div className="fixed bottom-4 right-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Tienes cambios sin guardar
              </span>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
                className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9c3ee6] hover:to-[#92a6ff] text-white border-0 rounded-lg"
              >
                <Save className="h-3 w-3 mr-1" />
                Guardar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
