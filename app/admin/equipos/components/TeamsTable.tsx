"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, Users, MapPin, Calendar, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ITeam } from "@/components/equipos/types";
import Link from "next/link";
import TeamForm from "./team-form";
import DeleteTeamButton from "./DeleteTeamButton";

interface PropsTeamsTable {
  teams: ITeam[];
}

const TeamsTable = (props: PropsTeamsTable) => {
  const { teams } = props;
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.homeCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      case "Deshabilitado":
        return <Badge variant="destructive">Deshabilitado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
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
                <TableHead>Ciudad</TableHead>
                <TableHead>DT</TableHead>
                <TableHead>Colores</TableHead>
                <TableHead>Jugadores</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.map((team: ITeam) => (
                <TableRow key={team.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={team.logoUrl || "/placeholder.svg"}
                        alt={`Escudo ${team.name}`}
                        className="w-9 h-9 object-cover "
                      />
                      <div>
                        <div className="font-medium">{team.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          Fundado en {team.yearFounded}
                        </div>
                      </div>
                    </div>
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
                          backgroundColor: team.homeColor,
                        }}
                        title="Color Local"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{
                          backgroundColor: team.awayColor,
                        }}
                        title="Color Visitante"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                      {0}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(team.enabled ? "Activo" : "Deshabilitado")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="default" size="sm" asChild>
                        <Link href={`/public/equipos/${team.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <TeamForm isEditMode={true} team={team} />
                      <DeleteTeamButton team={team} />
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
  );
};

export default TeamsTable;
