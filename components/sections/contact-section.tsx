import { GradientButton } from "@/components/ui-dev/gradient-button";
import { GradientText } from "@/components/ui-dev/gradient-text";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, Calendar, ArrowRight } from "lucide-react";

export function ContactSection() {
  return (
    <section
      id="contacto"
      className="relative py-24 bg-white dark:bg-gray-900 overflow-hidden"
    >
      {/* Elemento decorativo */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#ad45ff]/5 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#ad45ff] mb-4">
            Contacto
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            ¿Tienes <GradientText>preguntas</GradientText>?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Estamos aquí para ayudarte. Contáctanos y te responderemos lo antes
            posible
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Información de contacto */}
          <div className="space-y-8">
            {/* Card de información */}
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-3xl p-8 border border-gray-100 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                Información de Contacto
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#ad45ff]/10 to-[#a3b3ff]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="h-5 w-5 text-[#ad45ff]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Email
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      matiasgonzalez.652@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#ad45ff]/10 to-[#a3b3ff]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="h-5 w-5 text-[#ad45ff]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Teléfono
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      +54 9 345 4432164
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Lun - Vie: 9:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#ad45ff]/10 to-[#a3b3ff]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="h-5 w-5 text-[#ad45ff]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Oficina
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Oro Verde, Entre Rios, Argentina
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card de Demo */}
            <div className="relative overflow-hidden rounded-3xl">
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff]/30 to-[#a3b3ff]/30 blur-xl" />

              <div className="relative bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-3xl p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6" />
                  <h4 className="font-bold text-xl">¿Necesitas una Demo?</h4>
                </div>
                <p className="text-white/90 mb-6 leading-relaxed">
                  Agenda una demostración personalizada y descubre cómo GOLAZO
                  puede transformar la gestión de tus torneos
                </p>
                <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 font-semibold transition-colors">
                  Agendar Demo
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-xl shadow-gray-100/50 dark:shadow-none">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                Envíanos un mensaje
              </h3>

              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="nombre"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Nombre
                    </label>
                    <Input
                      id="nombre"
                      type="text"
                      placeholder="Tu nombre"
                      className="h-12 rounded-xl border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] focus:ring-[#ad45ff]/20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      className="h-12 rounded-xl border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] focus:ring-[#ad45ff]/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="empresa"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Empresa/Organización
                  </label>
                  <Input
                    id="empresa"
                    type="text"
                    placeholder="Nombre de tu empresa"
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] focus:ring-[#ad45ff]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="asunto"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Asunto
                  </label>
                  <Input
                    id="asunto"
                    type="text"
                    placeholder="¿En qué podemos ayudarte?"
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] focus:ring-[#ad45ff]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mensaje"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Mensaje
                  </label>
                  <Textarea
                    id="mensaje"
                    rows={5}
                    placeholder="Cuéntanos más detalles sobre tu consulta..."
                    className="rounded-xl border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] focus:ring-[#ad45ff]/20 resize-none"
                  />
                </div>

                <GradientButton
                  type="submit"
                  className="w-full py-4 text-lg shadow-lg shadow-[#ad45ff]/25"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Enviar Mensaje
                </GradientButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
