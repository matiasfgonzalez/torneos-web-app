import { SectionBadge } from "@/components/ui-dev/section-badge";
import { GradientButton } from "@/components/ui-dev/gradient-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

export function ContactSection() {
  return (
    <section id="contacto" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionBadge>Contacto</SectionBadge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            ¿Tienes Preguntas?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Estamos aquí para ayudarte. Contáctanos y te responderemos lo antes
            posible
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Información de contacto */}
          <div className="border border-gray-200 p-8 rounded-xl shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Información de Contacto
            </h3>

            <div className="space-y-6">
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-[#ad45ff] mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold text-gray-900">Email</h4>
                  <p className="text-gray-600">contacto@golazo.com</p>
                  <p className="text-gray-600">soporte@golazo.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-6 w-6 text-[#ad45ff] mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold text-gray-900">Teléfono</h4>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                  <p className="text-gray-600">Lun - Vie: 9:00 AM - 6:00 PM</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-[#ad45ff] mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold text-gray-900">Oficina</h4>
                  <p className="text-gray-600">123 Sports Avenue</p>
                  <p className="text-gray-600">Ciudad Deportiva, CD 12345</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-[#ad45ff]/10 to-[#a3b3ff]/10 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-2">
                ¿Necesitas una Demo?
              </h4>
              <p className="text-gray-600 mb-4">
                Agenda una demostración personalizada y descubre cómo GOLAZO
                puede transformar la gestión de tus torneos
              </p>
              <GradientButton>Agendar Demo</GradientButton>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className="border border-gray-200 p-8 rounded-xl shadow-sm">
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nombre
                  </label>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Tu nombre"
                    className="w-full"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="empresa"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Empresa/Organización
                </label>
                <Input
                  id="empresa"
                  type="text"
                  placeholder="Nombre de tu empresa"
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="asunto"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Asunto
                </label>
                <Input
                  id="asunto"
                  type="text"
                  placeholder="¿En qué podemos ayudarte?"
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="mensaje"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mensaje
                </label>
                <Textarea
                  id="mensaje"
                  rows={5}
                  placeholder="Cuéntanos más detalles sobre tu consulta..."
                  className="w-full"
                />
              </div>

              <GradientButton type="submit" className="w-full">
                Enviar Mensaje
              </GradientButton>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
