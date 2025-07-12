// app/noticias/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, ArrowLeft, Share2, Eye, Clock } from "lucide-react";
import { INoticia } from "@/components/noticias/types"; // Asegurate de ajustar el path
import { formatDate } from "@/lib/formatDate";

export default function NewsDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [noticia, setNoticia] = useState<INoticia | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNoticia = async () => {
            try {
                const res = await fetch(`/api/noticias/${id}`);
                const data = await res.json();
                setNoticia(data);
            } catch (error) {
                console.error("Error al cargar noticia:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchNoticia();
    }, [id]);

    const handleShare = () => {
        if (!noticia) return;
        if (navigator.share) {
            navigator.share({
                title: noticia.title,
                text: noticia.summary,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            // Podés mostrar un toast aquí
        }
    };

    if (loading) return <div className="p-8">Cargando noticia...</div>;
    if (!noticia) return <div className="p-8">Noticia no encontrada</div>;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" className="mb-6" asChild>
                    <Link href="/noticias">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a noticias
                    </Link>
                </Button>

                <div className="max-w-4xl mx-auto">
                    <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(noticia.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Lectura estimada: 5 min</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>-- vistas</span>
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold mb-4 leading-tight">
                        {noticia.title}
                    </h1>

                    <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                        {noticia.summary}
                    </p>

                    <div className="flex items-center gap-4 mb-8">
                        <Avatar className="h-12 w-12">
                            <AvatarImage
                                src={noticia.user.imageUrl}
                                alt={noticia.user.name}
                            />
                            <AvatarFallback>
                                {noticia.user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-semibold">
                                {noticia.user.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {noticia.user.email}
                            </div>
                        </div>
                    </div>

                    {noticia.coverImageUrl && (
                        <img
                            src={noticia.coverImageUrl}
                            alt={noticia.title}
                            className="w-full h-full object-cover rounded-lg mb-8"
                        />
                    )}

                    <div
                        className="prose prose-lg max-w-none mb-8"
                        dangerouslySetInnerHTML={{ __html: noticia.content }}
                    />

                    <Button variant="outline" onClick={handleShare}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartir
                    </Button>
                </div>
            </div>
        </div>
    );
}
