import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Target, Shield } from "lucide-react";

import { getTorneoById } from "@/app/actions/torneos/getTorneoById";
import { notFound } from "next/navigation";
import HeaderTorneo from "@/components/torneos/HeaderTorneo";
import TeamsCarousel from "@/components/equipos/TeamsCarousel";

const upcomingMatches = [
  {
    id: 1,
    date: "2024-01-20",
    time: "15:00",
    homeTeam: "Club Deportivo Águilas",
    awayTeam: "Los Leones FC",
    venue: "Estadio Central",
  },
  {
    id: 2,
    date: "2024-01-20",
    time: "17:30",
    homeTeam: "Tigres Unidos",
    awayTeam: "Real Futbol Club",
    venue: "Campo Municipal",
  },
  {
    id: 3,
    date: "2024-01-21",
    time: "16:00",
    homeTeam: "Deportivo Central",
    awayTeam: "Atlético Municipal",
    venue: "Estadio Norte",
  },
  {
    id: 4,
    date: "2024-01-21",
    time: "18:00",
    homeTeam: "Sporting Club",
    awayTeam: "Unidos FC",
    venue: "Campo Sur",
  },
];

const recentResults = [
  {
    id: 1,
    date: "2024-01-15",
    homeTeam: "Club Deportivo Águilas",
    awayTeam: "Deportivo Central",
    homeScore: 3,
    awayScore: 1,
  },
  {
    id: 2,
    date: "2024-01-15",
    homeTeam: "Los Leones FC",
    awayTeam: "Tigres Unidos",
    homeScore: 2,
    awayScore: 2,
  },
  {
    id: 3,
    date: "2024-01-14",
    homeTeam: "Real Futbol Club",
    awayTeam: "Atlético Municipal",
    homeScore: 1,
    awayScore: 0,
  },
  {
    id: 4,
    date: "2024-01-14",
    homeTeam: "Unidos FC",
    awayTeam: "Sporting Club",
    homeScore: 0,
    awayScore: 2,
  },
];

const topScorers = [
  {
    position: 1,
    player: "Carlos Rodríguez",
    team: "Club Deportivo Águilas",
    goals: 12,
  },
  { position: 2, player: "Miguel Santos", team: "Los Leones FC", goals: 10 },
  { position: 3, player: "Juan Pérez", team: "Tigres Unidos", goals: 9 },
  { position: 4, player: "Diego Martín", team: "Real Futbol Club", goals: 8 },
  {
    position: 5,
    player: "Roberto Silva",
    team: "Deportivo Central",
    goals: 7,
  },
];

const cleanSheets = [
  {
    position: 1,
    player: "Antonio López",
    team: "Club Deportivo Águilas",
    cleanSheets: 8,
  },
  {
    position: 2,
    player: "Fernando García",
    team: "Los Leones FC",
    cleanSheets: 6,
  },
  {
    position: 3,
    player: "Luis Morales",
    team: "Tigres Unidos",
    cleanSheets: 5,
  },
  {
    position: 4,
    player: "Pedro Ruiz",
    team: "Real Futbol Club",
    cleanSheets: 4,
  },
  {
    position: 5,
    player: "Manuel Torres",
    team: "Deportivo Central",
    cleanSheets: 3,
  },
];

export default async function TournamentDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const tournamentData = await getTorneoById(id);

  if (!tournamentData) return notFound();

  console.log(tournamentData);

  const teamsOrder = tournamentData.tournamentTeams?.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points; // Ordenar por puntos
    if (a.wins !== b.wins) return b.wins - a.wins; // Luego por victorias
    if (a.goalDifference !== b.goalDifference)
      return b.goalDifference - a.goalDifference;
    return 0; // Si todo es igual, mantener el orden
  });

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

        {/* Teams Carousel */}
        {tournamentData.tournamentTeams?.length && (
          <TeamsCarousel tournamentTeams={tournamentData.tournamentTeams} />
        )}

        {/* Tournament Content Tabs */}
        <Tabs defaultValue="standings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="standings" className="bg-primary text-white">
              Tabla de Posiciones
            </TabsTrigger>
            <TabsTrigger value="fixtures" className="bg-primary text-white">
              Calendario
            </TabsTrigger>
            <TabsTrigger value="results" className="bg-primary text-white">
              Resultados
            </TabsTrigger>
            <TabsTrigger value="stats" className="bg-primary text-white">
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
                        <TableHead className="w-12">Pos</TableHead>
                        <TableHead>Equipo</TableHead>
                        <TableHead className="text-center">PJ</TableHead>
                        <TableHead className="text-center hidden md:table-cell">
                          G
                        </TableHead>
                        <TableHead className="text-center hidden md:table-cell">
                          E
                        </TableHead>
                        <TableHead className="text-center hidden md:table-cell">
                          P
                        </TableHead>
                        <TableHead className="text-center hidden md:table-cell">
                          GF
                        </TableHead>
                        <TableHead className="text-center hidden md:table-cell">
                          GC
                        </TableHead>
                        <TableHead className="text-center">DG</TableHead>
                        <TableHead className="text-center">Pts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamsOrder?.map((tteam, index) => (
                        <TableRow key={tteam.id}>
                          <TableCell className="font-medium text-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index <= 4
                                  ? "bg-green-100 text-green-800"
                                  : index <= 6
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {index + 1}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="relative w-11 h-11 flex-shrink-0">
                                <img
                                  src={tteam.team.logoUrl || "/placeholder.svg"}
                                  alt={`Escudo de ${tteam.team.name}`}
                                  width={64}
                                  height={64}
                                  className=" object-cover border border-border"
                                />
                              </div>
                              <span className="truncate hidden md:block">
                                {tteam.team.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {tteam.wins + tteam.draws + tteam.losses}
                          </TableCell>
                          <TableCell className="text-center hidden md:table-cell">
                            {tteam.wins}
                          </TableCell>
                          <TableCell className="text-center hidden md:table-cell">
                            {tteam.draws}
                          </TableCell>
                          <TableCell className="text-center hidden md:table-cell">
                            {tteam.losses}
                          </TableCell>
                          <TableCell className="text-center hidden md:table-cell">
                            {tteam.goalsFor}
                          </TableCell>
                          <TableCell className="text-center hidden md:table-cell">
                            {tteam.goalsAgainst}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={
                                tteam.goalDifference >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {tteam.goalDifference > 0 ? "+" : ""}
                              {tteam.goalDifference}
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            {tteam.points}
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
                          <div className="font-medium">{match.time}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium">{match.homeTeam}</div>
                          </div>
                          <div className="text-muted-foreground">vs</div>
                          <div className="text-left">
                            <div className="font-medium">{match.awayTeam}</div>
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
                <CardDescription>Últimos partidos disputados</CardDescription>
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
                            <div className="font-medium">{match.homeTeam}</div>
                          </div>
                          <div className="flex items-center gap-2 font-bold text-lg">
                            <span>{match.homeScore}</span>
                            <span className="text-muted-foreground">-</span>
                            <span>{match.awayScore}</span>
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{match.awayTeam}</div>
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
                            <div className="font-medium">{scorer.player}</div>
                            <div className="text-sm text-muted-foreground">
                              {scorer.team}
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-lg">{scorer.goals}</div>
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
                            <div className="font-medium">{keeper.player}</div>
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
