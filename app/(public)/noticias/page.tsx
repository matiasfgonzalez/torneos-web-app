"use client";

import { use, useEffect, useState } from "react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Trophy, Search, Filter, Calendar, User } from "lucide-react";
import Noticia from "@/components/noticias/Noticia";
import { INoticia } from "@/components/noticias/types";

export default function NoticiasPage() {
    const [news, setNews] = useState<INoticia[]>([]); // Asegúrate de que INoticia esté importado correctamente
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Todas");

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch("/api/noticias?published=true");
                const data = await res.json();
                setNews(data);
            } catch (error) {
                console.error("Error al cargar noticias:", error);
            }
        };
        fetchNews();
    }, []);

    const filteredNews = news.filter((article) => {
        const matchesSearch =
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.content.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    const regularNews = filteredNews;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">Noticias</h1>
                    <p className="text-muted-foreground text-lg">
                        Mantente al día con las últimas noticias, resultados y
                        novedades del fútbol local.
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Buscar noticias..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Regular News */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">
                            Todas las Noticias
                        </h2>
                        <p className="text-muted-foreground">
                            Mostrando {filteredNews.length} de {news.length}{" "}
                            noticias
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {regularNews.map((article) => (
                            <Noticia news={article} key={article.id} />
                        ))}
                    </div>
                </div>

                {/* No Results */}
                {filteredNews.length === 0 && (
                    <div className="text-center py-12">
                        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            No se encontraron noticias
                        </h3>
                        <p className="text-muted-foreground">
                            Intenta ajustar los filtros o el término de
                            búsqueda.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
