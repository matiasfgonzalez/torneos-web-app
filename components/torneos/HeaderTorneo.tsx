import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Users,
    TrendingUp,
    Trophy,
    Calendar,
    Tags,
    Layers3,
    MapPin
} from "lucide-react";
import { format } from "date-fns";
import { ITorneo } from "./types";
import { formatDate } from "@/lib/formatDate";

interface PropsHeaderTorneo {
    tournamentData: ITorneo;
}

const HeaderTorneo = (props: PropsHeaderTorneo) => {
    const { tournamentData } = props;
    const diasRestantes = tournamentData.endDate
        ? Math.max(
              0,
              Math.ceil(
                  (new Date(tournamentData.endDate).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
              )
          )
        : null;

    return (
        <div className="mb-8">
            {/* Encabezado */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="p-6 rounded-2xl shadow-md ">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                        {tournamentData.name}
                    </h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Tags className="w-4 h-4 text-primary" />
                            <span className="font-medium">
                                {tournamentData.category}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Layers3 className="w-4 h-4 text-primary" />
                            <span className="font-medium">
                                {tournamentData.format}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>
                                {formatDate(
                                    tournamentData.startDate,
                                    "dd 'de' MMMM yyyy"
                                )}{" "}
                                -{" "}
                                {formatDate(
                                    tournamentData.endDate,
                                    "dd 'de' MMMM yyyy"
                                )}
                            </span>
                        </div>

                        {tournamentData.locality && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span>{tournamentData.locality}</span>
                            </div>
                        )}
                    </div>
                </div>
                <Badge
                    variant={
                        tournamentData.status === "En curso"
                            ? "default"
                            : "secondary"
                    }
                    className="text-lg px-4 py-2"
                >
                    {tournamentData.status}
                </Badge>
            </div>

            {/* Descripción */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <p className="text-muted-foreground text-lg mb-6">
                    {tournamentData.description ?? "Sin descripción"}
                </p>
            </div>

            {/* Logo */}
            {tournamentData.logoUrl && (
                <div className="flex items-center justify-center p-4">
                    <div className="bg-white shadow-xl rounded-2xl border border-gray-200 p-4 max-w-xs w-full transition-transform duration-300 hover:scale-105">
                        <div className="aspect-[4/5] relative">
                            <img
                                src={tournamentData.logoUrl}
                                alt={`Logo de ${tournamentData.name}`}
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                        <div className="text-2xl font-bold">
                            {tournamentData.teams?.length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Equipos
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                        <div className="text-2xl font-bold">
                            {tournamentData.matches?.length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Partidos
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                        <div className="text-2xl font-bold">-</div>
                        <div className="text-sm text-muted-foreground">
                            Premios
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                        <div className="text-2xl font-bold">
                            {diasRestantes !== null ? diasRestantes : "—"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Días restantes
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HeaderTorneo;
