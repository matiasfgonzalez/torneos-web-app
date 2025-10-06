"use client";

import React, { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Edit,
  Trash2,
  Save,
  Eye,
  Calendar,
  User,
  BarChart3,
  Image as ImageIcon,
} from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import { LoadingPage } from "@/components/loading-spinner";
import { INoticia } from "@/components/noticias/types";

export default function AdminNoticiaDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [article, setArticle] = useState<INoticia>();
  const [isEditing, setIsEditing] = useState(false);
  const [editedArticle, setEditedArticle] = useState({
    title: "",
    summary: "",
    content: "",
    coverImageUrl: "",
    published: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (article) {
      setEditedArticle({
        title: article.title,
        summary: article.summary,
        content: article.content,
        coverImageUrl: article.coverImageUrl || "",
        published: article.published,
      });
    }
  }, [article]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/noticias/${id}`)
      .then((res) => res.json())
      .then((data: INoticia) => {
        setArticle(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingPage message="Procesando..." />;
  if (error) return <p>Error al cargar la noticia.</p>;

  const proximamente = true;

  if (!article) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/noticias">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a noticias
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">
              Noticia no encontrada
            </h3>
            <p className="text-muted-foreground">
              La noticia que buscas no existe o ha sido eliminada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    if (!article) return;

    try {
      const res = await fetch(`/api/noticias/${article.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedArticle),
      });

      if (!res.ok) {
        throw new Error("Error al actualizar la noticia");
      }

      const updated = await res.json();

      setArticle(updated); // opcional, actualiza el estado local
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      // Podés mostrar un toast o un mensaje de error
    }
  };

  const handleDelete = () => {
    // Aquí iría la lógica para eliminar el artículo
    console.log("Eliminar artículo:", article.id);
  };

  const togglePublishStatus = () => {
    setEditedArticle({
      ...editedArticle,
      published: !editedArticle.published,
    });
  };

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
                  {isEditing ? "Editar Noticia" : "Ver Noticia"}
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {isEditing
                  ? "Modifica la información de la noticia"
                  : "Detalles completos de la noticia"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="border-[#ad45ff] dark:border-[#8b39cc] text-[#ad45ff] dark:text-[#a3b3ff] hover:bg-[#ad45ff]/10 dark:hover:bg-[#8b39cc]/20"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Link href={`/public/noticias/${article.id}`} target="_blank">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver en sitio
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-gray-900 dark:text-white">
                        ¿Estás seguro?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                        Esta acción no se puede deshacer. Esto eliminará
                        permanentemente la noticia{" "}
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
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] dark:from-[#8b39cc] dark:to-[#829bd9] hover:from-[#9c3ee6] hover:to-[#92a6ff] dark:hover:from-[#7a32b8] dark:hover:to-[#7189c5] text-white border-0"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </>
            )}
          </div>
        </div>

        <Tabs defaultValue="content" className="space-y-4">
          <TabsList className="bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
            <TabsTrigger
              value="content"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white text-gray-700 dark:text-gray-300"
            >
              Contenido
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white text-gray-700 dark:text-gray-300"
            >
              Configuración
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white text-gray-700 dark:text-gray-300"
            >
              Estadísticas
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="space-y-4 pb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-8 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Información Principal
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="title"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Título
                      </Label>
                      {isEditing ? (
                        <Input
                          id="title"
                          value={editedArticle.title}
                          onChange={(e) =>
                            setEditedArticle({
                              ...editedArticle,
                              title: e.target.value,
                            })
                          }
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] text-gray-900 dark:text-white"
                        />
                      ) : (
                        <div className="text-lg font-semibold text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          {article.title}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="summary"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Resumen
                      </Label>
                      {isEditing ? (
                        <Textarea
                          id="summary"
                          rows={3}
                          value={editedArticle.summary}
                          onChange={(e) =>
                            setEditedArticle({
                              ...editedArticle,
                              summary: e.target.value,
                            })
                          }
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] text-gray-900 dark:text-white resize-none"
                        />
                      ) : (
                        <div className="text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 leading-relaxed">
                          {article.summary}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="content"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Contenido
                      </Label>
                      {isEditing ? (
                        <Textarea
                          id="content"
                          rows={15}
                          value={editedArticle.content}
                          onChange={(e) =>
                            setEditedArticle({
                              ...editedArticle,
                              content: e.target.value,
                            })
                          }
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] text-gray-900 dark:text-white resize-none font-mono text-sm"
                        />
                      ) : (
                        <div className="prose prose-gray dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          {article.content
                            .split("\n")
                            .map((paragraph, index) => (
                              <p
                                key={`paragraph-${index}`}
                                className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed"
                              >
                                {paragraph}
                              </p>
                            ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Cover Image */}
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <ImageIcon className="h-5 w-5 text-[#ad45ff] dark:text-[#a3b3ff]" />
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        Imagen de Portada
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-700/50 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                      {(
                        isEditing
                          ? editedArticle.coverImageUrl
                          : article.coverImageUrl
                      ) ? (
                        <img
                          src={
                            isEditing
                              ? editedArticle.coverImageUrl
                              : article.coverImageUrl
                          }
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                          <ImageIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                        </div>
                      )}
                    </div>
                    {isEditing && (
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
                          value={editedArticle.coverImageUrl}
                          onChange={(e) =>
                            setEditedArticle({
                              ...editedArticle,
                              coverImageUrl: e.target.value,
                            })
                          }
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] text-gray-900 dark:text-white"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Publication Status */}
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <Eye className="h-5 w-5 text-[#ad45ff] dark:text-[#a3b3ff]" />
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        Estado de Publicación
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <Label
                        htmlFor="published"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Publicado
                      </Label>
                      {isEditing ? (
                        <Switch
                          id="published"
                          checked={editedArticle.published}
                          onCheckedChange={togglePublishStatus}
                        />
                      ) : (
                        <Badge
                          variant={article.published ? "default" : "outline"}
                          className={
                            article.published
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }
                        >
                          {article.published ? "Publicado" : "Borrador"}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                      {article.published
                        ? "Esta noticia es visible para todos los usuarios"
                        : "Esta noticia solo es visible para administradores"}
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Creado
                        </span>
                        <span className="text-gray-900 dark:text-white font-mono">
                          {formatDate(article.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Actualizado
                        </span>
                        <span className="text-gray-900 dark:text-white font-mono">
                          {formatDate(article.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="space-y-4 pb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Metadatos
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Información adicional sobre la noticia
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-1">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Autor
                      </Label>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <User className="h-5 w-5 text-[#ad45ff] dark:text-[#a3b3ff]" />
                        <span className="text-gray-900 dark:text-white font-medium">
                          {article.user.name}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </Label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700"
                        >
                          {article.user.email}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fecha de Publicación
                      </Label>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <Calendar className="h-5 w-5 text-[#ad45ff] dark:text-[#a3b3ff]" />
                        <span className="text-gray-900 dark:text-white">
                          {article.publishedAt
                            ? formatDate(
                                article.publishedAt,
                                "dd 'de' MMMM yyyy"
                              )
                            : "Sin fecha"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="space-y-4 pb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Fechas del Sistema
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Información de creación y modificación
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Creado
                    </Label>
                    <div className="text-sm text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 font-mono">
                      {article.createdAt
                        ? formatDate(article.createdAt)
                        : "Sin fecha"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Última Modificación
                    </Label>
                    <div className="text-sm text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 font-mono">
                      {article.updatedAt
                        ? formatDate(article.updatedAt)
                        : "Sin fecha"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            {proximamente ? (
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="space-y-4 pb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Próximamente
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Estadísticas y métricas de la noticia
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-full flex items-center justify-center mx-auto">
                      <BarChart3 className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
                      Esta sección estará disponible pronto
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Podrás ver estadísticas detalladas como vistas, tiempo de
                      lectura, interacciones y más.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Total Vistas
                      </CardTitle>
                      <Eye className="h-4 w-4 text-[#ad45ff] dark:text-[#a3b3ff]" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {"article.views.toLocaleString()"}
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        +12% desde ayer
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tiempo de Lectura
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-[#ad45ff] dark:text-[#a3b3ff]" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        8 min
                      </div>
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        Promedio estimado
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Compartidas
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-[#ad45ff] dark:text-[#a3b3ff]" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        23
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        En redes sociales
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="space-y-4 pb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-8 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                          Rendimiento
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          Estadísticas detalladas de la noticia
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Vistas hoy
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white font-semibold">
                          156
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Vistas esta semana
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white font-semibold">
                          892
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Vistas este mes
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white font-semibold">
                          2,847
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tiempo promedio en página
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white font-semibold">
                          4:32 min
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
