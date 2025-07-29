import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { ArrowLeft, Target, Shield } from "lucide-react";

import { getTorneoById } from "@/app/actions/torneos/getTorneoById";
import { notFound } from "next/navigation";
import HeaderTorneo from "@/components/torneos/HeaderTorneo";

const standings = [
    {
        position: 1,
        team: "Club Social y Deportivo Talleres",
        teamLogo: "/escudos/talleres.png",
        played: 12,
        won: 9,
        drawn: 2,
        lost: 1,
        goalsFor: 28,
        goalsAgainst: 8,
        goalDifference: 20,
        points: 29
    },
    {
        position: 2,
        team: "Club Social y Deportivo Ateneo",
        teamLogo: "/escudos/ateneo.png",
        played: 12,
        won: 8,
        drawn: 3,
        lost: 1,
        goalsFor: 24,
        goalsAgainst: 10,
        goalDifference: 14,
        points: 27
    },
    {
        position: 3,
        team: "Club Social y Deportivo Las Malvinas",

        teamLogo: "/escudos/malvinas.png",
        played: 12,
        won: 7,
        drawn: 4,
        lost: 1,
        goalsFor: 22,
        goalsAgainst: 12,
        goalDifference: 10,
        points: 25
    },
    {
        position: 4,
        team: "Club Social y Deportivo 4 Hachazos",

        teamLogo: "/escudos/4_hachazos.png",
        played: 12,
        won: 6,
        drawn: 3,
        lost: 3,
        goalsFor: 19,
        goalsAgainst: 15,
        goalDifference: 4,
        points: 21
    },
    {
        position: 5,
        team: "Club Social y Deportivo Nueva Vizcaya",

        teamLogo: "/escudos/nueva_vizcaya.png",
        played: 12,
        won: 5,
        drawn: 4,
        lost: 3,
        goalsFor: 17,
        goalsAgainst: 16,
        goalDifference: 1,
        points: 19
    },
    {
        position: 6,
        team: "Club Social y Deportivo Las Flores",

        teamLogo: "/escudos/las-flores.png",
        played: 12,
        won: 4,
        drawn: 5,
        lost: 3,
        goalsFor: 15,
        goalsAgainst: 14,
        goalDifference: 1,
        points: 17
    },
    {
        position: 7,
        team: "Las Delicias",

        teamLogo: "/escudos/las_delicias.png",
        played: 12,
        won: 4,
        drawn: 4,
        lost: 4,
        goalsFor: 16,
        goalsAgainst: 17,
        goalDifference: -1,
        points: 16
    },
    {
        position: 8,
        team: "Club Atletico Itati",

        teamLogo: "/escudos/itati.png",
        played: 12,
        won: 3,
        drawn: 6,
        lost: 3,
        goalsFor: 14,
        goalsAgainst: 16,
        goalDifference: -2,
        points: 15
    },
    {
        position: 9,
        team: "Club Atletico El Silbido",

        teamLogo: "/escudos/el-silvido.png",
        played: 12,
        won: 3,
        drawn: 6,
        lost: 3,
        goalsFor: 14,
        goalsAgainst: 16,
        goalDifference: -2,
        points: 15
    },
    {
        position: 10,
        team: "Club Social y Deportivo Defensores del Sur",

        teamLogo: "/escudos/defensores.png",
        played: 12,
        won: 3,
        drawn: 6,
        lost: 3,
        goalsFor: 14,
        goalsAgainst: 16,
        goalDifference: -2,
        points: 15
    },
    {
        position: 11,
        team: "Escuela de Fútbol Dieguito",

        teamLogo: "/escudos/dieguito.png",
        played: 12,
        won: 3,
        drawn: 6,
        lost: 3,
        goalsFor: 14,
        goalsAgainst: 16,
        goalDifference: -2,
        points: 15
    }
];

const upcomingMatches = [
    {
        id: 1,
        date: "2024-01-20",
        time: "15:00",
        homeTeam: "Club Deportivo Águilas",
        awayTeam: "Los Leones FC",
        venue: "Estadio Central"
    },
    {
        id: 2,
        date: "2024-01-20",
        time: "17:30",
        homeTeam: "Tigres Unidos",
        awayTeam: "Real Futbol Club",
        venue: "Campo Municipal"
    },
    {
        id: 3,
        date: "2024-01-21",
        time: "16:00",
        homeTeam: "Deportivo Central",
        awayTeam: "Atlético Municipal",
        venue: "Estadio Norte"
    },
    {
        id: 4,
        date: "2024-01-21",
        time: "18:00",
        homeTeam: "Sporting Club",
        awayTeam: "Unidos FC",
        venue: "Campo Sur"
    }
];

const recentResults = [
    {
        id: 1,
        date: "2024-01-15",
        homeTeam: "Club Deportivo Águilas",
        awayTeam: "Deportivo Central",
        homeScore: 3,
        awayScore: 1
    },
    {
        id: 2,
        date: "2024-01-15",
        homeTeam: "Los Leones FC",
        awayTeam: "Tigres Unidos",
        homeScore: 2,
        awayScore: 2
    },
    {
        id: 3,
        date: "2024-01-14",
        homeTeam: "Real Futbol Club",
        awayTeam: "Atlético Municipal",
        homeScore: 1,
        awayScore: 0
    },
    {
        id: 4,
        date: "2024-01-14",
        homeTeam: "Unidos FC",
        awayTeam: "Sporting Club",
        homeScore: 0,
        awayScore: 2
    }
];

const topScorers = [
    {
        position: 1,
        player: "Carlos Rodríguez",
        team: "Club Deportivo Águilas",
        goals: 12
    },
    { position: 2, player: "Miguel Santos", team: "Los Leones FC", goals: 10 },
    { position: 3, player: "Juan Pérez", team: "Tigres Unidos", goals: 9 },
    { position: 4, player: "Diego Martín", team: "Real Futbol Club", goals: 8 },
    {
        position: 5,
        player: "Roberto Silva",
        team: "Deportivo Central",
        goals: 7
    }
];

const cleanSheets = [
    {
        position: 1,
        player: "Antonio López",
        team: "Club Deportivo Águilas",
        cleanSheets: 8
    },
    {
        position: 2,
        player: "Fernando García",
        team: "Los Leones FC",
        cleanSheets: 6
    },
    {
        position: 3,
        player: "Luis Morales",
        team: "Tigres Unidos",
        cleanSheets: 5
    },
    {
        position: 4,
        player: "Pedro Ruiz",
        team: "Real Futbol Club",
        cleanSheets: 4
    },
    {
        position: 5,
        player: "Manuel Torres",
        team: "Deportivo Central",
        cleanSheets: 3
    }
];

export default async function TournamentDetailPage({
    params
}: Readonly<{
    params: Promise<{ id: string }>;
}>) {
    const { id } = await params;
    const tournamentData = await getTorneoById(id);

    if (!tournamentData) return notFound();

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Button variant="ghost" className="mb-6" asChild>
                    <Link href="/public/torneos">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a torneos
                    </Link>
                </Button>

                {/* Tournament Header */}
                <HeaderTorneo tournamentData={tournamentData} />

                {/* Tournament Content Tabs */}
                <Tabs defaultValue="standings" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger
                            value="standings"
                            className="bg-primary text-white"
                        >
                            Tabla de Posiciones
                        </TabsTrigger>
                        <TabsTrigger
                            value="fixtures"
                            className="bg-primary text-white"
                        >
                            Calendario
                        </TabsTrigger>
                        <TabsTrigger
                            value="results"
                            className="bg-primary text-white"
                        >
                            Resultados
                        </TabsTrigger>
                        <TabsTrigger
                            value="stats"
                            className="bg-primary text-white"
                        >
                            Estadísticas
                        </TabsTrigger>
                    </TabsList>

                    {/* Standings Tab */}
                    <TabsContent value="standings">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tabla de Posiciones</CardTitle>
                                <CardDescription>
                                    Clasificación actual del torneo
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12">
                                                    Pos
                                                </TableHead>
                                                <TableHead>Equipo</TableHead>
                                                <TableHead className="text-center">
                                                    PJ
                                                </TableHead>
                                                <TableHead className="text-center">
                                                    G
                                                </TableHead>
                                                <TableHead className="text-center">
                                                    E
                                                </TableHead>
                                                <TableHead className="text-center">
                                                    P
                                                </TableHead>
                                                <TableHead className="text-center">
                                                    GF
                                                </TableHead>
                                                <TableHead className="text-center">
                                                    GC
                                                </TableHead>
                                                <TableHead className="text-center">
                                                    DG
                                                </TableHead>
                                                <TableHead className="text-center">
                                                    Pts
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {standings.map((team) => (
                                                <TableRow key={team.position}>
                                                    <TableCell className="font-medium text-center">
                                                        <div
                                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                                team.position <=
                                                                4
                                                                    ? "bg-green-100 text-green-800"
                                                                    : team.position <=
                                                                      6
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                            }`}
                                                        >
                                                            {team.position}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative w-11 h-11 flex-shrink-0">
                                                                <img
                                                                    src={
                                                                        team.teamLogo ||
                                                                        "/placeholder.svg"
                                                                    }
                                                                    alt={`Escudo de ${team.team}`}
                                                                    width={64}
                                                                    height={64}
                                                                    className=" object-cover border border-border"
                                                                />
                                                            </div>
                                                            <span className="truncate">
                                                                {team.team}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {team.played}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {team.won}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {team.drawn}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {team.lost}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {team.goalsFor}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {team.goalsAgainst}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span
                                                            className={
                                                                team.goalDifference >=
                                                                0
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                            }
                                                        >
                                                            {team.goalDifference >
                                                            0
                                                                ? "+"
                                                                : ""}
                                                            {
                                                                team.goalDifference
                                                            }
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold">
                                                        {team.points}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Fixtures Tab */}
                    <TabsContent value="fixtures">
                        <Card>
                            <CardHeader>
                                <CardTitle>Próximos Partidos</CardTitle>
                                <CardDescription>
                                    Calendario de los próximos encuentros
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {upcomingMatches.map((match) => (
                                        <div
                                            key={match.id}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <div className="text-sm text-muted-foreground">
                                                        {match.date}
                                                    </div>
                                                    <div className="font-medium">
                                                        {match.time}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="font-medium">
                                                            {match.homeTeam}
                                                        </div>
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        vs
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-medium">
                                                            {match.awayTeam}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-muted-foreground">
                                                    {match.venue}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Results Tab */}
                    <TabsContent value="results">
                        <Card>
                            <CardHeader>
                                <CardTitle>Resultados Recientes</CardTitle>
                                <CardDescription>
                                    Últimos partidos disputados
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentResults.map((match) => (
                                        <div
                                            key={match.id}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-sm text-muted-foreground">
                                                    {match.date}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="font-medium">
                                                            {match.homeTeam}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 font-bold text-lg">
                                                        <span>
                                                            {match.homeScore}
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            -
                                                        </span>
                                                        <span>
                                                            {match.awayScore}
                                                        </span>
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-medium">
                                                            {match.awayTeam}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Statistics Tab */}
                    <TabsContent value="stats">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Top Scorers */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5" />
                                        Máximos Goleadores
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {topScorers.map((scorer) => (
                                            <div
                                                key={scorer.position}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                                        {scorer.position}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">
                                                            {scorer.player}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {scorer.team}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="font-bold text-lg">
                                                    {scorer.goals}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Clean Sheets */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Vallas Invictas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {cleanSheets.map((keeper) => (
                                            <div
                                                key={keeper.position}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                                                        {keeper.position}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">
                                                            {keeper.player}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {keeper.team}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="font-bold text-lg">
                                                    {keeper.cleanSheets}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
