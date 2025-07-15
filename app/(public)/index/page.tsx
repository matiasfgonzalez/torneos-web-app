import Link from "next/link";
import { Button } from "@/components/ui/button";
import ListNoticias from "@/components/noticias/ListNoticias";
import { HomeAds } from "@/components/home-ads";
import { VideoAds } from "@/components/video-ads";

export default async function HomePage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        La Casa del Fútbol Local
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                        Sigue todos los torneos, resultados, estadísticas y
                        noticias del fútbol de tu región en tiempo real.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" variant="secondary" asChild>
                            <Link href="/torneos">Ver Torneos Activos</Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                            asChild
                        >
                            <Link href="/noticias">Últimas Noticias</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-muted/50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                                15
                            </div>
                            <div className="text-muted-foreground">
                                Torneos Activos
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                                248
                            </div>
                            <div className="text-muted-foreground">
                                Equipos Registrados
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                                1,247
                            </div>
                            <div className="text-muted-foreground">
                                Partidos Jugados
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                                3,891
                            </div>
                            <div className="text-muted-foreground">
                                Goles Anotados
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured News */}
            <ListNoticias />

            {/* Video Ads Section */}
            <VideoAds variant="featured" />

            {/* Sponsors/Ads Section */}
            <HomeAds variant="carousel" />

            {/* Active Tournaments 
            <ListTorneos />
            */}
        </div>
    );
}
