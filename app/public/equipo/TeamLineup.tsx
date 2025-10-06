"use client";

import React, { useState } from "react";
import { Users, Info, TrendingUp, Eye } from "lucide-react";

export interface IPlayer {
  name: string;
  number: number;
  nationality: string;
  position: string;
  age: number;
  rating: number;
  photo?: string;
  imageUrl?: string;
  // Campos opcionales para posiciones específicas
  saves?: number; // solo para goalkeeper
  goals?: number; // solo para striker
}

export interface IPlayers {
  goalkeeper: IPlayer;
  defenders: IPlayer[];
  midfielders: IPlayer[];
  forwards: IPlayer[];
  striker: IPlayer;
}

const TeamLineup = () => {
  const [activePlayer, setActivePlayer] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [screenSize, setScreenSize] = useState("large");
  const [showHeader, setShowHeader] = useState(true);

  // Hook para detectar el tamaño de pantalla
  React.useEffect(() => {
    const checkScreenSize = () => {
      setScreenSize(window.innerWidth >= 1280 ? "large" : "small");
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const players: IPlayers = {
    goalkeeper: {
      name: "Leno",
      number: 1,
      nationality: "de",
      position: "GK",
      age: 31,
      rating: 8.2,
      saves: 4,
      photo: "",
      imageUrl:
        "https://fotos.perfil.com//2022/12/11/900/0/asi-lucia-dibu-martinez-antes-de-integrar-la-seleccion-argentina-1470328.jpg",
    },
    defenders: [
      {
        name: "Tete",
        number: 2,
        nationality: "br",
        position: "RB",
        age: 24,
        rating: 7.8,
        photo: "👤",
      },
      {
        name: "Andersen",
        number: 5,
        nationality: "dk",
        position: "CB",
        age: 27,
        rating: 8.1,
        photo: "👤",
      },
      {
        name: "Bassey",
        number: 3,
        nationality: "ng",
        position: "CB",
        age: 24,
        rating: 7.9,
        photo: "👤",
      },
      {
        name: "Castagne",
        number: 21,
        nationality: "be",
        position: "LB",
        age: 28,
        rating: 7.7,
        photo: "👤",
      },
    ],
    midfielders: [
      {
        name: "Lukić",
        number: 28,
        nationality: "rs",
        position: "CM",
        age: 27,
        rating: 8.0,
        photo: "",
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjCjgVv-4Cl9Z-XQT3uCV_KKtjPzSNG-q2XA&s",
      },
      {
        name: "Berge",
        number: 16,
        nationality: "no",
        position: "CM",
        age: 25,
        rating: 7.6,
        photo: "",
        imageUrl:
          "https://fifpro.org/media/fhmfhvkx/messi-world-cup.jpg?rxy=0.48356841796117644,0.31512414378031967&width=1600&height=1024&rnd=133210253587130000",
      },
    ],
    forwards: [
      {
        name: "Iwobi",
        number: 17,
        nationality: "ng",
        position: "RW",
        age: 27,
        rating: 8.3,
        photo: "👤",
      },
      {
        name: "King",
        number: 11,
        nationality: "no",
        position: "CAM",
        age: 32,
        rating: 7.4,
        photo: "👤",
      },
      {
        name: "Sessegnon",
        number: 19,
        nationality: "us",
        position: "LW",
        age: 23,
        rating: 7.2,
        photo: "👤",
      },
    ],
    striker: {
      name: "Muniz",
      number: 9,
      nationality: "br",
      position: "ST",
      age: 22,
      rating: 7.8,
      goals: 2,
      photo: "👤",
    },
  };

  const substitutes = [
    { name: "Benjamin Lecomte", number: 23, position: "GK", rating: 7.1 },
    { name: "Harrison Reed", number: 6, position: "CM", rating: 7.3 },
    { name: "Raúl Jiménez", number: 7, position: "ST", rating: 7.9 },
    { name: "Harry Wilson", number: 8, position: "RW", rating: 7.8 },
    { name: "Tom Cairney", number: 10, position: "CAM", rating: 7.5 },
    { name: "Adama Traoré", number: 11, position: "RW", rating: 8.1 },
    { name: "Jorge Cuenca", number: 15, position: "CB", rating: 7.4 },
    { name: "Emile Smith Rowe", number: 32, position: "CAM", rating: 8.0 },
    { name: "Antonee Robinson", number: 33, position: "LB", rating: 7.6 },
  ];

  const teamStats = {
    formation: "4-2-3-1",
    averageAge: 26.2,
    averageRating: 7.8,
    totalValue: "€180M",
  };

  const getFlagEmoji = (country: string) => {
    const flags: { [key: string]: string } = {
      de: "🇩🇪",
      br: "🇧🇷",
      dk: "🇩🇰",
      ng: "🇳🇬",
      be: "🇧🇪",
      rs: "🇷🇸",
      no: "🇳🇴",
      us: "🇺🇸",
    };
    return flags[country] || "🏳️";
  };

  const getPositionColor = (position: string) => {
    const colors: { [key: string]: string } = {
      GK: "from-emerald-500 to-emerald-600",
      CB: "from-blue-500 to-blue-600",
      RB: "from-blue-400 to-blue-500",
      LB: "from-blue-400 to-blue-500",
      CM: "from-yellow-500 to-yellow-600",
      CAM: "from-orange-500 to-orange-600",
      RW: "from-red-500 to-red-600",
      LW: "from-red-500 to-red-600",
      ST: "from-purple-500 to-purple-600",
    };
    return colors[position] || "from-gray-500 to-gray-600";
  };

  const PlayerCard = ({
    player,
    isGoalkeeper = false,
    size = "normal",
  }: {
    player: IPlayer;
    isGoalkeeper?: boolean;
    size?: "small" | "normal";
  }) => {
    console.log(isGoalkeeper, size);
    const cardSize =
      size === "small"
        ? "w-10 h-12 sm:w-12 sm:h-14 xl:w-16 xl:h-20"
        : "w-16 h-20";
    const nameSize =
      size === "small" ? "text-xs sm:text-xs xl:text-sm" : "text-sm";
    const numberSize = size === "small" ? "text-xs" : "text-xs";
    const avatarSize =
      size === "small" ? "text-lg sm:text-xl xl:text-2xl" : "text-2xl";

    return (
      <div
        className="relative flex flex-col items-center group cursor-pointer transform transition-all duration-300 hover:scale-110 hover:z-10"
        role="button"
        tabIndex={0}
        onClick={() =>
          setActivePlayer(activePlayer === player.name ? null : player.name)
        }
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setActivePlayer(activePlayer === player.name ? null : player.name);
          }
        }}
      >
        <div
          className={`${cardSize} bg-gradient-to-b ${getPositionColor(
            player.position
          )} rounded-xl shadow-2xl border-2 border-white/30 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-sm`}
          style={
            player.imageUrl
              ? {
                  backgroundImage: `url(${player.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Jersey number */}
          <div
            className={`absolute top-0.5 left-1 text-white font-bold ${numberSize} opacity-90`}
          >
            {player.number}
          </div>

          {/* Flag */}
          <div
            className={`absolute top-0.5 right-1 ${
              size === "small" ? "text-xs" : "text-xs"
            }`}
          >
            {getFlagEmoji(player.nationality)}
          </div>

          {/* Player avatar */}
          <div
            className={`${avatarSize} opacity-90 group-hover:opacity-100 transition-opacity`}
          >
            {player.photo}
          </div>

          {/* Rating badge */}
          <div
            className={`absolute bottom-0.5 left-1/2 transform -translate-x-1/2 bg-black/70 text-white ${
              size === "small" ? "text-xs px-1 py-0.5" : "text-xs px-1.5 py-0.5"
            } rounded-full font-bold`}
          >
            {player.rating}
          </div>
        </div>

        {/* Player name with glassmorphism effect */}
        <div
          className={`mt-1.5 sm:mt-2 bg-black/80 backdrop-blur-md text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg ${nameSize} font-bold min-w-max shadow-xl border border-white/10 group-hover:bg-black/90 transition-all duration-300`}
        >
          {player.name}
        </div>

        {/* Hover stats tooltip */}
        {activePlayer === player.name && (
          <div
            className={
              player.position === "GK"
                ? `absolute bottom-full mb-2 bg-black/90 backdrop-blur-xl text-white p-3 rounded-xl shadow-2xl border border-white/20 min-w-48 z-50 animate-in slide-in-from-top-5 duration-200`
                : `absolute top-full mt-2 bg-black/90 backdrop-blur-xl text-white p-3 rounded-xl shadow-2xl border border-white/20 min-w-48 z-50 animate-in slide-in-from-bottom-5 duration-200`
            }
          >
            <div className="text-sm font-bold mb-2">{player.name}</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-300">Position:</span>
                <span>{player.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Age:</span>
                <span>{player.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Rating:</span>
                <span className="text-yellow-400 font-bold">
                  {player.rating}
                </span>
              </div>
              {player.saves && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Saves:</span>
                  <span className="text-green-400">{player.saves}</span>
                </div>
              )}
              {player.goals && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Goals:</span>
                  <span className="text-red-400">{player.goals}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black dark:from-gray-950 dark:via-black dark:to-gray-900 text-white">
      <div className="flex flex-col xl:flex-row min-h-screen">
        {/* Main field area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Header */}
          <div
            className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md p-4 lg:p-6 transition-all duration-300 ${
              showHeader
                ? "translate-y-0 opacity-100"
                : "-translate-y-full opacity-0"
            }`}
          >
            {/* Toggle button for all screen sizes */}
            <button
              onClick={() => setShowHeader(!showHeader)}
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md text-white p-2 rounded-b-lg border border-white/20 hover:bg-black/80 transition-all duration-300"
            >
              {showHeader ? "✕" : <Eye />}
            </button>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                {/* Fulham logo */}
                <div className="w-12 h-12 xl:w-16 xl:h-16 bg-white rounded-full flex items-center justify-center shadow-2xl">
                  <div className="w-8 h-8 xl:w-12 xl:h-12 bg-red-600 rounded-full flex items-center justify-center transform rotate-45 relative">
                    <div className="w-4 h-0.5 xl:w-6 xl:h-1 bg-white absolute"></div>
                    <div className="w-0.5 h-4 xl:w-1 xl:h-6 bg-white absolute"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl xl:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Fulham FC
                  </h1>
                  <p className="text-sm xl:text-base text-gray-400">
                    Starting XI - {teamStats.formation}
                  </p>
                </div>
              </div>

              {/* ESPN5 VIVO */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="p-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
                >
                  <TrendingUp size={20} />
                </button>
              </div>
            </div>

            {/* Team stats overlay */}
            {showStats && (
              <div className="mt-4 bg-black/60 backdrop-blur-xl rounded-xl p-4 border border-white/20 animate-in slide-in-from-top-5 duration-300">
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-xl xl:text-2xl font-bold text-yellow-400">
                      {teamStats.formation}
                    </div>
                    <div className="text-xs text-gray-400">Formation</div>
                  </div>
                  <div>
                    <div className="text-xl xl:text-2xl font-bold text-blue-400">
                      {teamStats.averageAge}
                    </div>
                    <div className="text-xs text-gray-400">Avg Age</div>
                  </div>
                  <div>
                    <div className="text-xl xl:text-2xl font-bold text-green-400">
                      {teamStats.averageRating}
                    </div>
                    <div className="text-xs text-gray-400">Avg Rating</div>
                  </div>
                  <div>
                    <div className="text-xl xl:text-2xl font-bold text-purple-400">
                      {teamStats.totalValue}
                    </div>
                    <div className="text-xs text-gray-400">Total Value</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Minimized header for all screen sizes when collapsed */}
          {!showHeader && (
            <div className="absolute top-0 left-0 right-0 z-10 bg-black/40 backdrop-blur-sm p-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 xl:w-10 xl:h-10 bg-white rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 xl:w-8 xl:h-8 bg-red-600 rounded-full flex items-center justify-center transform rotate-45 relative">
                      <div className="w-3 h-0.5 xl:w-4 xl:h-0.5 bg-white absolute"></div>
                      <div className="w-0.5 h-3 xl:w-0.5 xl:h-4 bg-white absolute"></div>
                    </div>
                  </div>
                  <span className="text-sm xl:text-base font-bold text-white">
                    Fulham FC
                  </span>
                </div>
                <div className="text-xs xl:text-sm bg-red-600 text-white px-2 py-1 rounded font-bold">
                  VIVO
                </div>
              </div>
              <button
                onClick={() => setShowHeader(true)}
                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md text-white p-1.5 xl:p-2 rounded-b-lg border border-white/20 hover:bg-black/80 transition-all duration-300"
              >
                <Eye />
              </button>
            </div>
          )}

          {/* Football field with enhanced graphics */}
          <div className="relative w-full h-screen xl:h-screen bg-gradient-to-b from-green-400 via-green-500 to-green-600 overflow-hidden">
            {/* Grass texture overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-300/20 via-transparent to-green-700/20"></div>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.02) 10px,
                rgba(255,255,255,0.02) 11px
              )`,
              }}
            ></div>

            {/* Field lines with glow effect */}
            <div className="absolute inset-0">
              {/* Sidelines */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/90 shadow-white/50 shadow-sm"></div>
              <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/90 shadow-white/50 shadow-sm"></div>

              {/* Goal lines */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/90 shadow-white/50 shadow-sm"></div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/90 shadow-white/50 shadow-sm"></div>

              {/* Center line */}
              <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-0.5 bg-white/90 shadow-white/50 shadow-sm"></div>

              {/* Center circle */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 xl:w-32 xl:h-32 border-2 border-white/90 rounded-full shadow-white/50 shadow-lg"></div>
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-white/50 shadow-lg"></div>

              {/* Top penalty area */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-16 xl:w-64 xl:h-20 border-2 border-white/90 border-t-0 shadow-white/30 shadow-lg"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-8 xl:w-32 xl:h-12 border-2 border-white/90 border-t-0 shadow-white/30 shadow-lg"></div>

              {/* Top goal */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-3 xl:w-16 xl:h-4 bg-white shadow-white/50 shadow-lg"></div>

              {/* Bottom penalty area */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-16 xl:w-64 xl:h-20 border-2 border-white/90 border-b-0 shadow-white/30 shadow-lg"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-8 xl:w-32 xl:h-12 border-2 border-white/90 border-b-0 shadow-white/30 shadow-lg"></div>

              {/* Bottom goal */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-3 xl:w-16 xl:h-4 bg-white shadow-white/50 shadow-lg"></div>

              {/* Corner arcs */}
              <div className="absolute top-0 left-0 w-6 h-6 border-b-2 border-r-2 border-white/90 rounded-br-full"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-b-2 border-l-2 border-white/90 rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-t-2 border-r-2 border-white/90 rounded-tr-full"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-t-2 border-l-2 border-white/90 rounded-tl-full"></div>

              {/* Penalty spots */}
              <div className="absolute top-14 xl:top-16 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-white/50 shadow-sm"></div>
              <div className="absolute bottom-14 xl:bottom-16 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-white/50 shadow-sm"></div>

              {/* Penalty arcs */}
              <div className="absolute top-12 xl:top-14 left-1/2 transform -translate-x-1/2 w-16 h-8 xl:w-20 xl:h-10 border-2 border-white/90 border-t-0 rounded-b-full"></div>
              <div className="absolute bottom-12 xl:bottom-14 left-1/2 transform -translate-x-1/2 w-16 h-8 xl:w-20 xl:h-10 border-2 border-white/90 border-b-0 rounded-t-full"></div>
            </div>

            {/* Players positioned on field with responsive spacing */}
            <div
              className={`absolute inset-0 flex flex-col justify-between px-4 xl:px-8 transition-all duration-300 ${
                showHeader
                  ? "py-16 sm:py-18 md:py-20 xl:py-24"
                  : "py-12 sm:py-14 md:py-16 xl:py-16"
              }`}
            >
              {/* Striker */}
              <div className="flex justify-center mb-3 sm:mb-4 xl:mb-8">
                <PlayerCard
                  player={players.striker}
                  size={screenSize === "large" ? "normal" : "small"}
                />
              </div>

              {/* Forwards */}
              <div className="flex justify-center space-x-4 sm:space-x-6 md:space-x-8 xl:space-x-16 mb-4 sm:mb-6 xl:mb-12">
                {players.forwards.map((player, idx) => (
                  <PlayerCard
                    key={idx}
                    player={player}
                    size={screenSize === "large" ? "normal" : "small"}
                  />
                ))}
              </div>

              {/* Midfielders */}
              <div className="flex justify-center space-x-6 sm:space-x-8 md:space-x-12 xl:space-x-24 mb-6 sm:mb-8 xl:mb-16">
                {players.midfielders.map((player, idx) => (
                  <PlayerCard
                    key={idx}
                    player={player}
                    size={screenSize === "large" ? "normal" : "small"}
                  />
                ))}
              </div>

              {/* Defenders */}
              <div className="flex justify-center space-x-3 sm:space-x-4 md:space-x-6 xl:space-x-12 mb-6 sm:mb-8 xl:mb-16">
                {players.defenders.map((player, idx) => (
                  <PlayerCard
                    key={idx}
                    player={player}
                    size={screenSize === "large" ? "normal" : "small"}
                  />
                ))}
              </div>

              {/* Goalkeeper */}
              <div className="flex justify-center">
                <PlayerCard
                  player={players.goalkeeper}
                  isGoalkeeper={true}
                  size={screenSize === "large" ? "normal" : "small"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar - Enhanced substitutes panel */}
        <div className="w-full xl:w-80 2xl:w-96 bg-gradient-to-b from-gray-800/95 to-gray-900/95 backdrop-blur-xl xl:border-l border-white/10 shadow-2xl">
          <div className="p-6 xl:h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-blue-400" size={24} />
              <h2 className="text-xl xl:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Substitutes
              </h2>
            </div>

            {/* Substitutes list */}
            <div className="flex-1 space-y-3 xl:overflow-y-auto xl:max-h-4/5">
              {substitutes.map((sub, idx) => (
                <div
                  key={idx}
                  className="flex items-center p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 group-hover:scale-110 transition-transform duration-300">
                    {sub.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm xl:text-base text-white truncate">
                      {sub.name}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                        {sub.position}
                      </span>
                      <span className="text-yellow-400 font-bold">
                        {sub.rating}
                      </span>
                    </div>
                  </div>
                  <Info
                    className="text-gray-400 group-hover:text-white transition-colors duration-300"
                    size={16}
                  />
                </div>
              ))}
            </div>

            {/* Footer stats */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-white/10 backdrop-blur-md">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {players.defenders.length +
                    players.midfielders.length +
                    players.forwards.length +
                    2}
                </div>
                <div className="text-xs text-gray-300 uppercase tracking-wider">
                  Total Players
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamLineup;
