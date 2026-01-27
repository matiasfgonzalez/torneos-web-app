"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Ruler,
  Weight,
  User,
  Shield,
  Trophy,
  Footprints,
  Flag,
  Clock,
  Shirt,
  Goal,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { PlayerWithDetails } from "@/modules/jugadores/actions/getJugadorById";
import { calcularEdad } from "@/lib/calcularEdad";
import { formatDateOk, formatDate } from "@/lib/formatDate";

// Iconos personalizados para redes sociales
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const XTwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// ============================================
// MAPEOS DE ENUMS A ESPAÑOL
// ============================================

// Posiciones del jugador (PlayerPosition enum)
const POSITION_LABELS: Record<string, string> = {
  ARQUERO: "Arquero",
  DEFENSOR_CENTRAL: "Defensor Central",
  LATERAL_DERECHO: "Lateral Derecho",
  LATERAL_IZQUIERDO: "Lateral Izquierdo",
  CARRILERO_DERECHO: "Carrilero Derecho",
  CARRILERO_IZQUIERDO: "Carrilero Izquierdo",
  VOLANTE_DEFENSIVO: "Volante Defensivo",
  PIVOTE: "Pivote",
  VOLANTE_CENTRAL: "Volante Central",
  VOLANTE_OFENSIVO: "Volante Ofensivo",
  INTERIOR_DERECHO: "Interior Derecho",
  INTERIOR_IZQUIERDO: "Interior Izquierdo",
  ENGANCHE: "Enganche",
  EXTREMO_DERECHO: "Extremo Derecho",
  EXTREMO_IZQUIERDO: "Extremo Izquierdo",
  DELANTERO_CENTRO: "Delantero Centro",
  SEGUNDO_DELANTERO: "Segundo Delantero",
  FALSO_9: "Falso 9",
};

// Estado del jugador (PlayerStatus enum)
const STATUS_LABELS: Record<string, string> = {
  ACTIVO: "Activo",
  LESIONADO: "Lesionado",
  SUSPENDIDO: "Suspendido",
  NO_DISPONIBLE: "No Disponible",
  RETIRADO: "Retirado",
  TRANSFERIDO: "Transferido",
  PRUEBA: "A Prueba",
  EXPULSADO: "Expulsado",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVO: "bg-emerald-500/90 text-white border-emerald-400",
  LESIONADO: "bg-red-500/90 text-white border-red-400",
  SUSPENDIDO: "bg-amber-500/90 text-white border-amber-400",
  NO_DISPONIBLE: "bg-gray-500/90 text-white border-gray-400",
  RETIRADO: "bg-slate-600/90 text-white border-slate-500",
  TRANSFERIDO: "bg-blue-500/90 text-white border-blue-400",
  PRUEBA: "bg-purple-500/90 text-white border-purple-400",
  EXPULSADO: "bg-rose-600/90 text-white border-rose-500",
};

// Pie dominante (Foot enum)
const FOOT_LABELS: Record<string, string> = {
  IZQUIERDA: "Izquierda",
  DERECHA: "Derecha",
  AMBOS: "Ambidiestro",
};

// Tipo de tarjeta (CardType enum)
const CARD_TYPE_LABELS: Record<string, string> = {
  AMARILLA: "Amarilla",
  ROJA: "Roja",
};

interface PlayerDetailPageProps {
  readonly player: PlayerWithDetails;
}

export default function PlayerDetailPage({ player }: PlayerDetailPageProps) {
  // Calcular estadísticas del jugador
  const totalGoals =
    player.teamPlayer?.reduce((acc, tp) => acc + (tp.goals?.length || 0), 0) ||
    0;

  const yellowCards =
    player.teamPlayer?.reduce(
      (acc, tp) =>
        acc + (tp.cards?.filter((c) => c.type === "AMARILLA").length || 0),
      0,
    ) || 0;

  const redCards =
    player.teamPlayer?.reduce(
      (acc, tp) =>
        acc + (tp.cards?.filter((c) => c.type === "ROJA").length || 0),
      0,
    ) || 0;

  const teamsPlayed = player.teamPlayer?.length || 0;

  // Obtener equipos activos (sin fecha de salida)
  const activeTeams = player.teamPlayer?.filter((tp) => !tp.leftAt) || [];
  const formerTeams = player.teamPlayer?.filter((tp) => tp.leftAt) || [];

  // Últimos goles
  const recentGoals =
    player.teamPlayer
      ?.flatMap((tp) => tp.goals?.map((g) => ({ ...g, teamPlayer: tp })) || [])
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5) || [];

  // Tarjetas recientes
  const recentCards =
    player.teamPlayer
      ?.flatMap((tp) => tp.cards?.map((c) => ({ ...c, teamPlayer: tp })) || [])
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5) || [];

  const getPositionLabel = (position: string | null) => {
    if (!position) return "Sin posición";
    return POSITION_LABELS[position] || position;
  };

  const getStatusLabel = (status: string) => {
    return STATUS_LABELS[status] || status;
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status] || "bg-gray-500/90 text-white border-gray-400";
  };

  const getFootLabel = (foot: string | null) => {
    if (!foot) return "No especificado";
    return FOOT_LABELS[foot] || foot;
  };

  const getCardTypeLabel = (type: string) => {
    return CARD_TYPE_LABELS[type] || type;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-200 selection:bg-amber-500/30">
      {/* Hero Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl mix-blend-multiply dark:mix-blend-normal" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl mix-blend-multiply dark:mix-blend-normal" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-normal" />

        {/* Líneas decorativas Premium Golazo */}
        <div className="absolute top-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div className="absolute top-24 left-0 w-2/3 h-px bg-gradient-to-r from-transparent via-orange-400/20 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/jugadores"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-amber-400 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Volver a jugadores</span>
        </Link>

        {/* Main Hero Card */}
        <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 mb-8">
          {/* Gold accent lines */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />
          <div className="absolute top-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />

          <div className="flex flex-col lg:flex-row">
            {/* Left Section - Player Image */}
            <div className="lg:w-2/5 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-emerald-500/5 dark:from-amber-500/10 dark:to-emerald-500/10" />

              {/* Player Number Watermark */}
              {player.number && (
                <div className="absolute top-4 left-4 text-[120px] lg:text-[200px] font-black text-slate-900/5 dark:text-white/5 leading-none select-none">
                  {player.number}
                </div>
              )}

              <div className="relative p-8 lg:p-12 flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
                <div className="relative group">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-500/20 dark:from-amber-400/30 dark:to-orange-500/30 rounded-2xl blur-2xl scale-110 group-hover:scale-125 transition-transform duration-500" />

                  {/* Image Container */}
                  <div className="relative w-64 h-80 lg:w-80 lg:h-96 rounded-2xl overflow-hidden border-2 border-amber-400/30 shadow-2xl shadow-slate-400/20 dark:shadow-black/50">
                    {player.imageUrl ? (
                      <img
                        src={player.imageUrl}
                        alt={player.name}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                      />
                    ) : player.imageUrlFace ? (
                      <img
                        src={player.imageUrlFace}
                        alt={player.name}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                        <User className="w-24 h-24 text-slate-400 dark:text-slate-600" />
                      </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent dark:from-black/40" />
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50" />
                  <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-emerald-400 rounded-full animate-pulse delay-300 shadow-lg shadow-emerald-400/50" />
                </div>
              </div>
            </div>

            {/* Right Section - Player Info */}
            <div className="lg:w-3/5 p-8 lg:p-12">
              {/* Header with Name and Status */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {player.number && (
                    <span className="text-5xl lg:text-6xl font-black text-slate-200 dark:text-amber-400/30">
                      #{player.number}
                    </span>
                  )}
                  <Badge
                    className={`${getStatusColor(player.status)} border font-semibold px-3 py-1`}
                  >
                    {getStatusLabel(player.status)}
                  </Badge>
                </div>

                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-amber-100 dark:to-amber-300 bg-clip-text text-transparent tracking-tight mb-3">
                  {player.name}
                </h1>

                {player.position && (
                  <div className="flex items-center gap-2 text-xl text-amber-600 dark:text-amber-400 font-semibold">
                    <Shirt className="w-5 h-5" />
                    <span>{getPositionLabel(player.position)}</span>
                  </div>
                )}

                {player.description && (
                  <p className="mt-4 text-slate-600 dark:text-gray-400 text-lg leading-relaxed max-w-2xl">
                    {player.description}
                  </p>
                )}

                {/* Social Links */}
                {(player.instagramUrl || player.twitterUrl) && (
                  <div className="flex gap-3 mt-5">
                    {player.instagramUrl && (
                      <a
                        href={player.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-gradient-to-br from-pink-500/10 to-purple-500/10 dark:from-pink-500/20 dark:to-purple-500/20 rounded-xl border border-pink-500/30 hover:border-pink-400 hover:scale-110 transition-all duration-300"
                      >
                        <InstagramIcon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                      </a>
                    )}
                    {player.twitterUrl && (
                      <a
                        href={player.twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-gradient-to-br from-slate-500/10 to-gray-500/10 dark:from-slate-500/20 dark:to-gray-500/20 rounded-xl border border-slate-500/30 hover:border-slate-400 hover:scale-110 transition-all duration-300"
                      >
                        <XTwitterIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Fecha de Nacimiento */}
                {player.birthDate && (
                  <div className="group bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 dark:hover:shadow-amber-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                        Fecha de Nacimiento
                      </span>
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatDateOk(player.birthDate, "dd 'de' MMMM yyyy")}
                    </div>
                    <div className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                      {calcularEdad(player.birthDate)} años
                    </div>
                  </div>
                )}

                {/* Lugar de Nacimiento */}
                {player.birthPlace && (
                  <div className="group bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                        Lugar de Nacimiento
                      </span>
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {player.birthPlace}
                    </div>
                  </div>
                )}

                {/* Nacionalidad */}
                {player.nationality && (
                  <div className="group bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Flag className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                        Nacionalidad
                      </span>
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {player.nationality}
                    </div>
                  </div>
                )}

                {/* Altura */}
                {player.height && (
                  <div className="group bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-purple-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Ruler className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                      <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                        Altura
                      </span>
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {player.height} cm
                    </div>
                    <div className="text-sm text-slate-500 dark:text-gray-400">
                      {(player.height / 100).toFixed(2)} m
                    </div>
                  </div>
                )}

                {/* Peso */}
                {player.weight && (
                  <div className="group bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 hover:border-pink-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10 dark:hover:shadow-pink-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Weight className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                      <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                        Peso
                      </span>
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {player.weight} kg
                    </div>
                  </div>
                )}

                {/* Pie Dominante */}
                {player.dominantFoot && (
                  <div className="group bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 hover:border-teal-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 dark:hover:shadow-teal-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Footprints className="w-4 h-4 text-teal-500 dark:text-teal-400" />
                      <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                        Pie Dominante
                      </span>
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {getFootLabel(player.dominantFoot)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Goles */}
          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/95 backdrop-blur-xl border border-amber-200 dark:border-amber-500/30 p-6 text-center group hover:scale-105 transition-transform duration-300 shadow-xl shadow-amber-500/5 dark:shadow-none">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Goal className="w-8 h-8 text-amber-500 dark:text-amber-400 mx-auto mb-3" />
            <div className="text-4xl font-black text-amber-600 dark:text-amber-400 mb-1">
              {totalGoals}
            </div>
            <div className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
              Goles
            </div>
          </Card>

          {/* Equipos */}
          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/30 p-6 text-center group hover:scale-105 transition-transform duration-300 shadow-xl shadow-emerald-500/5 dark:shadow-none">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Shield className="w-8 h-8 text-emerald-500 dark:text-emerald-400 mx-auto mb-3" />
            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
              {teamsPlayed}
            </div>
            <div className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
              Equipos
            </div>
          </Card>

          {/* Tarjetas Amarillas */}
          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/95 backdrop-blur-xl border border-yellow-200 dark:border-yellow-500/30 p-6 text-center group hover:scale-105 transition-transform duration-300 shadow-xl shadow-yellow-500/5 dark:shadow-none">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-8 h-10 bg-yellow-400 rounded-sm mx-auto mb-3 shadow-lg shadow-yellow-400/30" />
            <div className="text-4xl font-black text-yellow-600 dark:text-yellow-400 mb-1">
              {yellowCards}
            </div>
            <div className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
              T. Amarillas
            </div>
          </Card>

          {/* Tarjetas Rojas */}
          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/95 backdrop-blur-xl border border-red-200 dark:border-red-500/30 p-6 text-center group hover:scale-105 transition-transform duration-300 shadow-xl shadow-red-500/5 dark:shadow-none">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-8 h-10 bg-red-500 rounded-sm mx-auto mb-3 shadow-lg shadow-red-500/30" />
            <div className="text-4xl font-black text-red-600 dark:text-red-400 mb-1">
              {redCards}
            </div>
            <div className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
              T. Rojas
            </div>
          </Card>
        </div>

        {/* Teams & Bio Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Active Teams */}
          {activeTeams.length > 0 && (
            <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/30 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />

              <h3 className="flex items-center gap-3 text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-6">
                <Shield className="w-6 h-6" />
                Equipos Actuales
              </h3>

              <div className="space-y-4">
                {activeTeams.map((tp) => (
                  <div
                    key={tp.id}
                    className="bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-500/10 dark:to-slate-800/50 rounded-xl p-4 border border-emerald-100 dark:border-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-400/40 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                        {tp.tournamentTeam?.team?.logoUrl ? (
                          <img
                            src={tp.tournamentTeam.team.logoUrl}
                            alt={tp.tournamentTeam.team.name}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <Shield className="w-6 h-6 text-slate-400 dark:text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 dark:text-white text-lg">
                          {tp.tournamentTeam?.team?.name || "Equipo"}
                        </div>
                        {tp.tournamentTeam?.tournament && (
                          <div className="text-sm text-slate-500 dark:text-gray-400">
                            <Trophy className="w-3 h-3 inline mr-1" />
                            {tp.tournamentTeam.tournament.name}
                          </div>
                        )}
                        <div className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Desde {formatDateOk(tp.joinedAt, "MMMM yyyy")}
                        </div>
                      </div>
                      <div className="text-right">
                        {tp.number && (
                          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            #{tp.number}
                          </div>
                        )}
                        {tp.position && (
                          <div className="text-xs text-slate-400 dark:text-gray-400">
                            {getPositionLabel(tp.position)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Biography */}
          {player.bio && (
            <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/95 backdrop-blur-xl border border-purple-200 dark:border-purple-500/30 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-400" />

              <h3 className="flex items-center gap-3 text-xl font-bold text-purple-600 dark:text-purple-400 mb-6">
                <User className="w-6 h-6" />
                Biografía
              </h3>

              <p className="text-slate-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {player.bio}
              </p>

              {player.joinedAt && (
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Se unió el{" "}
                    {formatDateOk(player.joinedAt, "dd 'de' MMMM 'de' yyyy")}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Former Teams */}
          {formerTeams.length > 0 && (
            <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-600/30 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 to-slate-300 dark:from-slate-500 dark:to-slate-400" />

              <h3 className="flex items-center gap-3 text-xl font-bold text-slate-600 dark:text-slate-400 mb-6">
                <Clock className="w-6 h-6" />
                Historial de Equipos
              </h3>

              <div className="space-y-3">
                {formerTeams.map((tp) => (
                  <div
                    key={tp.id}
                    className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        {tp.tournamentTeam?.team?.logoUrl ? (
                          <img
                            src={tp.tournamentTeam.team.logoUrl}
                            alt={tp.tournamentTeam.team.name}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <Shield className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {tp.tournamentTeam?.team?.name || "Equipo"}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-gray-500">
                          {formatDateOk(tp.joinedAt, "MMM yyyy")} -{" "}
                          {tp.leftAt
                            ? formatDateOk(tp.leftAt, "MMM yyyy")
                            : "Presente"}
                        </div>
                      </div>
                      {tp.number && (
                        <div className="text-lg font-bold text-slate-400 dark:text-slate-500">
                          #{tp.number}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Goals */}
          {recentGoals.length > 0 && (
            <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/95 backdrop-blur-xl border border-amber-200 dark:border-amber-500/30 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400" />

              <h3 className="flex items-center gap-3 text-xl font-bold text-amber-600 dark:text-amber-400 mb-6">
                <Goal className="w-6 h-6" />
                Últimos Goles
              </h3>

              <div className="space-y-3">
                {recentGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="bg-gradient-to-r from-amber-50 to-white dark:from-amber-500/10 dark:to-slate-800/50 rounded-lg p-4 border border-amber-100 dark:border-amber-500/20 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Goal className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                          <span className="font-semibold text-slate-800 dark:text-white">
                            {goal.isPenalty && "⚽ Penal - "}
                            {goal.isOwnGoal && "🔴 Autogol - "}
                            {!goal.isPenalty && !goal.isOwnGoal && "⚽ Gol"}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                          {goal.match?.homeTeam?.team?.name || "Local"} vs{" "}
                          {goal.match?.awayTeam?.team?.name || "Visitante"}
                        </div>
                      </div>
                      <div className="text-right">
                        {goal.minute && (
                          <Badge
                            variant="outline"
                            className="border-amber-500/50 text-amber-600 dark:text-amber-400 font-bold"
                          >
                            {goal.minute}&apos;
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Cards */}
          {recentCards.length > 0 && (
            <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-600/30 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400" />

              <h3 className="flex items-center gap-3 text-xl font-bold text-slate-700 dark:text-gray-300 mb-6">
                <AlertTriangle className="w-6 h-6" />
                Últimas Tarjetas
              </h3>

              <div className="space-y-3">
                {recentCards.map((card) => (
                  <div
                    key={card.id}
                    className={`rounded-lg p-4 border shadow-sm ${
                      card.type === "ROJA"
                        ? "bg-gradient-to-r from-red-50 to-white dark:from-red-500/10 dark:to-slate-800/50 border-red-200 dark:border-red-500/30"
                        : "bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-500/10 dark:to-slate-800/50 border-yellow-200 dark:border-yellow-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-8 rounded-sm shadow-md ${
                            card.type === "ROJA"
                              ? "bg-red-500"
                              : "bg-yellow-400"
                          }`}
                        />
                        <div>
                          <span
                            className={`font-semibold ${
                              card.type === "ROJA"
                                ? "text-red-600 dark:text-red-400"
                                : "text-yellow-600 dark:text-yellow-400"
                            }`}
                          >
                            Tarjeta {getCardTypeLabel(card.type)}
                          </span>
                          {card.reason && (
                            <div className="text-sm text-slate-500 dark:text-gray-400">
                              {card.reason}
                            </div>
                          )}
                        </div>
                      </div>
                      {card.minute && (
                        <Badge
                          variant="outline"
                          className={
                            card.type === "ROJA"
                              ? "border-red-500/50 text-red-600 dark:text-red-400 font-bold"
                              : "border-yellow-500/50 text-yellow-600 dark:text-yellow-400 font-bold"
                          }
                        >
                          {card.minute}&apos;
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Última actualización:{" "}
            {formatDate(
              player.updatedAt,
              "dd 'de' MMMM 'de' yyyy 'a las' HH:mm",
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
