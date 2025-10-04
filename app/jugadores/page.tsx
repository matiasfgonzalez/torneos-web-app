"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, Users, Search, Filter, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { IPlayer } from "@/components/jugadores/types";
import { calcularEdad } from "@/lib/calcularEdad";
import { FullscreenLoading } from "@/components/fullscreen-loading";

export default function JugadoresPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [posicionFilter, setPosicionFilter] = useState("all");
  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const jugadoresFiltrados = players.filter((jugador) => {
    const matchesSearch =
      jugador.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jugador.nationality.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosicion =
      posicionFilter === "all" || jugador.position === posicionFilter;

    return matchesSearch && matchesPosicion;
  });

  const posiciones = [...new Set(players.map((j) => j.position))];

  useEffect(() => {
    async function fetchPlayers() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/players");
        if (!res.ok) throw new Error("Error al obtener los jugadores");

        const data: IPlayer[] = await res.json();

        setPlayers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlayers();
  }, []);

  if (isLoading)
    return <FullscreenLoading isVisible={true} message="Cargando jugadores" />;

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
            <Link href="/">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-[#ad45ff]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-12 bg-gradient-to-r from-[#ad45ff]/10 to-[#a3b3ff]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <Badge className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white border-0">
              <Users className="w-4 h-4 mr-2" />
              Jugadores Registrados
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 text-balance">
              Directorio de{" "}
              <span className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                Jugadores
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
              Explora los perfiles completos de todos los jugadores registrados
              en la plataforma GOLAZO.
            </p>
          </div>
        </div>
      </section>

      {/* Estadísticas Rápidas */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#ad45ff]">
                {players.length}
              </div>
              <div className="text-sm text-gray-600">Jugadores Totales</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros y Búsqueda */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar jugadores o equipos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select value={posicionFilter} onValueChange={setPosicionFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Posición" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las posiciones</SelectItem>
                  {posiciones.map((posicion) => (
                    <SelectItem key={posicion} value={posicion}>
                      {posicion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Lista de Jugadores */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jugadoresFiltrados.map((jugador) => (
              <Card
                key={jugador.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-full flex items-center justify-center overflow-hidden">
                        <img
                          src={jugador.imageUrlFace || "/placeholder.svg"}
                          alt={`Escudo de ${jugador.name}`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <CardDescription className="flex items-center space-x-2">
                          <Badge className="bg-gradient-to-r from-[#ad45ff]/10 to-[#a3b3ff]/10 text-[#ad45ff] border-[#ad45ff]/20">
                            <span>{jugador.position}</span>
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>

                    <Badge variant="secondary" className="text-xs">
                      {jugador.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 py-4 border-t border-b">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#ad45ff]">
                        {jugador.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Lugar de nacimiento:
                    </span>
                    <Badge className="bg-gradient-to-r from-[#ad45ff]/10 to-[#a3b3ff]/10 text-[#ad45ff] border-[#ad45ff]/20">
                      {jugador.birthPlace}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Edad:</span>
                      <span className="font-medium">
                        {calcularEdad(jugador.birthDate)} años
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Altura:</span>
                      <span className="font-medium">{jugador.height} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peso:</span>
                      <span className="font-medium text-gray-600">
                        {jugador.weight} kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nacionalidad:</span>
                      <span className="font-medium">{jugador.nationality}</span>
                    </div>
                  </div>

                  <Link href={`/jugadores/${jugador.id}`}>
                    <Button className="cursor-pointer w-full mt-4 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white">
                      Ver Perfil Completo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {jugadoresFiltrados.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron jugadores
              </h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros de búsqueda para encontrar los
                jugadores que buscas.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
