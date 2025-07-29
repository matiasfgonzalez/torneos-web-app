"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Edit, Eye } from "lucide-react";
import { useState } from "react";
import { ITorneo } from "@/components/torneos/types";
import { formatDate } from "@/lib/formatDate";
import Link from "next/link";
import { DeleteTournamentButton } from "./DeleteTournamentButton";
interface PropsListTournaments {
    tournaments: ITorneo[];
}
const ListTournaments = (props: PropsListTournaments) => {
    const { tournaments } = props;

    const [searchTerm, setSearchTerm] = useState("");
    const filteredTournaments = tournaments.filter(
        (tournament) =>
            tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tournament.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "En curso":
                return <Badge variant="default">En curso</Badge>;
            case "Finalizado":
                return <Badge variant="secondary">Finalizado</Badge>;
            case "Inscripciones":
                return <Badge variant="outline">Inscripciones</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Lista de Torneos</CardTitle>
                <CardDescription>
                    Gestiona todos los torneos registrados en la plataforma
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar torneos..."
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
                                <TableHead>Torneo</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Fechas Inicio</TableHead>
                                <TableHead>Fechas Fin</TableHead>
                                <TableHead className="text-right">
                                    Acciones
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTournaments.map((tournament) => (
                                <TableRow key={tournament.id}>
                                    <TableCell className="font-medium">
                                        {tournament.name}
                                    </TableCell>
                                    <TableCell>{tournament.category}</TableCell>
                                    <TableCell>
                                        {getStatusBadge(tournament.status)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {formatDate(
                                                tournament.startDate,
                                                "dd 'de' MMMM yyyy"
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {formatDate(
                                                tournament.endDate,
                                                "dd 'de' MMMM yyyy"
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                variant="default"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`/admin/torneos/${tournament.id}`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                asChild
                                                className="bg-green-700 hover:bg-green-900 text-white"
                                            >
                                                <Link
                                                    href={`/admin/torneos/${tournament.id}/edit`}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <DeleteTournamentButton
                                                tournament={tournament}
                                            />
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

export default ListTournaments;
