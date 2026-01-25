import { Star, Quote } from "lucide-react";
import { testimonials } from "@/lib/constants/testimonials";
import { GradientText } from "@/components/ui-dev/gradient-text";

export function SocialProofSection() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ad45ff]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#a3b3ff]/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#ad45ff] mb-4">
            Testimonios
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Lo que dicen nuestros <GradientText>usuarios</GradientText>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Miles de organizadores ya transformaron sus torneos con GOLAZO
          </p>
        </div>

        {/* Grid de testimonios */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group relative">
              <div className="relative h-full p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:shadow-[#ad45ff]/5 transition-all duration-300 hover:-translate-y-1">
                {/* Quote icon decorativo */}
                <div className="absolute -top-4 left-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center shadow-lg shadow-[#ad45ff]/25">
                    <Quote className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Rating con estilo premium */}
                <div className="flex items-center gap-1 mb-6 mt-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Contenido del testimonio */}
                <blockquote className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8 text-lg">
                  &ldquo;{testimonial.content}&rdquo;
                </blockquote>

                {/* Autor */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                  {/* Avatar placeholder con iniciales */}
                  <div className="w-12 h-12 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats de confianza */}
        <div className="mt-20 pt-12 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent mb-2">
                4.9/5
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                Valoración promedio
              </div>
            </div>
            <div className="group">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent mb-2">
                500+
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                Reseñas verificadas
              </div>
            </div>
            <div className="group">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent mb-2">
                98%
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                Satisfacción
              </div>
            </div>
            <div className="group">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                Soporte disponible
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
