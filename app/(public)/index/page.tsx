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
import { Calendar, Trophy, Users, TrendingUp } from "lucide-react";
import { getNoticias } from "@/app/actions/noticias/getNoticias";
import ListNoticias from "@/components/noticias/ListNoticias";

const activeTournaments = [
    {
        id: 1,
        name: "Torneo Clausura 2024",
        category: "Primera División",
        teams: 16,
        matchesPlayed: 45,
        totalMatches: 60,
        status: "En curso",
        nextMatch: "2024-01-20"
    },
    {
        id: 2,
        name: "Copa Juvenil",
        category: "Sub-20",
        teams: 12,
        matchesPlayed: 18,
        totalMatches: 24,
        status: "Semifinales",
        nextMatch: "2024-01-18"
    },
    {
        id: 3,
        name: "Liga Amateur",
        category: "Amateur",
        teams: 20,
        matchesPlayed: 30,
        totalMatches: 38,
        status: "En curso",
        nextMatch: "2024-01-19"
    }
];

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
    user: IUser;
}

export interface IUser {
    id: string;
    clerkUserId: string;
    email: string;
    name: string;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
}

export default async function HomePage() {
    const noticias = await getNoticias();

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
            <ListNoticias noticias={noticias} />

            {/* Active Tournaments */}
            <section className="py-16 bg-muted/50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold">Torneos en Curso</h2>
                        <Button variant="outline" asChild>
                            <Link href="/torneos">Ver todos los torneos</Link>
                        </Button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeTournaments.map((tournament) => (
                            <Card
                                key={tournament.id}
                                className="hover:shadow-lg transition-shadow"
                            >
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">
                                            {tournament.name}
                                        </CardTitle>
                                        <Badge
                                            variant={
                                                tournament.status === "En curso"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {tournament.status}
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        {tournament.category}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                <span>
                                                    {tournament.teams} equipos
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                <span>
                                                    {tournament.matchesPlayed}/
                                                    {tournament.totalMatches}{" "}
                                                    partidos
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                Próximo partido:{" "}
                                                {tournament.nextMatch}
                                            </span>
                                        </div>
                                        <Button
                                            className="w-full bg-transparent"
                                            variant="outline"
                                            asChild
                                        >
                                            <Link
                                                href={`/torneos/${tournament.id}`}
                                            >
                                                Ver detalles
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-background border-t py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <Trophy className="h-6 w-6 text-primary" />
                                <span className="text-xl font-bold">
                                    VIVA LA MAÑANA
                                </span>
                            </div>
                            <p className="text-muted-foreground">
                                La plataforma líder para la gestión y
                                seguimiento de torneos de fútbol local.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Navegación</h3>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>
                                    <Link
                                        href="/"
                                        className="hover:text-primary"
                                    >
                                        Inicio
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/torneos"
                                        className="hover:text-primary"
                                    >
                                        Torneos
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/noticias"
                                        className="hover:text-primary"
                                    >
                                        Noticias
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/estadisticas"
                                        className="hover:text-primary"
                                    >
                                        Estadísticas
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Torneos</h3>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>
                                    <Link
                                        href="/torneos?categoria=primera"
                                        className="hover:text-primary"
                                    >
                                        Primera División
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/torneos?categoria=juvenil"
                                        className="hover:text-primary"
                                    >
                                        Juveniles
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/torneos?categoria=amateur"
                                        className="hover:text-primary"
                                    >
                                        Amateur
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Contacto</h3>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>Email: matiasgonzalez.652@gmail.com</li>
                                <li>Teléfono: +54 9 3454 432164</li>
                                <li>Dirección: Los Jilgueros 130</li>
                                <li>Oro Verde - Entre Ríos - Argentina</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
                        <p>
                            &copy; 2024 VIVA LA MAÑANA. Todos los derechos
                            reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
