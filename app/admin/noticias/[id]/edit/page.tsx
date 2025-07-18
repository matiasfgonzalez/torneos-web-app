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
    CardTitle
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
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Save, Eye, Trash2, Upload, Calendar } from "lucide-react";
import { toast } from "sonner";
import { INoticia } from "@/components/noticias/types";
import { formatDate } from "@/lib/formatDate";

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
        date: new Date().toISOString().split("T")[0]
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
                        data.date?.split("T")[0] ||
                        new Date().toISOString().split("T")[0]
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
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
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
                method: "DELETE"
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
            if (
                confirm("¿Estás seguro? Los cambios no guardados se perderán.")
            ) {
                router.push(`/admin/noticias`);
            }
        } else {
            router.push(`/admin/noticias`);
        }
    };

    if (loadingArticle) {
        return <p className="text-center">Cargando noticia...</p>;
    }

    if (error) {
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
                            Error al cargar la noticia
                        </h3>
                        <p className="text-muted-foreground">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                            La noticia que intentas editar no existe o ha sido
                            eliminada.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                            Editar Noticia
                        </h2>
                        <p className="text-muted-foreground">
                            Modifica la información de la noticia
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={handleCancel}>
                        Cancelar
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={`/noticias/${article.id}`} target="_blank">
                            <Eye className="h-4 w-4 mr-2" />
                            Vista previa
                        </Link>
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading || !hasChanges}
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Principal</CardTitle>
                            <CardDescription>
                                Edita el contenido principal de la noticia
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título *</Label>
                                <Input
                                    id="title"
                                    placeholder="Título de la noticia"
                                    value={formData.title}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "title",
                                            e.target.value
                                        )
                                    }
                                    className="text-lg font-semibold"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="summary">Resumen *</Label>
                                <Textarea
                                    id="summary"
                                    placeholder="Breve resumen que aparecerá en las listas y redes sociales"
                                    rows={3}
                                    value={formData.summary}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "summary",
                                            e.target.value
                                        )
                                    }
                                />
                                <div className="text-xs text-muted-foreground">
                                    {formData.summary.length}/200 caracteres
                                    recomendados
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Contenido *</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Contenido completo de la noticia"
                                    rows={20}
                                    value={formData.content}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "content",
                                            e.target.value
                                        )
                                    }
                                    className="min-h-[400px]"
                                />
                                <div className="text-xs text-muted-foreground">
                                    {formData.content.length} caracteres
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Publication Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración de Publicación</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="published">Estado</Label>
                                    <div className="text-sm text-muted-foreground">
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
                                <Label htmlFor="date">
                                    Fecha de Publicación
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "date",
                                                e.target.value
                                            )
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cover Image */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Imagen de Portada</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                                {formData.coverImageUrl ? (
                                    <img
                                        src={
                                            formData.coverImageUrl ||
                                            "/placeholder.svg"
                                        }
                                        alt="Cover preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        <div className="text-center">
                                            <Upload className="h-8 w-8 mx-auto mb-2" />
                                            <p className="text-sm">
                                                Sin imagen
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="coverImage">
                                    URL de Imagen
                                </Label>
                                <Input
                                    id="coverImage"
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    value={formData.coverImageUrl}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "coverImageUrl",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            <Button
                                variant="outline"
                                className="w-full bg-transparent"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Subir Imagen
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Article Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Artículo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Autor</Label>
                                <div className="text-sm">
                                    {article.user.name}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Creado</Label>
                                <div className="text-sm text-muted-foreground">
                                    {formatDate(article.createdAt)}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Última Modificación</Label>
                                <div className="text-sm text-muted-foreground">
                                    {formatDate(article.updatedAt)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle className="text-destructive">
                                Zona de Peligro
                            </CardTitle>
                            <CardDescription>
                                Acciones irreversibles que afectarán
                                permanentemente esta noticia
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Eliminar Noticia
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            ¿Estás absolutamente seguro?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer.
                                            Esto eliminará permanentemente la
                                            noticia{" "}
                                            <strong>{article.title}</strong> y
                                            todos sus datos asociados.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancelar
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
                <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-yellow-800">
                            Tienes cambios sin guardar
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
