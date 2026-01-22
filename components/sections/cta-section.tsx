import { GradientButton } from "@/components/ui-dev/gradient-button";
import { ArrowRight, Play, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background con gradiente premium */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ad45ff] via-[#9a4dff] to-[#a3b3ff]" />

      {/* Patrón decorativo overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Elementos decorativos flotantes */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge premium */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-medium">
            Únete a +10,000 organizadores
          </span>
        </div>

        {/* Título impactante */}
        <h2 className="text-4xl lg:text-6xl font-bold text-white mb-8 leading-tight">
          ¿Listo para llevar tus torneos{" "}
          <span className="relative inline-block">
            al siguiente nivel?
            <svg
              className="absolute -bottom-2 left-0 w-full"
              height="10"
              viewBox="0 0 300 10"
              fill="none"
            >
              <path
                d="M2 7C60 2 150 2 298 7"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h2>

        <p className="text-xl lg:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
          Comienza hoy mismo y descubre por qué miles de organizadores eligen
          GOLAZO para gestionar sus competencias deportivas
        </p>

        {/* CTAs con diseño premium */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <GradientButton className="bg-white text-[#ad45ff] hover:bg-gray-50 border-0 shadow-2xl hover:shadow-3xl px-8 py-4 text-lg font-semibold hover:-translate-y-1 transition-all duration-300">
            Registrarse Gratis
            <ArrowRight className="w-5 h-5 ml-2" />
          </GradientButton>
          <button className="group flex items-center justify-center gap-3 px-8 py-4 text-white border-2 border-white/30 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 font-semibold text-lg hover:-translate-y-1">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Play className="w-5 h-5 fill-white text-white ml-0.5" />
            </div>
            Ver Demo
          </button>
        </div>

        {/* Garantías */}
        <div className="flex flex-wrap justify-center gap-8 mt-16 pt-8 border-t border-white/20">
          <div className="flex items-center gap-2 text-white/80">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">
              14 días de prueba gratis
            </span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">Sin tarjeta de crédito</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">Cancela cuando quieras</span>
          </div>
        </div>
      </div>
    </section>
  );
}
