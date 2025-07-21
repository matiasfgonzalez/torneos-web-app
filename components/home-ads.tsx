"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ExternalLink, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface HomeAd {
    id: string;
    title: string;
    imageUrl: string;
    description: string;
    link: string;
    sponsor: string;
    category: string;
    featured?: boolean;
}

const homeAds: HomeAd[] = [
    {
        id: "1",
        title: "El Reservado",
        imageUrl:
            "https://ideogram.ai/assets/image/lossless/response/bdswzgccTAKokSIYVZWZgg",
        description:
            "Ubicado en Federal, Entre Ríos, 'El Reservado' es mucho más que un espacio: es un punto de encuentro para los amantes de la tradición, los buenos momentos y el espíritu criollo. Seguinos en Instagram @el_reservado0 o comunicate por WhatsApp al 3454-488925 / 3454-488622.",
        link: "https://www.instagram.com/el_reservado0",
        sponsor: "El Reservado",
        category: "Restaurantes",
        featured: true
    },
    {
        id: "2",
        title: "Ohana Eventos",
        imageUrl:
            "https://ideogram.ai/assets/image/lossless/response/eZVCl41mQG-SeEsYx6ypVw",
        description:
            "'Ohana Eventos' es una propuesta cálida y profesional dedicada a la organización de eventos únicos e inolvidables. Desde celebraciones íntimas hasta grandes encuentros, cada detalle se prepara con amor y estilo. Consultanos para hacer realidad tu evento soñado.",
        link: "https://www.instagram.com", // Reemplazá con el link real si tienen
        sponsor: "Ohana Eventos",
        category: "Eventos",
        featured: true
    },
    {
        id: "3",
        title: "Transmisiones en Vivo",
        imageUrl:
            "https://ideogram.ai/assets/image/lossless/response/5uVHScBQQ0eUCuCb_Pr9Sw",
        description:
            "No te pierdas ningún partido con nuestra plataforma de streaming.",
        link: "#",
        sponsor: "FutbolTV",
        category: "Streaming",
        featured: true
    },
    {
        id: "4",
        title: "Nutrición Deportiva",
        imageUrl: "/placeholder.svg?height=200&width=300",
        description:
            "Suplementos y nutrición para atletas de alto rendimiento.",
        link: "#",
        sponsor: "NutriSport",
        category: "Salud"
    },
    {
        id: "5",
        title: "Seguros Deportivos",
        imageUrl: "/placeholder.svg?height=200&width=300",
        description: "Protege a tu equipo con nuestros seguros especializados.",
        link: "#",
        sponsor: "SecureSport",
        category: "Seguros"
    },
    {
        id: "6",
        title: "Viajes para Equipos",
        imageUrl: "/placeholder.svg?height=200&width=300",
        description:
            "Organiza los viajes de tu equipo con tarifas preferenciales.",
        link: "#",
        sponsor: "TravelTeam",
        category: "Viajes"
    }
];

interface HomeAdsProps {
    variant?: "carousel" | "grid" | "mixed";
    className?: string;
}

export function HomeAds({ variant = "mixed", className }: HomeAdsProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const featuredAds = homeAds.filter((ad) => ad.featured);
    const regularAds = homeAds.filter((ad) => !ad.featured);

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % featuredAds.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, featuredAds.length]);

    if (variant === "carousel") {
        return (
            <section
                className={cn(
                    "py-12 bg-gradient-to-r from-muted/30 to-background",
                    className
                )}
            >
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">
                                Nuestros Patrocinadores
                            </h2>
                            <p className="text-muted-foreground">
                                Descubre las mejores ofertas para tu equipo
                            </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            Contenido Patrocinado
                        </Badge>
                    </div>

                    <div className="relative max-w-full mx-auto">
                        <div className="overflow-hidden rounded-xl shadow-lg">
                            <div
                                className="flex transition-transform duration-700 ease-in-out"
                                style={{
                                    transform: `translateX(-${
                                        currentSlide * 100
                                    }%)`
                                }}
                            >
                                {featuredAds.map((ad) => (
                                    <div
                                        key={ad.id}
                                        className="w-full flex-shrink-0 relative"
                                    >
                                        <div className="aspect-[16/9] md:aspect-[21/9] relative">
                                            <img
                                                src={
                                                    ad.imageUrl ||
                                                    "/placeholder.svg"
                                                }
                                                alt={ad.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                                <div className="max-w-2xl">
                                                    <Badge className="hidden md:block mb-3 bg-primary/80">
                                                        {ad.category}
                                                    </Badge>
                                                    <h3 className="text-2xl md:text-3xl font-bold mb-2">
                                                        {ad.title}
                                                    </h3>
                                                    <p className="hidden md:block text-white/90 mb-4 text-sm md:text-base">
                                                        {ad.description}
                                                    </p>

                                                    <div className="flex items-center justify-between">
                                                        <span className="hidden md:block text-white/80 text-sm">
                                                            Por {ad.sponsor}
                                                        </span>
                                                        <Link
                                                            href={ad.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Button
                                                                size="sm"
                                                                className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                                                            >
                                                                Ver más{" "}
                                                                <ExternalLink className="w-4 h-4 ml-1" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Navigation */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white h-10 w-10 p-0"
                            onClick={() => {
                                setCurrentSlide(
                                    (prev) =>
                                        (prev - 1 + featuredAds.length) %
                                        featuredAds.length
                                );
                                setIsAutoPlaying(false);
                            }}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white h-10 w-10 p-0"
                            onClick={() => {
                                setCurrentSlide(
                                    (prev) => (prev + 1) % featuredAds.length
                                );
                                setIsAutoPlaying(false);
                            }}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>

                        {/* Dots */}
                        <div className="flex justify-center space-x-2 mt-4">
                            {featuredAds.map((_, index) => (
                                <button
                                    key={index}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all duration-300",
                                        index === currentSlide
                                            ? "bg-primary w-8"
                                            : "bg-muted-foreground/30"
                                    )}
                                    onClick={() => {
                                        setCurrentSlide(index);
                                        setIsAutoPlaying(false);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (variant === "grid") {
        return (
            <section className={cn("py-12", className)}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">
                                Patrocinadores Oficiales
                            </h2>
                            <p className="text-muted-foreground">
                                Empresas que apoyan el fútbol local
                            </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            Contenido Patrocinado
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {regularAds.map((ad, index) => (
                            <Card
                                key={ad.id}
                                className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <CardContent className="p-0">
                                    <div className="aspect-[4/3] relative overflow-hidden">
                                        <img
                                            src={
                                                ad.imageUrl ||
                                                "/placeholder.svg"
                                            }
                                            alt={ad.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <Badge
                                                variant="secondary"
                                                className="bg-black/50 text-white border-0 text-xs"
                                            >
                                                {ad.category}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                                            {ad.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                            {ad.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-primary font-medium">
                                                {ad.sponsor}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-3 text-xs"
                                            >
                                                Ver más{" "}
                                                <ExternalLink className="w-3 h-3 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Mixed variant (default)
    return (
        <section
            className={cn(
                "py-16 bg-gradient-to-b from-background to-muted/20",
                className
            )}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">
                            Nuestros Patrocinadores
                        </h2>
                        <p className="text-muted-foreground">
                            Descubre las mejores ofertas y servicios para el
                            fútbol
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                        Contenido Patrocinado
                    </Badge>
                </div>

                {/* Featured Carousel */}
                <div className="mb-12">
                    <div className="relative max-w-5xl mx-auto">
                        <div className="overflow-hidden rounded-2xl shadow-xl">
                            <div
                                className="flex transition-transform duration-700 ease-in-out"
                                style={{
                                    transform: `translateX(-${
                                        currentSlide * 100
                                    }%)`
                                }}
                            >
                                {featuredAds.map((ad) => (
                                    <div
                                        key={ad.id}
                                        className="w-full flex-shrink-0 relative"
                                    >
                                        <div className="aspect-[16/8] md:aspect-[20/8] relative">
                                            <img
                                                src={
                                                    ad.imageUrl ||
                                                    "/placeholder.svg"
                                                }
                                                alt={ad.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="max-w-xl ml-8 md:ml-12 text-white">
                                                    <Badge className="mb-4 bg-primary/90 text-white">
                                                        {ad.category}
                                                    </Badge>
                                                    <h3 className="text-3xl md:text-4xl font-bold mb-4">
                                                        {ad.title}
                                                    </h3>
                                                    <p className="text-white/90 mb-6 text-lg leading-relaxed">
                                                        {ad.description}
                                                    </p>
                                                    <div className="flex items-center space-x-4">
                                                        <Button
                                                            size="lg"
                                                            className="bg-white text-black hover:bg-white/90"
                                                        >
                                                            Ver Ofertas{" "}
                                                            <ExternalLink className="w-4 h-4 ml-2" />
                                                        </Button>
                                                        <span className="text-white/80">
                                                            Por {ad.sponsor}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Auto-play control */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white"
                            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                        >
                            <Play
                                className={cn(
                                    "w-4 h-4",
                                    isAutoPlaying && "opacity-50"
                                )}
                            />
                        </Button>

                        {/* Navigation */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white h-12 w-12 p-0"
                            onClick={() => {
                                setCurrentSlide(
                                    (prev) =>
                                        (prev - 1 + featuredAds.length) %
                                        featuredAds.length
                                );
                                setIsAutoPlaying(false);
                            }}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white h-12 w-12 p-0"
                            onClick={() => {
                                setCurrentSlide(
                                    (prev) => (prev + 1) % featuredAds.length
                                );
                                setIsAutoPlaying(false);
                            }}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>

                        {/* Progress indicators */}
                        <div className="flex justify-center space-x-3 mt-6">
                            {featuredAds.map((_, index) => (
                                <button
                                    key={index}
                                    className={cn(
                                        "h-1 rounded-full transition-all duration-300",
                                        index === currentSlide
                                            ? "bg-primary w-12"
                                            : "bg-muted-foreground/30 w-6"
                                    )}
                                    onClick={() => {
                                        setCurrentSlide(index);
                                        setIsAutoPlaying(false);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Secondary Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {regularAds.map((ad, index) => (
                        <Card
                            key={ad.id}
                            className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <CardContent className="p-0">
                                <div className="aspect-square relative overflow-hidden">
                                    <img
                                        src={ad.imageUrl || "/placeholder.svg"}
                                        alt={ad.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-xs font-medium mb-1">
                                            {ad.title}
                                        </p>
                                        <p className="text-xs text-white/80">
                                            {ad.sponsor}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
