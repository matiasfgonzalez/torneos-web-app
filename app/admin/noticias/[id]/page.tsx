"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
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
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
    ArrowLeft,
    Edit,
    Trash2,
    Save,
    Eye,
    Calendar,
    User,
    BarChart3
} from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import { LoadingPage } from "@/components/loading-spinner";
import { INoticia } from "@/components/noticias/types";

export default function AdminNoticiaDetail({
    params
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
        published: false
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
                published: article.published
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
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(editedArticle)
            });

            if (!res.ok) {
                throw new Error("Error al actualizar la noticia");
            }

            const updated = await res.json();
            console.log("Noticia actualizada:", updated);

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
            published: !editedArticle.published
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" asChild>
                        <Link href="/admin/noticias">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a noticias
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            {isEditing ? "Editar Noticia" : "Ver Noticia"}
                        </h2>
                        <p className="text-muted-foreground">
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
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Button>
                            <Button variant="outline" asChild>
                                <Link
                                    href={`/public/noticias/${article.id}`}
                                    target="_blank"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver en sitio
                                </Link>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Eliminar
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            ¿Estás seguro?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer.
                                            Esto eliminará permanentemente la
                                            noticia{" "}
                                            <strong>{article.title}</strong>.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancelar
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
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
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleSave}>
                                <Save className="h-4 w-4 mr-2" />
                                Guardar
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <Tabs defaultValue="content" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="content">Contenido</TabsTrigger>
                    <TabsTrigger value="settings">Configuración</TabsTrigger>
                    <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                </TabsList>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información Principal</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Título</Label>
                                        {isEditing ? (
                                            <Input
                                                id="title"
                                                value={editedArticle.title}
                                                onChange={(e) =>
                                                    setEditedArticle({
                                                        ...editedArticle,
                                                        title: e.target.value
                                                    })
                                                }
                                            />
                                        ) : (
                                            <div className="text-lg font-semibold">
                                                {article.title}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="summary">Resumen</Label>
                                        {isEditing ? (
                                            <Textarea
                                                id="summary"
                                                rows={3}
                                                value={editedArticle.summary}
                                                onChange={(e) =>
                                                    setEditedArticle({
                                                        ...editedArticle,
                                                        summary: e.target.value
                                                    })
                                                }
                                            />
                                        ) : (
                                            <div className="text-muted-foreground">
                                                {article.summary}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="content">
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
                                                        content: e.target.value
                                                    })
                                                }
                                            />
                                        ) : (
                                            <div className="prose max-w-none">
                                                {article.content
                                                    .split("\n")
                                                    .map((paragraph, index) => (
                                                        <p
                                                            key={index}
                                                            className="mb-4"
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
                            <Card>
                                <CardHeader>
                                    <CardTitle>Imagen de Portada</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
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
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                Sin imagen
                                            </div>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <div className="space-y-2">
                                            <Label htmlFor="coverImage">
                                                URL de Imagen
                                            </Label>
                                            <Input
                                                id="coverImage"
                                                placeholder="https://ejemplo.com/imagen.jpg"
                                                value={
                                                    editedArticle.coverImageUrl
                                                }
                                                onChange={(e) =>
                                                    setEditedArticle({
                                                        ...editedArticle,
                                                        coverImageUrl:
                                                            e.target.value
                                                    })
                                                }
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Publication Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Estado de Publicación</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="published">
                                            Publicado
                                        </Label>
                                        {isEditing ? (
                                            <Switch
                                                id="published"
                                                checked={
                                                    editedArticle.published
                                                }
                                                onCheckedChange={
                                                    togglePublishStatus
                                                }
                                            />
                                        ) : (
                                            <Badge
                                                variant={
                                                    article.published
                                                        ? "default"
                                                        : "outline"
                                                }
                                            >
                                                {article.published
                                                    ? "Publicado"
                                                    : "Borrador"}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {article.published
                                            ? "Esta noticia es visible para todos los usuarios"
                                            : "Esta noticia solo es visible para administradores"}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Metadatos</CardTitle>
                            <CardDescription>
                                Información adicional sobre la noticia
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Autor</Label>
                                    <div className="flex items-center">
                                        <User className="mr-2 h-4 w-4" />
                                        {article.user.name}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Badge variant="outline">
                                        {article.user.email}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <Label>Fecha de Publicación</Label>
                                    <div className="flex items-center">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {article.date
                                            ? formatDate(article.date)
                                            : "Sin fecha"}
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Creado</Label>
                                    <div className="text-sm text-muted-foreground">
                                        {article.createdAt
                                            ? formatDate(article.createdAt)
                                            : "Sin fecha"}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Última Modificación</Label>
                                    <div className="text-sm text-muted-foreground">
                                        {article.updatedAt
                                            ? formatDate(article.updatedAt)
                                            : "Sin fecha"}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Stats Tab */}

                <TabsContent value="stats" className="space-y-6">
                    {proximamente ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Próximamente</CardTitle>
                                <CardDescription>
                                    Estadísticas y métricas de la noticia
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center py-8">
                                <p className="text-lg text-muted-foreground">
                                    Esta sección estará disponible pronto.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="grid gap-4 md:grid-cols-3">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Total Vistas
                                        </CardTitle>
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {"article.views.toLocaleString()"}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            +12% desde ayer
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Tiempo de Lectura
                                        </CardTitle>
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            8 min
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Promedio estimado
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Compartidas
                                        </CardTitle>
                                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            23
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            En redes sociales
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Rendimiento</CardTitle>
                                    <CardDescription>
                                        Estadísticas detalladas de la noticia
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">
                                                Vistas hoy
                                            </span>
                                            <span className="text-sm">156</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">
                                                Vistas esta semana
                                            </span>
                                            <span className="text-sm">892</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">
                                                Vistas este mes
                                            </span>
                                            <span className="text-sm">
                                                2,847
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">
                                                Tiempo promedio en página
                                            </span>
                                            <span className="text-sm">
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
    );
}
