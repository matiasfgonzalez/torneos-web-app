"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Calendar,
    Trophy,
    Users,
    TrendingUp,
    Search,
    Filter,
    MapPin
} from "lucide-react";
import { ITorneo } from "./types";
import {
    TORNAMENT_STATUS_DESC,
    TOURNAMENT_CATEGORIES_DESC
} from "@/lib/constants";
import { formatDate } from "@/lib/formatDate";

interface PropsFiltroTorneos {
    tournaments: ITorneo[];
}

const FiltroTorneos = (props: PropsFiltroTorneos) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Todas");
    const [selectedStatus, setSelectedStatus] = useState("Todos");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { tournaments } = props;

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const filteredTournaments = tournaments.filter((tournament) => {
        const matchesSearch =
            tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tournament.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === "Todas" ||
            tournament.category === selectedCategory;
        const matchesStatus =
            selectedStatus === "Todos" || tournament.status === selectedStatus;

        return matchesSearch && matchesCategory && matchesStatus;
    });
    return (
        <>
            {/* Filters */}
            <div className="mb-8 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Buscar torneos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                        >
                            <SelectTrigger className="w-[180px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {TOURNAMENT_CATEGORIES_DESC.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                {TORNAMENT_STATUS_DESC.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
                <p className="text-muted-foreground">
                    Mostrando {filteredTournaments.length} de{" "}
                    {tournaments.length} torneos
                </p>
            </div>

            {/* Tournaments Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTournaments.map((tournament) => (
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
                                            : tournament.status === "Finalizado"
                                            ? "secondary"
                                            : tournament.status ===
                                              "Próximamente"
                                            ? "outline"
                                            : "secondary"
                                    }
                                >
                                    {tournament.status}
                                </Badge>
                            </div>
                            <CardDescription>
                                {tournament.category}
                                <span className="text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {tournament.locality}
                                    </div>
                                </span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {tournament.description}
                                </p>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            <span>
                                                {"tournament.teams"} equipos
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            <span>
                                                {"tournament.matchesPlayed"}/
                                                {"tournament.totalMatches"}{" "}
                                                partidos
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {formatDate(tournament.startDate)} -{" "}
                                            {formatDate(tournament.endDate)}
                                        </span>
                                    </div>

                                    {tournament.nextMatch && (
                                        <div className="flex items-center gap-2 text-sm text-primary">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                Próximo: {tournament.nextMatch}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    className="w-full"
                                    variant="secondary"
                                    asChild
                                >
                                    <Link
                                        href={`/public/torneos/${tournament.id}`}
                                    >
                                        Ver detalles
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* No Results */}
            {filteredTournaments.length === 0 && (
                <div className="text-center py-12">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                        No se encontraron torneos
                    </h3>
                    <p className="text-muted-foreground">
                        Intenta ajustar los filtros o el término de búsqueda.
                    </p>
                </div>
            )}
        </>
    );
};

export default FiltroTorneos;
