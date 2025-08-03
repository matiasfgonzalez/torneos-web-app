"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "../ui/card";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PropsTeamsCarousel {
    tournamentTeams: any[];
}

const TeamsCarousel = (props: PropsTeamsCarousel) => {
    const { tournamentTeams } = props;

    const [currentIndex, setCurrentIndex] = useState(0);
    const teamsPerView = 4; // Número de equipos visibles a la vez

    const nextSlide = () => {
        setCurrentIndex((prev) =>
            prev + teamsPerView >= tournamentTeams.length
                ? 0
                : prev + teamsPerView
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prev) =>
            prev === 0
                ? Math.max(0, tournamentTeams.length - teamsPerView)
                : Math.max(0, prev - teamsPerView)
        );
    };

    const visibleTeams = tournamentTeams.slice(
        currentIndex,
        currentIndex + teamsPerView
    );

    return (
        <Card className="mb-8">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Equipos Participantes
                        </CardTitle>
                        <CardDescription>
                            {tournamentTeams.length} equipos compiten en este
                            torneo
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={prevSlide}
                            disabled={currentIndex === 0}
                            className="h-8 w-8 p-0 bg-transparent"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={nextSlide}
                            disabled={
                                currentIndex + teamsPerView >=
                                tournamentTeams.length
                            }
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {visibleTeams.map((team) => (
                        <Link
                            key={team.id}
                            href={`/equipos/${team.id}`}
                            className="group"
                        >
                            <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50">
                                <CardContent className="p-4 text-center">
                                    <div className="relative mb-3">
                                        <div className="w-16 h-16 mx-auto mb-2 relative">
                                            <img
                                                src={
                                                    team.logoUrl ||
                                                    "/placeholder.svg"
                                                }
                                                alt={`Escudo de ${team.name}`}
                                                width={64}
                                                height={64}
                                                className="object-cover border-border group-hover:border-primary/50 transition-colors"
                                            />
                                        </div>
                                        {/* Colores del equipo */}
                                        <div className="flex justify-center gap-1 mb-2">
                                            <div
                                                className="w-3 h-3 rounded-full border border-border"
                                                style={{
                                                    backgroundColor:
                                                        team.homeColor
                                                }}
                                                title="Color local"
                                            />
                                            <div
                                                className="w-3 h-3 rounded-full border border-border"
                                                style={{
                                                    backgroundColor:
                                                        team.awayColor
                                                }}
                                                title="Color visitante"
                                            />
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors mb-1">
                                        {team.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                                        {team.homeCity}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Indicadores de página */}
                <div className="flex justify-center mt-4 gap-2">
                    {Array.from({
                        length: Math.ceil(tournamentTeams.length / teamsPerView)
                    }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() =>
                                setCurrentIndex(index * teamsPerView)
                            }
                            className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                Math.floor(currentIndex / teamsPerView) ===
                                    index
                                    ? "bg-primary w-6"
                                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                            )}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default TeamsCarousel;
