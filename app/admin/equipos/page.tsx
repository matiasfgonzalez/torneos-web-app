"use client";

import { useState } from "react";
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
import {
    Search,
    Edit,
    Trash2,
    Eye,
    Users,
    MapPin,
    Calendar,
    Trophy
} from "lucide-react";
import TeamForm from "./components/team-form";

const teams = [
    {
        id: "1",
        name: "Club Deportivo Águilas",
        shortName: "Águilas",
        category: "Primera División",
        homeCity: "Ciudad Central",
        yearFounded: 1985,
        players: 25,
        status: "Activo",
        coach: "Roberto Martínez",
        tournaments: 3,
        homeColor: "#DC2626",
        awayColor: "#FFFFFF",
        logoUrl: "/placeholder.svg?height=40&width=40&text=🦅",
        description: "Club tradicional de la ciudad con gran historia",
        history:
            "Fundado en 1985, el Club Deportivo Águilas ha sido una institución fundamental en el fútbol local...",
        tournamentId: "1"
    },
    {
        id: "2",
        name: "Los Leones FC",
        shortName: "Leones",
        category: "Primera División",
        homeCity: "Villa Deportiva",
        yearFounded: 1978,
        players: 23,
        status: "Activo",
        coach: "Carlos Hernández",
        tournaments: 2,
        homeColor: "#CA8A04",
        awayColor: "#000000",
        logoUrl: "/placeholder.svg?height=40&width=40&text=🦁",
        description: "Equipo con tradición y garra leonina",
        history:
            "Los Leones FC nació en 1978 con el objetivo de representar el espíritu guerrero de Villa Deportiva...",
        tournamentId: "1"
    },
    {
        id: "3",
        name: "Juventud FC",
        shortName: "Juventud",
        category: "Sub-20",
        homeCity: "Nueva Villa",
        yearFounded: 1995,
        players: 20,
        status: "Activo",
        coach: "Pedro Sánchez",
        tournaments: 1,
        homeColor: "#16A34A",
        awayColor: "#FFFFFF",
        logoUrl: "/placeholder.svg?height=40&width=40&text=⚽",
        description: "Cantera de jóvenes talentos",
        history:
            "Juventud FC se especializa en formar jóvenes promesas del fútbol desde 1995...",
        tournamentId: "2"
    },
    {
        id: "4",
        name: "Femenino Estrella",
        shortName: "Estrella",
        category: "Femenino",
        homeCity: "Ciudad Nueva",
        yearFounded: 2020,
        players: 18,
        status: "Pendiente",
        coach: "María González",
        tournaments: 1,
        homeColor: "#9333EA",
        awayColor: "#F59E0B",
        logoUrl: "/placeholder.svg?height=40&width=40&text=⭐",
        description: "Pioneras del fútbol femenino en la región",
        history:
            "Femenino Estrella representa la nueva era del fútbol femenino, fundado en 2020...",
        tournamentId: "3"
    }
];

export default function AdminEquipos() {
    const [searchTerm, setSearchTerm] = useState("");
    const [editingTeam, setEditingTeam] = useState<(typeof teams)[0] | null>(
        null
    );

    const filteredTeams = teams.filter(
        (team) =>
            team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.homeCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.coach.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Activo":
                return (
                    <Badge
                        variant="default"
                        className="bg-green-100 text-green-800 border-green-200"
                    >
                        Activo
                    </Badge>
                );
            case "Pendiente":
                return (
                    <Badge
                        variant="outline"
                        className="border-yellow-200 text-yellow-800"
                    >
                        Pendiente
                    </Badge>
                );
            case "Suspendido":
                return <Badge variant="destructive">Suspendido</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const handleCreateTeam = async (data: any) => {
        console.log("Creating team:", data);
        // Aquí iría la lógica para crear el equipo
        // Por ejemplo, llamada a API
    };

    const handleEditTeam = async (data: any) => {
        console.log("Editing team:", data);
        // Aquí iría la lógica para editar el equipo
        setEditingTeam(null);
    };

    const handleDeleteTeam = (teamId: string) => {
        console.log("Deleting team:", teamId);
        // Aquí iría la lógica para eliminar el equipo
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Gestión de Equipos
                    </h2>
                    <p className="text-muted-foreground">
                        Administra todos los equipos registrados en la
                        plataforma
                    </p>
                </div>

                {/* Formulario de Creación */}
                <TeamForm isEditMode={false} />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Equipos
                        </CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teams.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Equipos registrados
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Activos
                        </CardTitle>
                        <Users className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {teams.filter((t) => t.status === "Activo").length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            En competencia
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pendientes
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {
                                teams.filter((t) => t.status === "Pendiente")
                                    .length
                            }
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Por aprobar
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Jugadores
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {teams.reduce((sum, team) => sum + team.players, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Jugadores registrados
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Teams Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Equipos</CardTitle>
                    <CardDescription>
                        Gestiona todos los equipos registrados en la plataforma
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar equipos por nombre, ciudad, categoría o DT..."
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
                                    <TableHead>Equipo</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Ciudad</TableHead>
                                    <TableHead>DT</TableHead>
                                    <TableHead>Colores</TableHead>
                                    <TableHead>Jugadores</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">
                                        Acciones
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTeams.map((team) => (
                                    <TableRow
                                        key={team.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={
                                                        team.logoUrl ||
                                                        "/placeholder.svg"
                                                    }
                                                    alt={`Escudo ${team.name}`}
                                                    className="w-8 h-8 rounded-full object-cover border"
                                                />
                                                <div>
                                                    <div className="font-medium">
                                                        {team.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground flex items-center">
                                                        <Calendar className="mr-1 h-3 w-3" />
                                                        Fundado en{" "}
                                                        {team.yearFounded}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {team.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                                                {team.homeCity}
                                            </div>
                                        </TableCell>
                                        <TableCell>{team.coach}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded-full border border-gray-300"
                                                    style={{
                                                        backgroundColor:
                                                            team.homeColor
                                                    }}
                                                    title="Color Local"
                                                />
                                                <div
                                                    className="w-4 h-4 rounded-full border border-gray-300"
                                                    style={{
                                                        backgroundColor:
                                                            team.awayColor
                                                    }}
                                                    title="Color Visitante"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                                                {team.players}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(team.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Editar equipo"
                                                    onClick={() =>
                                                        setEditingTeam(team)
                                                    }
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            title="Eliminar equipo"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                ¿Eliminar
                                                                equipo?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción no
                                                                se puede
                                                                deshacer. Se
                                                                eliminará
                                                                permanentemente
                                                                el equipo "
                                                                {team.name}" y
                                                                todos sus datos
                                                                asociados.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>
                                                                Cancelar
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() =>
                                                                    handleDeleteTeam(
                                                                        team.id
                                                                    )
                                                                }
                                                                className="bg-red-600 hover:bg-red-700"
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

                    {filteredTeams.length === 0 && (
                        <div className="text-center py-8">
                            <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
                                No se encontraron equipos
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {searchTerm
                                    ? "Intenta con otros términos de búsqueda"
                                    : "Comienza registrando tu primer equipo"}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Formulario de Edición */}
            {editingTeam && <TeamForm isEditMode={true} />}
        </div>
    );
}
