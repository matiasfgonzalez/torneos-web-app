import { GradientButton } from "@/components/ui-dev/gradient-button";

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          ¿Listo para Revolucionar tus Torneos?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Únete a miles de organizadores que ya confían en GOLAZO para gestionar
          sus competencias deportivas
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <GradientButton
            size="lg"
            className="bg-white text-[#ad45ff] hover:bg-gray-50 border-0"
          >
            Registrarse Gratis
          </GradientButton>
          <button className="px-8 py-3 text-white border-2 border-white rounded-lg hover:bg-white hover:text-[#ad45ff] transition-colors font-semibold">
            Ver Demo
          </button>
        </div>
      </div>
    </section>
  );
}
