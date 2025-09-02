"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Trophy,
  Users,
  Calendar,
  MapPin,
  Search,
  Filter,
  Eye,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { formatDate } from "@/lib/formatDate";
import { FullscreenLoading } from "@/components/fullscreen-loading";

export interface IPTournament {
  id: string;
  name: string;
  description: string;
  category: string;
  locality: string;
  logoUrl: string;
  liga: string;
  status: string;
  format: string;
  nextMatch: string;
  homeAndAway: boolean;
  enabled: boolean;
  startDate: string;
  endDate: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tournamentTeams: IPTournamentTeam[];
}

export interface IPTournamentTeam {
  id: string;
  tournamentId: string;
  teamId: string;
  group: string;
  isEliminated: boolean;
  notes: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export default function TorneosPage() {
  const [torneos, setTorneos] = useState<IPTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/tournaments", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tournaments");
        }

        const data = await response.json();
        setTorneos(data);
      } catch (err: any) {
        console.error("Error fetching tournaments:", err);
        setError(err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  console.log(torneos);
  const categoriasAll = torneos.map((t: IPTournament) => t.category);
  const categoriasUnicas = Array.from(new Set(categoriasAll));
  const categorias = ["Todos", ...categoriasUnicas];

  const torneosFiltrados = torneos.filter((torneo) => {
    const matchesSearch =
      torneo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      torneo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      torneo.locality.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todos" || torneo.category === selectedCategory;
    return matchesSearch && matchesCategory;
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

  if (loading) {
    return <FullscreenLoading isVisible={true} message="Cargando torneos" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Navigation */}
      <Header />

      {/* Header Section */}
      <section className="py-16 bg-gradient-to-r from-[#ad45ff]/5 to-[#a3b3ff]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <Badge className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white border-0">
              Torneos Activos
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 text-balance">
              Explora Todos los{" "}
              <span className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                Torneos
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
              Descubre competencias emocionantes, sigue a tus equipos favoritos
              y mantente al día con las últimas estadísticas y resultados.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar torneos por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-[#ad45ff]"
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {categorias.map((categoria) => (
                <Button
                  key={categoria}
                  variant={
                    selectedCategory === categoria ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(categoria)}
                  className={
                    selectedCategory === categoria
                      ? "bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white"
                      : "border-[#ad45ff] text-[#ad45ff] hover:bg-[#ad45ff] hover:text-white"
                  }
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {categoria}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tournaments Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {torneosFiltrados.length} Torneo
              {torneosFiltrados.length !== 1 ? "s" : ""} Encontrado
              {torneosFiltrados.length !== 1 ? "s" : ""}
            </h2>
            <div className="text-sm text-gray-600">
              Mostrando resultados para "{searchTerm || "todos los torneos"}"
            </div>
          </div>

          {torneosFiltrados.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron torneos
              </h3>
              <p className="text-gray-600">
                Intenta con otros términos de búsqueda o categorías.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {torneosFiltrados.map((torneo) => (
                <Card
                  key={torneo.id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={torneo.logoUrl || "/placeholder.svg"}
                      alt={torneo.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={getEstadoColor(torneo.status)}>
                        {torneo.status}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4 flex space-x-1">
                      <Trophy className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl group-hover:text-[#ad45ff] transition-colors">
                        {torneo.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {torneo.category}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-600 line-clamp-2">
                      {torneo.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-[#ad45ff]" />
                        <span>{torneo.tournamentTeams.length} equipos</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-[#ad45ff]" />
                        <span>{torneo.format}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-[#ad45ff]" />
                        <span className="flex wrap-anywhere">
                          Inicio: {formatDate(torneo.startDate, "dd/MM/yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-[#ad45ff]" />
                        <span className="flex wrap-anywhere">
                          Fin: {formatDate(torneo.endDate, "dd/MM/yyyy")}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-[#ad45ff]" />
                        <span>{torneo.locality}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end pt-4 border-t">
                      <Link href={`/torneos/${torneo.id}`}>
                        <Button
                          size="sm"
                          className="cursor-pointer bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalles
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white text-balance">
              ¿Quieres Organizar tu Propio Torneo?
            </h2>
            <p className="text-xl text-white/90 text-pretty">
              Únete a GOLAZO y crea torneos profesionales con todas las
              herramientas que necesitas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-[#ad45ff] hover:bg-gray-100 text-lg px-8"
              >
                Crear Torneo
              </Button>
              <Link href="/">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#ad45ff] text-lg px-8 bg-transparent"
                >
                  Conocer Más
                </Button>
              </Link>
            </div>
          </div>
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
