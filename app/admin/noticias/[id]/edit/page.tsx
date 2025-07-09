"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
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

// Mock data - en producción vendría de una base de datos
const getArticleById = (id: string) => {
    const article = {
        id: 1,
        title: "Final del Torneo Apertura 2024: Un partido épico",
        summary:
            "El Club Deportivo Águilas se coronó campeón tras vencer 2-1 a Los Leones en una final llena de emociones que se definió en los últimos minutos del encuentro.",
        content: `En una noche que quedará grabada para siempre en la memoria de los aficionados al fútbol local, el Club Deportivo Águilas se coronó campeón del Torneo Apertura 2024 tras vencer 2-1 a Los Leones FC en una final épica disputada en el Estadio Central ante más de 12,000 espectadores.

El encuentro comenzó con un ritmo vertiginoso. Los Leones FC sorprendieron a los 15 minutos con un gol de Miguel Santos, quien aprovechó un error defensivo para abrir el marcador. El Estadio Central se sumió en un silencio sepulcral, pero las Águilas no tardaron en reaccionar.

La respuesta llegó apenas 8 minutos después, cuando Carlos Rodríguez, el máximo goleador del torneo, empató el partido con un cabezazo perfecto tras un centro milimétrico de Gabriel Vega desde la banda derecha.

El segundo tiempo fue un intercambio constante de ataques. Ambos equipos tuvieron oportunidades claras, pero los porteros Antonio López (Águilas) y Fernando García (Leones) estuvieron inspirados.

Cuando parecía que el partido se definiría en los penales, llegó el momento mágico. A los 87 minutos, en una jugada que comenzó en campo propio, las Águilas construyeron una jugada colectiva perfecta que terminó con Andrés Castro definiendo con clase ante la salida desesperada del portero rival.`,
        coverImageUrl: "/placeholder.svg?height=400&width=800",
        published: true,
        date: "2024-01-15",
        author: "Carlos Mendoza",
        views: 2847,
        category: "Resultados",
        createdAt: "2024-01-15T20:30:00Z",
        updatedAt: "2024-01-15T21:15:00Z"
    };

    return article;
};

const categories = [
    "Resultados",
    "Estadísticas",
    "Anuncios",
    "Entrevistas",
    "Reglamento",
    "Fichajes",
    "Lesiones",
    "Eventos"
];

export default function EditNoticia({ params }: { params: { id: string } }) {
    const router = useRouter();
    const article = getArticleById(params.id);

    const [formData, setFormData] = useState({
        title: article?.title || "",
        summary: article?.summary || "",
        content: article?.content || "",
        coverImageUrl: article?.coverImageUrl || "",
        published: article?.published || false,
        category: article?.category || "Resultados",
        date: article?.date || new Date().toISOString().split("T")[0]
    });

    const [isLoading, setIsLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

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

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Aquí iría la lógica para guardar en la base de datos
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Simular API call

            console.log("Guardando cambios:", formData);
            toast.success("Noticia actualizada correctamente");
            setHasChanges(false);
            router.push(`/admin/noticias/${params.id}`);
        } catch (error) {
            toast.error("Error al guardar los cambios");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            // Aquí iría la lógica para eliminar de la base de datos
            console.log("Eliminando artículo:", article.id);
            toast.success("Noticia eliminada correctamente");
            router.push("/admin/noticias");
        } catch (error) {
            toast.error("Error al eliminar la noticia");
        }
    };

    const handleCancel = () => {
        if (hasChanges) {
            if (
                confirm("¿Estás seguro? Los cambios no guardados se perderán.")
            ) {
                router.push(`/admin/noticias/${params.id}`);
            }
        } else {
            router.push(`/admin/noticias/${params.id}`);
        }
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
                                <Label htmlFor="category">Categoría</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) =>
                                        handleInputChange("category", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category}
                                                value={category}
                                            >
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                <div className="text-sm">{article.author}</div>
                            </div>

                            <div className="space-y-2">
                                <Label>Vistas Actuales</Label>
                                <div className="text-sm font-medium">
                                    {article.views.toLocaleString()}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Creado</Label>
                                <div className="text-sm text-muted-foreground">
                                    {new Date(
                                        article.createdAt
                                    ).toLocaleString()}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Última Modificación</Label>
                                <div className="text-sm text-muted-foreground">
                                    {new Date(
                                        article.updatedAt
                                    ).toLocaleString()}
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
                                            noticia "
                                            <strong>{article.title}</strong>" y
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
