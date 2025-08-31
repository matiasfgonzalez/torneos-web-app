"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Search,
  Filter,
  Users,
  Star,
  Calendar,
  MapPin,
  Trophy,
  Eye,
  ArrowRight,
  Grid,
  List,
} from "lucide-react";
import Link from "next/link";
import { IPlayer } from "@/components/jugadores/types";
import { get } from "http";

// Enums (reutilizando del componente anterior)
export enum Foot {
  IZQUIERDA = "IZQUIERDA",
  DERECHA = "DERECHA",
  AMBOS = "AMBOS",
}

export enum PlayerStatus {
  ACTIVO = "ACTIVO",
  LESIONADO = "LESIONADO",
  SUSPENDIDO = "SUSPENDIDO",
  NO_DISPONIBLE = "NO_DISPONIBLE",
}

const PlayersListInterface = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [players, setPlayers] = useState<IPlayer[]>([]);

  useEffect(() => {
    // Llamaar a la API para obtener los jugadores
    const fetchPlayers = async () => {
      try {
        const response = await fetch("/api/players");
        const data = await response.json();
        setPlayers(data);
        console.log("Fetched players:", data);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };
    fetchPlayers();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case PlayerStatus.ACTIVO:
        return "bg-green-500";
      case PlayerStatus.LESIONADO:
        return "bg-red-500";
      case PlayerStatus.SUSPENDIDO:
        return "bg-yellow-500";
      case PlayerStatus.NO_DISPONIBLE:
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case PlayerStatus.ACTIVO:
        return "Active";
      case PlayerStatus.LESIONADO:
        return "Injured";
      case PlayerStatus.SUSPENDIDO:
        return "Suspended";
      case PlayerStatus.NO_DISPONIBLE:
        return "Unavailable";
      default:
        return "Unknown";
    }
  };

  const getDominantFootColor = (foot: string) => {
    switch (foot) {
      case Foot.IZQUIERDA:
        return "text-blue-400";
      case Foot.DERECHA:
        return "text-green-400";
      case Foot.AMBOS:
        return "text-purple-400";
      default:
        return "text-gray-400";
    }
  };

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayer(playerId);
    // Aquí simularemos la redirección
    console.log(`Redirecting to player details: ${playerId}`);
  };

  // Filtrar jugadores
  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.nationality.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPosition =
      filterPosition === "" || player.position === filterPosition;
    const matchesStatus = filterStatus === "" || player.status === filterStatus;

    return matchesSearch && matchesPosition && matchesStatus;
  });

  const positions = [...new Set(players.map((p) => p.position))];
  const statuses = Object.values(PlayerStatus);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-orange-400" size={32} />
            <div>
              <h1 className="pb-2 text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent">
                Jugadores
              </h1>
              <p className="text-gray-400 mt-1">
                Explora los jugadores registrados en el sistema.
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-orange-400">
                {players.length}
              </div>
              <div className="text-sm text-gray-400">Total Players</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-green-400">
                {players.filter((p) => p.status === PlayerStatus.ACTIVO).length}
              </div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-blue-400">
                {positions.length}
              </div>
              <div className="text-sm text-gray-400">Positions</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-purple-400">
                {"0-0-0"}
              </div>
              <div className="text-sm text-gray-400">Avg Rating</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search players, teams, or nationality..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-400 transition-colors"
              >
                <option value="" className="bg-slate-800">
                  All Positions
                </option>
                {positions.map((pos) => (
                  <option key={pos} value={pos} className="bg-slate-800">
                    {pos}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-400 transition-colors"
              >
                <option value="" className="bg-slate-800">
                  All Status
                </option>
                {statuses.map((status) => (
                  <option key={status} value={status} className="bg-slate-800">
                    {getStatusText(status)}
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid"
                      ? "bg-orange-400 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list"
                      ? "bg-orange-400 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-400">
            Showing {filteredPlayers.length} of {players.length} players
          </p>
        </div>

        {/* Players Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => (
              <Card
                key={player.id}
                className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-orange-400/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
              >
                <div
                  onClick={() => handlePlayerSelect(player.id)}
                  className="p-6"
                >
                  {/* Player Image and Basic Info */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-400/30">
                        <img
                          src={player.imageUrlFace}
                          alt={player.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(
                          player.status
                        )} rounded-full border-2 border-slate-800`}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                          {player.name}
                        </h3>
                        <span className="text-2xl font-bold text-orange-400">
                          #{player.number}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {player.position} • {player.nationality}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">
                        {player.height}
                      </div>
                      <div className="text-xs text-gray-400">Altura</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">
                        {player.weight}
                      </div>
                      <div className="text-xs text-gray-400">Peso</div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-lg font-bold ${getDominantFootColor(
                          player.dominantFoot
                        )} `}
                      >
                        {player.dominantFoot}
                      </div>
                      <div className="text-xs text-gray-400">Pie dominante</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(
                        player.status
                      )}`}
                    >
                      {getStatusText(player.status)}
                    </div>
                    <div className="flex items-center gap-2 text-orange-400 group-hover:text-orange-300 transition-colors">
                      <Link
                        href={`/public/jugadores/${player.id}`}
                        className="flex gap-2"
                      >
                        <Eye size={16} />
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredPlayers.map((player) => (
              <Card
                key={player.id}
                className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-orange-400/50 transition-all duration-300 cursor-pointer group"
              >
                <div
                  onClick={() => handlePlayerSelect(player.id)}
                  className="p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange-400/30">
                          <img
                            src={player.imageUrlFace}
                            alt={player.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(
                            player.status
                          )} rounded-full border border-slate-800`}
                        ></div>
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                            {player.name}
                          </h3>
                          <span className="text-xl font-bold text-orange-400">
                            #{player.number}
                          </span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-400">
                            {player.position}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{player.nationality}</span>
                          <span>•</span>
                          <span>{player.birthPlace}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <div className="text-green-400 font-bold">
                            {player.height}
                          </div>
                          <div className="text-gray-400">Altura</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-400 font-bold">
                            {player.weight}
                          </div>
                          <div className="text-gray-400">Peso</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`font-bold ${getDominantFootColor(
                              player.dominantFoot
                            )}`}
                          >
                            {player.dominantFoot}
                          </div>
                          <div className="text-gray-400">Pie dominante</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(
                            player.status
                          )}`}
                        >
                          {getStatusText(player.status)}
                        </div>
                        <div className="flex items-center gap-2 text-orange-400 group-hover:text-orange-300 transition-colors">
                          <Eye size={16} />
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No players found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayersListInterface;
