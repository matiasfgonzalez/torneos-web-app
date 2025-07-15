"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Maximize, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoAd {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    videoUrl: string;
    sponsor: string;
    category: string;
    duration: string;
    provider: "youtube" | "vimeo" | "direct";
    link?: string;
}

const videoAds: VideoAd[] = [
    {
        id: "1",
        title: "Entrena como un Profesional",
        description:
            "Descubre los secretos del entrenamiento de élite con nuestros programas especializados.",
        thumbnailUrl:
            "https://i.ytimg.com/vi/bkX0NkCfjfU/hqdefault.jpg?sqp=-oaymwFBCNACELwBSFryq4qpAzMIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB8AEB-AH-CYAC0AWKAgwIABABGGUgXChXMA8=&rs=AOn4CLBdAVpwyc6PquFZydxiL-bl_z0-jA",
        videoUrl:
            "https://www.youtube.com/embed/bkX0NkCfjfU?si=7WkbSCEP9Ln2YglH",
        sponsor: "FutbolPro Academy",
        category: "Formación",
        duration: "2:30",
        provider: "youtube",
        link: "https://www.youtube.com/@VIVALAMA%C3%91ANA/videos"
    },
    {
        id: "2",
        title: "Equipamiento de Última Generación",
        description:
            "Conoce la nueva línea de productos deportivos que están revolucionando el fútbol.",
        thumbnailUrl: "/placeholder.svg?height=400&width=700",
        videoUrl: "https://player.vimeo.com/video/123456789",
        sponsor: "SportMax",
        category: "Equipamiento",
        duration: "1:45",
        provider: "vimeo",
        link: "https://sportmax.com"
    }
];

interface VideoAdsProps {
    variant?: "featured" | "carousel" | "grid";
    className?: string;
}

export function VideoAds({ variant = "featured", className }: VideoAdsProps) {
    const [currentVideo, setCurrentVideo] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const videoRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentAd = videoAds[currentVideo];

    const handlePlayVideo = () => {
        setShowVideo(true);
        setIsPlaying(true);
    };

    const handleCloseVideo = () => {
        setShowVideo(false);
        setIsPlaying(false);
    };

    const toggleFullscreen = () => {
        if (!isFullscreen && containerRef.current) {
            containerRef.current.requestFullscreen?.();
            setIsFullscreen(true);
        } else if (isFullscreen && document.fullscreenElement) {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () =>
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
    }, []);

    if (variant === "featured") {
        return (
            <section
                className={cn(
                    "py-16 bg-gradient-to-br from-background via-muted/30 to-background",
                    className
                )}
            >
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">
                                Video Destacado
                            </h2>
                            <p className="text-muted-foreground">
                                Contenido exclusivo de nuestros patrocinadores
                            </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            Contenido Patrocinado
                        </Badge>
                    </div>

                    <div className="max-w-full mx-auto">
                        <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-card to-card/80">
                            <CardContent className="p-0">
                                <div className="relative" ref={containerRef}>
                                    {!showVideo ? (
                                        // Thumbnail with play button
                                        <div
                                            className="relative group cursor-pointer"
                                            onClick={handlePlayVideo}
                                        >
                                            <div className="aspect-video relative overflow-hidden">
                                                <img
                                                    src={
                                                        currentAd.thumbnailUrl ||
                                                        "/placeholder.svg"
                                                    }
                                                    alt={currentAd.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                                                {/* Play button overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                                                        <Play
                                                            className="w-12 h-12 text-white ml-1"
                                                            fill="white"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Duration badge */}
                                                <div className="absolute top-4 right-4">
                                                    <Badge className="bg-black/50 text-white border-0">
                                                        {currentAd.duration}
                                                    </Badge>
                                                </div>

                                                {/* Category badge */}
                                                <div className="absolute top-4 left-4">
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-primary/90 text-white"
                                                    >
                                                        {currentAd.category}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Content overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                                <h3 className="text-2xl font-bold mb-2">
                                                    {currentAd.title}
                                                </h3>
                                                <p className="text-white/90 mb-4 max-w-2xl">
                                                    {currentAd.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white/80 text-sm">
                                                        Por {currentAd.sponsor}
                                                    </span>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            size="sm"
                                                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (
                                                                    currentAd.link
                                                                )
                                                                    window.open(
                                                                        currentAd.link,
                                                                        "_blank"
                                                                    );
                                                            }}
                                                        >
                                                            Más info{" "}
                                                            <ExternalLink className="w-4 h-4 ml-1" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Video player
                                        <div className="relative aspect-video bg-black">
                                            <iframe
                                                ref={videoRef}
                                                src={`${currentAd.videoUrl}${
                                                    currentAd.provider ===
                                                    "youtube"
                                                        ? "?autoplay=1&mute=1"
                                                        : "?autoplay=1&muted=1"
                                                }`}
                                                title={currentAd.title}
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />

                                            {/* Video controls overlay */}
                                            <div className="absolute top-4 right-4 flex items-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="bg-black/50 hover:bg-black/70 text-white h-8 w-8 p-0"
                                                    onClick={toggleFullscreen}
                                                >
                                                    <Maximize className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="bg-black/50 hover:bg-black/70 text-white h-8 w-8 p-0"
                                                    onClick={handleCloseVideo}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            {/* Video info overlay */}
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
                                                    <div className="flex items-center justify-between text-white">
                                                        <div>
                                                            <h4 className="font-semibold">
                                                                {
                                                                    currentAd.title
                                                                }
                                                            </h4>
                                                            <p className="text-white/80 text-sm">
                                                                {
                                                                    currentAd.sponsor
                                                                }
                                                            </p>
                                                        </div>
                                                        {currentAd.link && (
                                                            <Button
                                                                size="sm"
                                                                className="bg-white/20 hover:bg-white/30 text-white"
                                                                onClick={() =>
                                                                    window.open(
                                                                        currentAd.link,
                                                                        "_blank"
                                                                    )
                                                                }
                                                            >
                                                                Visitar sitio{" "}
                                                                <ExternalLink className="w-3 h-3 ml-1" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Video selector */}
                        {videoAds.length > 1 && (
                            <div className="flex justify-center mt-6 space-x-4">
                                {videoAds.map((ad, index) => (
                                    <button
                                        key={ad.id}
                                        onClick={() => {
                                            setCurrentVideo(index);
                                            setShowVideo(false);
                                        }}
                                        className={cn(
                                            "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200",
                                            index === currentVideo
                                                ? "bg-primary/10 border-2 border-primary"
                                                : "bg-muted/50 hover:bg-muted border-2 border-transparent"
                                        )}
                                    >
                                        <div className="w-16 h-10 rounded overflow-hidden flex-shrink-0">
                                            <img
                                                src={
                                                    ad.thumbnailUrl ||
                                                    "/placeholder.svg"
                                                }
                                                alt={ad.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-sm line-clamp-1">
                                                {ad.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {ad.sponsor}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        );
    }

    if (variant === "carousel") {
        return (
            <section className={cn("py-12", className)}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">
                            Videos Patrocinados
                        </h3>
                        <Badge variant="outline" className="text-xs">
                            Contenido Patrocinado
                        </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {videoAds.map((ad) => (
                            <Card
                                key={ad.id}
                                className="overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <CardContent className="p-0">
                                    <div
                                        className="relative group cursor-pointer"
                                        onClick={() =>
                                            window.open(ad.videoUrl, "_blank")
                                        }
                                    >
                                        <div className="aspect-video relative">
                                            <img
                                                src={
                                                    ad.thumbnailUrl ||
                                                    "/placeholder.svg"
                                                }
                                                alt={ad.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />

                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:bg-white/30 transition-all duration-300">
                                                    <Play
                                                        className="w-8 h-8 text-white ml-0.5"
                                                        fill="white"
                                                    />
                                                </div>
                                            </div>

                                            <div className="absolute top-3 right-3">
                                                <Badge className="bg-black/50 text-white border-0 text-xs">
                                                    {ad.duration}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {ad.category}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {ad.sponsor}
                                                </span>
                                            </div>
                                            <h4 className="font-semibold mb-2 line-clamp-1">
                                                {ad.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {ad.description}
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

    return null;
}
