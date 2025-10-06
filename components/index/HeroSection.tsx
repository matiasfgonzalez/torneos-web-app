"use client";

import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center relative px-4 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="relative z-10 max-w-3xl animate-fadeInUp">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-white via-purple-500 to-indigo-300 bg-clip-text text-transparent animate-gradient">
          La Casa del Fútbol Local{" "}
          <span className="block text-purple-500 dark:text-purple-400 text-6xl md:text-7xl drop-shadow-lg">
            GOLAZO
          </span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-300 dark:text-gray-200">
          Sigue todos los torneos, resultados, estadísticas y noticias del
          fútbol de tu región en tiempo real.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/public/torneos">
            <button className="cursor-pointer px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 font-semibold shadow-lg hover:scale-105 transition">
              Ver Torneos Activos
            </button>{" "}
          </Link>
          <Link href="/public/noticias">
            <button className="cursor-pointer px-6 py-3 rounded-xl border border-white/20 dark:border-gray-600 bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 font-semibold text-white">
              Últimas Noticias
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
