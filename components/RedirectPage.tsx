import React from "react";
import {
  Trophy,
  BarChart3,
  Users,
  Calendar,
  ArrowRight,
  Star,
} from "lucide-react";
import Link from "next/link";

const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-16 w-48 h-48 bg-purple-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-indigo-500/10 rounded-full blur-lg"></div>
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Panel principal de bienvenida */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-blue-400/30">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-blue-200">
              Plataforma #1 en gestión deportiva
            </span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            ¡Bienvenido a{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              GOLAZO
            </span>
            !
          </h1>

          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            La plataforma más completa para la gestión deportiva. Accede a todos
            los torneos, estadísticas y noticias en un solo lugar.
          </p>

          {/* Características principales */}
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-slate-300">
                Estadísticas en tiempo real
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-slate-300">Gestión de equipos</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <Calendar className="w-5 h-5 text-green-400" />
              <span className="text-sm text-slate-300">
                Calendario de partidos
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-slate-300">
                Seguimiento de torneos
              </span>
            </div>
          </div>

          <button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg inline-flex items-center gap-3">
            <Link href="/public/index">INGRESAR</Link>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Panel de la tarjeta mejorada */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl blur-xl"></div>

            {/* Tarjeta principal */}
            <div className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              {/* Icono mejorado */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">
                  ¡Bienvenido!
                </h2>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 tracking-wider">
                  GOLAZO
                </h3>
                <p className="text-slate-300 mb-8 leading-relaxed">
                  Tu plataforma de gestión deportiva te está esperando. Descubre
                  un mundo de posibilidades.
                </p>

                {/* Botón secundario */}
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 mb-4 shadow-lg">
                  COMENZAR AHORA
                </button>

                <p className="text-xs text-slate-400">
                  Accede a todos los torneos, estadísticas y noticias
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
