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
  Star,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";

// Datos de ejemplo de torneos
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
  {
    id: 2,
    nombre: "Copa Regional Norte",
    descripcion:
      "Torneo eliminatorio regional con equipos de la zona norte del país",
    categoria: "Fútbol",
    estado: "Inscripciones Abiertas",
    equipos: 8,
    fechaInicio: "2024-04-01",
    fechaFin: "2024-05-15",
    ubicacion: "Región Norte",
    participantes: 160,
    premio: "$15,000",
    imagen: "/regional-football-cup.png",
    popularidad: 4,
  },
  {
    id: 3,
    nombre: "Torneo Juvenil Sub-18",
    descripcion: "Competencia para jóvenes talentos menores de 18 años",
    categoria: "Fútbol Juvenil",
    estado: "Finalizado",
    equipos: 12,
    fechaInicio: "2024-01-10",
    fechaFin: "2024-02-28",
    ubicacion: "Ciudad Capital",
    participantes: 240,
    premio: "$8,000",
    imagen: "/youth-football-tournament.png",
    popularidad: 4,
  },
  {
    id: 4,
    nombre: "Liga Empresarial",
    descripcion: "Torneo corporativo entre equipos de diferentes empresas",
    categoria: "Fútbol Amateur",
    estado: "En Curso",
    equipos: 10,
    fechaInicio: "2024-02-01",
    fechaFin: "2024-06-30",
    ubicacion: "Zona Industrial",
    participantes: 200,
    premio: "$5,000",
    imagen: "/corporate-football-league.png",
    popularidad: 3,
  },
  {
    id: 5,
    nombre: "Copa Internacional Amistosa",
    descripcion: "Torneo amistoso con equipos invitados de países vecinos",
    categoria: "Fútbol Internacional",
    estado: "Próximamente",
    equipos: 6,
    fechaInicio: "2024-07-15",
    fechaFin: "2024-07-30",
    ubicacion: "Estadio Nacional",
    participantes: 120,
    premio: "$25,000",
    imagen: "/international-football-cup.png",
    popularidad: 5,
  },
  {
    id: 6,
    nombre: "Torneo Femenino Elite",
    descripcion:
      "Campeonato de fútbol femenino con los mejores equipos del país",
    categoria: "Fútbol Femenino",
    estado: "En Curso",
    equipos: 8,
    fechaInicio: "2024-03-01",
    fechaFin: "2024-08-15",
    ubicacion: "Nacional",
    participantes: 160,
    premio: "$20,000",
    imagen: "/women-football-championship.png",
    popularidad: 4,
  },
];

export default function TorneosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const categorias = [
    "Todos",
    "Fútbol",
    "Fútbol Juvenil",
    "Fútbol Amateur",
    "Fútbol Internacional",
    "Fútbol Femenino",
  ];

  const torneosFiltrados = torneosData.filter((torneo) => {
    const matchesSearch =
      torneo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      torneo.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todos" || torneo.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "En Curso":
        return "bg-green-100 text-green-800";
      case "Inscripciones Abiertas":
        return "bg-blue-100 text-blue-800";
      case "Próximamente":
        return "bg-yellow-100 text-yellow-800";
      case "Finalizado":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
                      src={torneo.imagen || "/placeholder.svg"}
                      alt={torneo.nombre}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={getEstadoColor(torneo.estado)}>
                        {torneo.estado}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4 flex space-x-1">
                      {[...Array(torneo.popularidad)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl group-hover:text-[#ad45ff] transition-colors">
                        {torneo.nombre}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {torneo.categoria}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-600 line-clamp-2">
                      {torneo.descripcion}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-[#ad45ff]" />
                        <span>{torneo.equipos} equipos</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-[#ad45ff]" />
                        <span>{torneo.premio}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-[#ad45ff]" />
                        <span>{torneo.ubicacion}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-[#ad45ff]" />
                        <span>
                          {new Date(torneo.fechaInicio).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">
                          {torneo.participantes}
                        </span>{" "}
                        participantes
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </Button>
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
