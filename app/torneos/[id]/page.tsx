import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Users,
  Calendar,
  MapPin,
  ArrowLeft,
  Clock,
  Target,
  Award,
  Play,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTorneoById } from "@/app/actions/torneos/getTorneoById";
import { formatDate } from "@/lib/formatDate";
import TeamsCarousel from "@/components/equipos/TeamsCarousel";

// Datos de ejemplo de torneos (mismo que en la página principal)
const torneosData = [
  {
    id: 1,
    nombre: "Liga Profesional 2024",
    descripcion:
      "Campeonato nacional de fútbol profesional con los mejores equipos del país",
    categoria: "Fútbol",
    estado: "En Curso",
    equipos: 16,
    fechaInicio: "2024-03-15",
    fechaFin: "2024-11-30",
    ubicacion: "Nacional",
    participantes: 320,
    premio: "$50,000",
    imagen: "/football-tournament-stadium.png",
    popularidad: 5,
  },
  // ... otros torneos
];

// Datos de ejemplo para equipos participantes
const equiposData = [
  {
    id: 1,
    nombre: "Águilas FC",
    ciudad: "Capital",
    jugadores: 20,
    entrenador: "Carlos Mendez",
  },
  {
    id: 2,
    nombre: "Leones United",
    ciudad: "Norte",
    jugadores: 18,
    entrenador: "Ana Rodriguez",
  },
  {
    id: 3,
    nombre: "Tigres Rojos",
    ciudad: "Sur",
    jugadores: 22,
    entrenador: "Miguel Santos",
  },
  {
    id: 4,
    nombre: "Halcones CF",
    ciudad: "Este",
    jugadores: 19,
    entrenador: "Laura Gomez",
  },
  {
    id: 5,
    nombre: "Pumas Dorados",
    ciudad: "Oeste",
    jugadores: 21,
    entrenador: "Roberto Silva",
  },
  {
    id: 6,
    nombre: "Lobos FC",
    ciudad: "Centro",
    jugadores: 20,
    entrenador: "Patricia Ruiz",
  },
];

// Partidos jugados
const partidosJugados = [
  {
    id: 1,
    fecha: "2024-03-20",
    equipoLocal: "Águilas FC",
    equipoVisitante: "Lobos FC",
    resultadoLocal: 3,
    resultadoVisitante: 1,
    estado: "Finalizado",
  },
  {
    id: 2,
    fecha: "2024-03-22",
    equipoLocal: "Tigres Rojos",
    equipoVisitante: "Halcones CF",
    resultadoLocal: 2,
    resultadoVisitante: 0,
    estado: "Finalizado",
  },
  {
    id: 3,
    fecha: "2024-03-25",
    equipoLocal: "Leones United",
    equipoVisitante: "Pumas Dorados",
    resultadoLocal: 1,
    resultadoVisitante: 1,
    estado: "Finalizado",
  },
  {
    id: 4,
    fecha: "2024-03-28",
    equipoLocal: "Águilas FC",
    equipoVisitante: "Tigres Rojos",
    resultadoLocal: 2,
    resultadoVisitante: 1,
    estado: "Finalizado",
  },
];

// Próximos partidos
const proximosPartidos = [
  {
    id: 5,
    fecha: "2024-04-05",
    hora: "15:00",
    equipoLocal: "Leones United",
    equipoVisitante: "Águilas FC",
    estadio: "Estadio Central",
  },
  {
    id: 6,
    fecha: "2024-04-07",
    hora: "17:30",
    equipoLocal: "Pumas Dorados",
    equipoVisitante: "Tigres Rojos",
    estadio: "Arena Deportiva",
  },
  {
    id: 7,
    fecha: "2024-04-10",
    hora: "19:00",
    equipoLocal: "Halcones CF",
    equipoVisitante: "Lobos FC",
    estadio: "Campo Municipal",
  },
];

export default async function TorneoIndividualPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const torneo = await getTorneoById(id);

  if (!torneo) {
    return notFound();
  }

  console.log(torneo.tournamentTeams);

  const teamsOrder = torneo.tournamentTeams?.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points; // Ordenar por puntos
    if (a.wins !== b.wins) return b.wins - a.wins; // Luego por victorias
    if (a.goalDifference !== b.goalDifference)
      return b.goalDifference - a.goalDifference;
    return 0; // Si todo es igual, mantener el orden
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "ACTIVO":
        return "bg-green-100 text-green-800";
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800";
      case "FINALIZADO":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPosicionColor = (posicion: number) => {
    if (posicion <= 2) return "text-green-600 font-bold";
    if (posicion <= 4) return "text-blue-600 font-semibold";
    return "text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                GOLAZO
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/torneos">
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Torneos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-[#ad45ff]/5 to-[#a3b3ff]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Badge className={getEstadoColor(torneo.status)}>
                  {torneo.status}
                </Badge>
                <div className="flex space-x-1">
                  <Trophy className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 text-balance">
                {torneo.name}
              </h1>
              <p className="text-xl text-gray-600 text-pretty">
                {torneo.description}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Equipos</p>
                    <p className="font-semibold">
                      {torneo.tournamentTeams?.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Formato</p>
                    <p className="font-semibold">{torneo.format}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ubicación</p>
                    <p className="font-semibold">{torneo.locality}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duración</p>
                    <p className="font-semibold">
                      {formatDate(torneo.startDate, "dd/MM/yyyy")} -{" "}
                      {formatDate(torneo.endDate, "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src={torneo.logoUrl || "/placeholder.svg"}
                alt={torneo.name}
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Teams Carousel */}
      <section className="py-8">
        <div className="max-w-4/5 mx-auto px-4 sm:px-6 lg:px-8">
          {torneo.tournamentTeams?.length && (
            <TeamsCarousel tournamentTeams={torneo.tournamentTeams} />
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-4/5 mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="tabla" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger
                value="tabla"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white"
              >
                Tabla de Posiciones
              </TabsTrigger>
              <TabsTrigger
                value="equipos"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white"
              >
                Equipos
              </TabsTrigger>
              <TabsTrigger
                value="partidos"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white"
              >
                Partidos
              </TabsTrigger>
              <TabsTrigger
                value="estadisticas"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white"
              >
                Estadísticas
              </TabsTrigger>
            </TabsList>

            {/* Tabla de Posiciones */}
            <TabsContent value="tabla" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-[#ad45ff]" />
                    <span>Tabla de Posiciones</span>
                  </CardTitle>
                  <CardDescription>
                    Clasificación actual del torneo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Pos</TableHead>
                        <TableHead>Equipo</TableHead>
                        <TableHead className="text-center">PJ</TableHead>
                        <TableHead className="text-center">PG</TableHead>
                        <TableHead className="text-center">PE</TableHead>
                        <TableHead className="text-center">PP</TableHead>
                        <TableHead className="text-center">GF</TableHead>
                        <TableHead className="text-center">GC</TableHead>
                        <TableHead className="text-center">DIF</TableHead>
                        <TableHead className="text-center font-bold">
                          PTS
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamsOrder?.map((equipo, index) => (
                        <TableRow key={equipo.id} className="hover:bg-gray-50">
                          <TableCell
                            className={`font-bold ${getPosicionColor(
                              index + 1
                            )}`}
                          >
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="relative w-11 h-11 flex-shrink-0">
                                <img
                                  src={
                                    equipo.team.logoUrl || "/placeholder.svg"
                                  }
                                  alt={`Escudo de ${equipo.team.name}`}
                                  width={64}
                                  height={64}
                                  className=" object-cover border border-border"
                                />
                              </div>
                              <span className="truncate hidden md:block">
                                {equipo.team.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {equipo.wins + equipo.draws + equipo.losses}
                          </TableCell>
                          <TableCell className="text-center">
                            {equipo.wins}
                          </TableCell>
                          <TableCell className="text-center">
                            {equipo.draws}
                          </TableCell>
                          <TableCell className="text-center">
                            {equipo.losses}
                          </TableCell>
                          <TableCell className="text-center">
                            {equipo.goalsFor}
                          </TableCell>
                          <TableCell className="text-center">
                            {equipo.goalsAgainst}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={
                                equipo.goalDifference >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {equipo.goalDifference > 0 ? "+" : ""}
                              {equipo.goalDifference}
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-bold text-[#ad45ff]">
                            {equipo.points}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Equipos */}
            <TabsContent value="equipos" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {torneo.tournamentTeams?.map((equipo) => (
                  <Card
                    key={equipo.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{equipo.team.name}</span>
                        <Badge variant="outline">{equipo.team.homeCity}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-center">
                        <img
                          src={equipo.team.logoUrl || "/placeholder.svg"}
                          alt={`Escudo de ${equipo.team.name}`}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-[#ad45ff]" />
                          <span className="text-sm">Jugadores</span>
                        </div>
                        <span className="font-semibold">{"cantJug"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-[#ad45ff]" />
                          <span className="text-sm">Entrenador</span>
                        </div>
                        <span className="font-semibold">
                          {equipo.team.coach}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Partidos */}
            <TabsContent value="partidos" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Partidos Jugados */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Partidos Jugados</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {partidosJugados.map((partido) => (
                      <div
                        key={partido.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">
                            {new Date(partido.fecha).toLocaleDateString()}
                          </span>
                          <Badge className="bg-green-100 text-green-800">
                            {partido.estado}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-center flex-1">
                            <p className="font-semibold">
                              {partido.equipoLocal}
                            </p>
                          </div>
                          <div className="mx-4 text-center">
                            <p className="text-2xl font-bold text-[#ad45ff]">
                              {partido.resultadoLocal} -{" "}
                              {partido.resultadoVisitante}
                            </p>
                          </div>
                          <div className="text-center flex-1">
                            <p className="font-semibold">
                              {partido.equipoVisitante}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Próximos Partidos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span>Próximos Partidos</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {proximosPartidos.map((partido) => (
                      <div
                        key={partido.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">
                            {new Date(partido.fecha).toLocaleDateString()} -{" "}
                            {partido.hora}
                          </span>
                          <Badge className="bg-blue-100 text-blue-800">
                            Programado
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-center flex-1">
                            <p className="font-semibold">
                              {partido.equipoLocal}
                            </p>
                          </div>
                          <div className="mx-4 text-center">
                            <p className="text-lg font-bold text-gray-400">
                              VS
                            </p>
                          </div>
                          <div className="text-center flex-1">
                            <p className="font-semibold">
                              {partido.equipoVisitante}
                            </p>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">
                            {partido.estadio}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Estadísticas */}
            <TabsContent value="estadisticas" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">32</p>
                    <p className="text-sm text-gray-600">Partidos Jugados</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">89</p>
                    <p className="text-sm text-gray-600">Goles Totales</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">2.8</p>
                    <p className="text-sm text-gray-600">Goles por Partido</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">320</p>
                    <p className="text-sm text-gray-600">Jugadores Activos</p>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico de rendimiento (simulado) */}
              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento del Torneo</CardTitle>
                  <CardDescription>
                    Estadísticas generales de la competencia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Asistencia Promedio</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] h-2 rounded-full"
                            style={{ width: "85%" }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold">85%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Partidos sin Empate</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] h-2 rounded-full"
                            style={{ width: "72%" }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold">72%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Satisfacción de Equipos</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] h-2 rounded-full"
                            style={{ width: "94%" }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold">94%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                GOLAZO
              </span>
            </div>
            <p className="text-gray-400 mb-8">
              La plataforma líder en gestión de torneos deportivos
              profesionales.
            </p>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-400">
                &copy; 2024 GOLAZO. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
