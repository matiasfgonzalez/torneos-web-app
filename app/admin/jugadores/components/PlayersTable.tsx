"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Edit, Trash2, Eye, Award, Earth } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IPlayer } from "@/components/jugadores/types";
import { formatDate } from "@/lib/formatDate";

interface PropsPlayersTable {
  teams: {
    id: string;
    name: string;
    logoUrl: string;
  }[];
  players: IPlayer[];
}

const PlayersTable = (props: PropsPlayersTable) => {
  const { players, teams } = props;
  const [searchTerm, setSearchTerm] = useState("");
  const filteredPlayers = players.filter(
    (player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.nationality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 border-green-200"
          >
            Activo
          </Badge>
        );
      case "SUSPENDED":
        return <Badge variant="destructive">Suspendido</Badge>;
      case "INJURED":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            Lesionado
          </Badge>
        );
      case "UNAVAILABLE":
        return <Badge variant="outline">No Disponible</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPositionBadge = (position: string) => {
    switch (position) {
      case "Portero":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 border-blue-200"
          >
            Portero
          </Badge>
        );
      case "Defensa":
      case "Defensa Central":
      case "Lateral Derecho":
      case "Lateral Izquierdo":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 border-gray-200"
          >
            Defensa
          </Badge>
        );
      case "Mediocampista":
      case "Mediocampista Defensivo":
      case "Mediocampista Central":
      case "Mediocampista Ofensivo":
        return (
          <Badge
            variant="default"
            className="bg-purple-100 text-purple-800 border-purple-200"
          >
            Mediocampista
          </Badge>
        );
      case "Delantero":
      case "Delantera":
      case "Delantero Centro":
      case "Extremo Derecho":
      case "Extremo Izquierdo":
        return (
          <Badge
            variant="destructive"
            className="bg-red-100 text-red-800 border-red-200"
          >
            Delantero
          </Badge>
        );
      default:
        return <Badge>{position}</Badge>;
    }
  };

  const getDominantFootIcon = (foot: string) => {
    switch (foot) {
      case "DERECHA":
        return "🦶";
      case "IZQUIERDA":
        return "🦵";
      case "AMBOS":
        return "👣";
      default:
        return "❓";
    }
  };

  function calcularEdad(fechaNacimiento: string | Date): number {
    const fecha = new Date(fechaNacimiento);
    const hoy = new Date();

    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    const dia = hoy.getDate() - fecha.getDate();

    // Si aún no cumplió años en el año actual, restamos 1
    if (mes < 0 || (mes === 0 && dia < 0)) {
      edad--;
    }

    return edad;
  }

  const handleEdit = (player: IPlayer) => {
    console.log("Edit player:", player);
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Jugadores</CardTitle>
        <CardDescription>
          Gestiona todos los jugadores registrados en la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar jugadores por nombre, equipo, posición o nacionalidad..."
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
                <TableHead>Jugador</TableHead>
                <TableHead>Posición</TableHead>
                <TableHead>Físico</TableHead>
                <TableHead>Nacionalidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.map((player) => (
                <TableRow key={player.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={player.imageUrlFace || "/placeholder.svg"}
                          alt={player.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-border"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                          {player.number}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          🌍 {player.nationality} •{" "}
                          {calcularEdad(player.birthDate)} años
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getPositionBadge(player.position)}
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {getDominantFootIcon(player.dominantFoot)}{" "}
                        {player.dominantFoot?.toLowerCase()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-1">
                        📏 {player.height} cm
                      </div>
                      <div className="flex items-center gap-1">
                        ⚖️ {player.weight} kg
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-1">
                        <Earth className="h-4 w-4 text-green-600" />
                        <span className="font-medium">
                          {player.nationality}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(player.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" title="Ver detalles">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(player)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" title="Eliminar">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ¿Eliminar jugador?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente a{" "}
                              <strong>{player.name}</strong> del sistema. Esta
                              acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
      </CardContent>
    </Card>
  );
};

export default PlayersTable;
