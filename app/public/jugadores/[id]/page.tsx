"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Ruler,
  Weight,
  Users,
  Trophy,
  Instagram,
  Twitter,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Enums
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

// Interfaces
export interface TeamPlayer {
  id: string;
  teamId: string;
  playerId: string;
  joinedAt?: Date;
  leftAt?: Date;
  number?: number;
  position?: string;
  team: {
    id: string;
    name: string;
    logo?: string;
    country?: string;
    league?: string;
    colors: {
      primary: string;
      secondary: string;
    };
  };
}

export interface Player {
  id: string;
  name: string;
  birthDate?: Date;
  birthPlace?: string;
  nationality?: string;
  height?: number;
  weight?: number;
  dominantFoot?: Foot;
  position?: string;
  number?: number;
  imageUrl?: string;
  imageUrlFace?: string;
  description?: string;
  bio?: string;
  status: PlayerStatus;
  joinedAt?: Date;
  instagramUrl?: string;
  twitterUrl?: string;
  teamPlayer?: TeamPlayer[];
  createdAt: Date;
  updatedAt: Date;
}

const PlayerCard = () => {
  const [showAllTeams, setShowAllTeams] = useState(false);

  // Datos completos del jugador usando la nueva interface
  const player: Player = {
    id: "hk-001",
    name: "HARRY KANE",
    birthDate: new Date("1993-07-28"),
    birthPlace: "Walthamstow, London",
    nationality: "England",
    height: 188, // cm
    weight: 86, // kg
    dominantFoot: Foot.DERECHA,
    position: "Striker",
    number: 9,
    imageUrl: "https://i.ebayimg.com/images/g/UGYAAOSwOYRmdEpn/s-l400.jpg",
    imageUrlFace:
      "https://editorial.uefa.com/resources/023f-0e9821b132ca-4255d7d6abf2-1000/harry_kane_tottenham_.jpeg",
    description:
      "Clinical striker with exceptional finishing and leadership qualities",
    bio: "Harry Kane is an English professional footballer who plays as a striker. Known for his clinical finishing, aerial ability, and playmaking skills.",
    status: PlayerStatus.ACTIVO,
    joinedAt: new Date("2023-08-01"),
    instagramUrl: "https://instagram.com/harrykane",
    twitterUrl: "https://twitter.com/HKane",
    teamPlayer: [
      {
        id: "tp-001",
        teamId: "bayern-001",
        playerId: "hk-001",
        joinedAt: new Date("2023-08-01"),
        number: 9,
        position: "Striker",
        team: {
          id: "bayern-001",
          name: "FC Bayern Munich",
          logo: "🏆",
          country: "Germany",
          league: "Bundesliga",
          colors: { primary: "#DC052D", secondary: "#FFFFFF" },
        },
      },
      {
        id: "tp-002",
        teamId: "tottenham-001",
        playerId: "hk-001",
        joinedAt: new Date("2009-07-01"),
        leftAt: new Date("2023-07-31"),
        number: 10,
        position: "Striker",
        team: {
          id: "tottenham-001",
          name: "Tottenham Hotspur",
          logo: "⚪",
          country: "England",
          league: "Premier League",
          colors: { primary: "#132257", secondary: "#FFFFFF" },
        },
      },
      {
        id: "tp-003",
        teamId: "england-001",
        playerId: "hk-001",
        joinedAt: new Date("2015-03-01"),
        number: 9,
        position: "Captain/Striker",
        team: {
          id: "england-001",
          name: "England National Team",
          logo: "🦁",
          country: "England",
          league: "International",
          colors: { primary: "#FFFFFF", secondary: "#1E3A8A" },
        },
      },
      {
        id: "tp-004",
        teamId: "leicester-001",
        playerId: "hk-001",
        joinedAt: new Date("2013-01-01"),
        leftAt: new Date("2013-05-31"),
        number: 37,
        position: "Striker",
        team: {
          id: "leicester-001",
          name: "Leicester City (Loan)",
          logo: "🦊",
          country: "England",
          league: "Premier League",
          colors: { primary: "#003090", secondary: "#FDBB30" },
        },
      },
      {
        id: "tp-005",
        teamId: "norwich-001",
        playerId: "hk-001",
        joinedAt: new Date("2012-08-01"),
        leftAt: new Date("2013-01-31"),
        number: 40,
        position: "Striker",
        team: {
          id: "norwich-001",
          name: "Norwich City (Loan)",
          logo: "🐤",
          country: "England",
          league: "Premier League",
          colors: { primary: "#FFF200", secondary: "#00A650" },
        },
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Stats adicionales para mostrar
  const careerStats = {
    international: { matches: 75, goals: 51, assists: 16 },
    club: { matches: 348, goals: 267, assists: 43 },
    totalGoals: 318,
    trophies: 12,
  };

  const getStatusColor = (status: PlayerStatus) => {
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

  const getStatusText = (status: PlayerStatus) => {
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDateRange = (joinedAt?: Date, leftAt?: Date) => {
    if (!joinedAt) return "Unknown period";
    const joined = formatDate(joinedAt);
    if (leftAt) {
      return `${joined} - ${formatDate(leftAt)}`;
    }
    return `${joined} - Present`;
  };

  const calculateYearsAtTeam = (joinedAt?: Date, leftAt?: Date) => {
    if (!joinedAt) return 0;
    const endDate = leftAt || new Date();
    const years =
      (endDate.getTime() - joinedAt.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0.1, years);
  };

  const currentTeam = player.teamPlayer?.find((tp) => !tp.leftAt);
  const formerTeams = player.teamPlayer?.filter((tp) => tp.leftAt) || [];
  const displayTeams = showAllTeams ? formerTeams : formerTeams.slice(0, 2);

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-slate-700">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-orange-500/20 to-pink-500/20 rounded-full blur-3xl transform -translate-x-20 translate-y-20"></div>

          {/* Geometric accents */}
          <div className="absolute top-10 right-20 w-32 h-0.5 bg-gradient-to-r from-orange-400 to-transparent"></div>
          <div className="absolute top-16 right-24 w-24 h-0.5 bg-gradient-to-r from-blue-400 to-transparent"></div>
          <div className="absolute bottom-20 left-20 w-40 h-0.5 bg-gradient-to-l from-purple-400 to-transparent"></div>
        </div>

        <div className="relative z-10">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-orange-500/10 to-blue-500/10 backdrop-blur-sm border-b border-slate-700 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-6xl lg:text-8xl font-bold text-orange-400 opacity-20">
                  #{player.number}
                </div>
                <div>
                  <div className="text-sm font-medium text-orange-300 mb-1 tracking-wider">
                    FIFA WORLD CUP QATAR 2022
                  </div>
                  <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent">
                    {player.name}
                  </h1>
                  <p className="text-gray-300 mt-1">{player.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(
                    player.status
                  )}`}
                >
                  {getStatusText(player.status)}
                </div>
                <div className="flex gap-2">
                  {player.instagramUrl && (
                    <div className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
                      <Instagram size={16} className="text-white" />
                    </div>
                  )}
                  {player.twitterUrl && (
                    <div className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
                      <Twitter size={16} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row">
            {/* Left section - Player Image */}
            <div className="xl:w-2/5 flex items-center justify-center p-6 lg:p-10">
              <div className="relative">
                {/* Mobile: Circular image */}
                <div className="block xl:hidden w-64 h-64 rounded-full overflow-hidden border-4 border-orange-400/30 shadow-2xl">
                  <img
                    src={player.imageUrlFace}
                    alt={player.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Desktop: Full image - Much larger */}
                <div className="hidden xl:block w-96 h-3/4 rounded-2xl overflow-hidden border-4 border-orange-400/30 shadow-2xl">
                  <img
                    src={player.imageUrl}
                    alt={player.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-orange-400 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-400 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>

            {/* Right section - Player Info */}
            <div className="xl:w-3/5 p-6 lg:p-8 text-white">
              {/* Personal Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar size={16} className="text-orange-400" />
                    <span className="text-xs font-semibold text-gray-400 tracking-wider">
                      BIRTH DATE
                    </span>
                  </div>
                  <div className="text-lg font-bold">
                    {player.birthDate ? formatDate(player.birthDate) : "N/A"}
                  </div>
                  <div className="text-sm text-gray-400">
                    {player.birthDate
                      ? `${calculateAge(player.birthDate)} years old`
                      : ""}
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin size={16} className="text-blue-400" />
                    <span className="text-xs font-semibold text-gray-400 tracking-wider">
                      BIRTH PLACE
                    </span>
                  </div>
                  <div className="text-lg font-bold">
                    {player.birthPlace || "N/A"}
                  </div>
                  <div className="text-sm text-gray-400">
                    {player.nationality}
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Users size={16} className="text-green-400" />
                    <span className="text-xs font-semibold text-gray-400 tracking-wider">
                      POSITION
                    </span>
                  </div>
                  <div className="text-lg font-bold">
                    {player.position || "N/A"}
                  </div>
                  <div className="text-sm text-gray-400">#{player.number}</div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Ruler size={16} className="text-purple-400" />
                    <span className="text-xs font-semibold text-gray-400 tracking-wider">
                      HEIGHT
                    </span>
                  </div>
                  <div className="text-lg font-bold">
                    {player.height ? `${player.height} cm` : "N/A"}
                  </div>
                  <div className="text-sm text-gray-400">
                    {player.height
                      ? `${(player.height / 30.48).toFixed(1)} ft`
                      : ""}
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Weight size={16} className="text-pink-400" />
                    <span className="text-xs font-semibold text-gray-400 tracking-wider">
                      WEIGHT
                    </span>
                  </div>
                  <div className="text-lg font-bold">
                    {player.weight ? `${player.weight} kg` : "N/A"}
                  </div>
                  <div className="text-sm text-gray-400">
                    {player.weight
                      ? `${(player.weight * 2.205).toFixed(0)} lbs`
                      : ""}
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy size={16} className="text-yellow-400" />
                    <span className="text-xs font-semibold text-gray-400 tracking-wider">
                      DOMINANT FOOT
                    </span>
                  </div>
                  <div className="text-lg font-bold">
                    {player.dominantFoot || "N/A"}
                  </div>
                  <div className="text-sm text-gray-400">Preferred</div>
                </div>
              </div>

              {/* TEAMS SECTION - NEW! */}
              <div className="space-y-6 mb-8">
                {/* Current Team */}
                {currentTeam && (
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
                    <h3 className="text-xl font-bold text-green-300 mb-4 tracking-wider flex items-center gap-2">
                      <Shield size={20} className="text-green-400" />
                      CURRENT TEAM
                    </h3>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {currentTeam.team.logo}
                          </div>
                          <div>
                            <div className="text-lg font-bold text-white">
                              {currentTeam.team.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {currentTeam.team.league} •{" "}
                              {currentTeam.team.country}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-300">
                            #{currentTeam.number}
                          </div>
                          <div className="text-xs text-gray-400">
                            {currentTeam.position}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">
                          Joined:{" "}
                          {currentTeam.joinedAt
                            ? formatDate(currentTeam.joinedAt)
                            : "N/A"}
                        </span>
                        <span className="text-green-300 font-semibold">
                          {calculateYearsAtTeam(currentTeam.joinedAt).toFixed(
                            1
                          )}{" "}
                          years
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Career History */}
                {formerTeams.length > 0 && (
                  <div className="bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-xl p-6 border border-slate-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-300 tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                        CAREER HISTORY
                      </h3>
                      {formerTeams.length > 2 && (
                        <button
                          onClick={() => setShowAllTeams(!showAllTeams)}
                          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                          {showAllTeams
                            ? "Show Less"
                            : `Show All (${formerTeams.length})`}
                          {showAllTeams ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {displayTeams.map((teamPlayer) => (
                        <div
                          key={teamPlayer.id}
                          className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-xl">
                                {teamPlayer.team.logo}
                              </div>
                              <div>
                                <div className="text-base font-semibold text-white">
                                  {teamPlayer.team.name}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {teamPlayer.team.league} •{" "}
                                  {teamPlayer.team.country}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {formatDateRange(
                                    teamPlayer.joinedAt,
                                    teamPlayer.leftAt
                                  )}{" "}
                                  •{" "}
                                  {calculateYearsAtTeam(
                                    teamPlayer.joinedAt,
                                    teamPlayer.leftAt
                                  ).toFixed(1)}{" "}
                                  years
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-slate-300">
                                #{teamPlayer.number}
                              </div>
                              <div className="text-xs text-gray-400">
                                {teamPlayer.position}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Career Statistics */}
              <div className="space-y-6">
                {/* International Career */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
                  <h3 className="text-xl font-bold text-blue-300 mb-4 tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    INTERNATIONAL CAREER
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-300 mb-1">
                        {careerStats.international.matches}
                      </div>
                      <div className="text-xs font-semibold text-gray-400">
                        MATCHES
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-300 mb-1">
                        {careerStats.international.goals}
                      </div>
                      <div className="text-xs font-semibold text-gray-400">
                        GOALS
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-300 mb-1">
                        {careerStats.international.assists}
                      </div>
                      <div className="text-xs font-semibold text-gray-400">
                        ASSISTS
                      </div>
                    </div>
                  </div>
                </div>

                {/* Club Career */}
                <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-xl p-6 border border-orange-500/20">
                  <h3 className="text-xl font-bold text-orange-300 mb-4 tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    CLUB CAREER
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-300 mb-1">
                        {careerStats.club.matches}
                      </div>
                      <div className="text-xs font-semibold text-gray-400">
                        MATCHES
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-300 mb-1">
                        {careerStats.club.goals}
                      </div>
                      <div className="text-xs font-semibold text-gray-400">
                        GOALS
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-300 mb-1">
                        {careerStats.club.assists}
                      </div>
                      <div className="text-xs font-semibold text-gray-400">
                        ASSISTS
                      </div>
                    </div>
                  </div>
                </div>

                {/* Career Highlights */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-500/20 text-center">
                    <div className="text-4xl font-bold text-yellow-300 mb-1">
                      {careerStats.totalGoals}
                    </div>
                    <div className="text-xs font-semibold text-gray-400">
                      TOTAL GOALS
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-xl p-6 border border-green-500/20 text-center">
                    <div className="text-4xl font-bold text-green-300 mb-1">
                      {careerStats.trophies}
                    </div>
                    <div className="text-xs font-semibold text-gray-400">
                      TROPHIES
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              {player.bio && (
                <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h4 className="text-lg font-bold text-white mb-3">
                    Biography
                  </h4>
                  <p className="text-gray-300 leading-relaxed">{player.bio}</p>
                  {player.joinedAt && (
                    <div className="mt-4 text-sm text-gray-400">
                      Joined: {formatDate(player.joinedAt)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PlayerCard;
