"use client";

import { useEffect, useState } from "react";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
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
    AlertDialogTrigger
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
    ImageIcon
} from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import { LoadingPage } from "@/components/loading-spinner";

export interface INoticia {
    id: string;
    title: string;
    summary: string;
    content: string;
    coverImageUrl: string;
    published: boolean;
    date: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

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
        published: false
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
            article.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedNews = [...filteredNews].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const getStatusBadge = (published: boolean) => {
        return published ? (
            <Badge variant="default">Publicado</Badge>
        ) : (
            <Badge variant="outline">Borrador</Badge>
        );
    };

    const handleCreateArticle = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/noticias", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newArticle)
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
                published: false
            });
        } catch (err) {
            console.error(err);
            // Podés agregar notificación o alerta aquí
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteArticle = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar esta noticia?")) return;

        try {
            const res = await fetch(`/api/noticias/${id}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Error al eliminar");

            setNoticias((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const togglePublishStatus = async (id: string) => {
        const article = noticias.find((n) => n.id === id);
        if (!article) return;

        try {
            const res = await fetch(`/api/noticias/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...article,
                    published: !article.published
                })
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Gestión de Noticias
                    </h2>
                    <p className="text-muted-foreground">
                        Administra todas las noticias y artículos de la
                        plataforma
                    </p>
                </div>
                <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                >
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Noticia
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Crear Nueva Noticia</DialogTitle>
                            <DialogDescription>
                                Completa la información del artículo
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Título</Label>
                                <Input
                                    id="title"
                                    placeholder="Título de la noticia"
                                    value={newArticle.title}
                                    onChange={(e) =>
                                        setNewArticle({
                                            ...newArticle,
                                            title: e.target.value
                                        })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="summary">Resumen</Label>
                                <Textarea
                                    id="summary"
                                    placeholder="Breve resumen de la noticia"
                                    rows={3}
                                    value={newArticle.summary}
                                    onChange={(e) =>
                                        setNewArticle({
                                            ...newArticle,
                                            summary: e.target.value
                                        })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="content">Contenido</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Contenido completo de la noticia"
                                    rows={8}
                                    value={newArticle.content}
                                    onChange={(e) =>
                                        setNewArticle({
                                            ...newArticle,
                                            content: e.target.value
                                        })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="coverImage">
                                    URL de Imagen de Portada
                                </Label>
                                <Input
                                    id="coverImage"
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    value={newArticle.coverImageUrl}
                                    onChange={(e) =>
                                        setNewArticle({
                                            ...newArticle,
                                            coverImageUrl: e.target.value
                                        })
                                    }
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="published"
                                    checked={newArticle.published}
                                    onCheckedChange={(checked) =>
                                        setNewArticle({
                                            ...newArticle,
                                            published: checked
                                        })
                                    }
                                />
                                <Label htmlFor="published">
                                    Publicar inmediatamente
                                </Label>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsCreateDialogOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleCreateArticle}>
                                Crear Noticia
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-3 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Noticias
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {noticias.length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Publicadas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {noticias.filter((n) => n.published).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Borradores
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {noticias.filter((n) => !n.published).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* News Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Noticias</CardTitle>
                    <CardDescription>
                        Gestiona todas las noticias y artículos publicados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar noticias..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Noticia</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">
                                        Acciones
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedNews.map((article) => (
                                    <TableRow key={article.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-16 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                                                    {article.coverImageUrl ? (
                                                        <img
                                                            src={
                                                                article.coverImageUrl
                                                            }
                                                            alt={article.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="max-w-xs">
                                                    <div className="font-medium line-clamp-1">
                                                        {article.title}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground line-clamp-2">
                                                        {article.summary}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Calendar className="mr-1 h-4 w-4" />
                                                {article.date
                                                    ? formatDate(article.date)
                                                    : "Sin fecha"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() =>
                                                    togglePublishStatus(
                                                        article.id
                                                    )
                                                }
                                                className="cursor-pointer"
                                            >
                                                {getStatusBadge(
                                                    article.published
                                                )}
                                            </button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/admin/noticias/${article.id}`}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/admin/noticias/${article.id}/edit`}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                ¿Estás seguro?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción no
                                                                se puede
                                                                deshacer. Esto
                                                                eliminará
                                                                permanentemente
                                                                la noticia "
                                                                {article.title}
                                                                ".
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>
                                                                Cancelar
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() =>
                                                                    handleDeleteArticle(
                                                                        article.id
                                                                    )
                                                                }
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
    );
}
