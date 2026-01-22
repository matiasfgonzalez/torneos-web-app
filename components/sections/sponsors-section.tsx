import { SPONSORS, featuredSponsor } from "@/lib/constants/sponsors";
import { GradientButton } from "@/components/ui-dev/gradient-button";
import { GradientText } from "@/components/ui-dev/gradient-text";
import { ArrowRight, Handshake } from "lucide-react";

export function SponsorsSection() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ad45ff 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#ad45ff] mb-4">
            Nuestros partners
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Empresas que <GradientText>confían</GradientText> en GOLAZO
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Únete a las marcas líderes que apoyan el deporte y potencian sus
            torneos con nosotros
          </p>
        </div>

        {/* Grid de patrocinadores con diseño premium */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-20">
          {SPONSORS.map((sponsor, index) => (
            <div
              key={sponsor.id}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative flex items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-[#ad45ff]/30 dark:hover:border-[#ad45ff]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#ad45ff]/5 hover:-translate-y-1">
                <img
                  src={sponsor.logo || "/placeholder.svg"}
                  alt={sponsor.name}
                  className="h-12 w-auto object-contain grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-300"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Patrocinador destacado con diseño premium */}
        <div className="relative mb-20">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff]/20 to-[#a3b3ff]/20 rounded-3xl blur-2xl transform scale-95" />

          <div className="relative bg-gradient-to-br from-[#ad45ff] via-[#9a4dff] to-[#a3b3ff] rounded-3xl p-12 text-white overflow-hidden">
            {/* Patrón decorativo */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="relative flex flex-col lg:flex-row items-center gap-12">
              {/* Logo del sponsor */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center p-4">
                  <img
                    src={featuredSponsor.logo || "/placeholder.svg"}
                    alt="Patrocinador Principal"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Contenido */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1 text-sm font-medium mb-4">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Patrocinador Principal
                </div>
                <blockquote className="text-2xl font-medium mb-6 leading-relaxed">
                  "GOLAZO ha revolucionado la forma en que gestionamos nuestros
                  torneos corporativos. La plataforma es intuitiva, completa y
                  nos ha ayudado a crear experiencias deportivas excepcionales."
                </blockquote>
                <cite className="text-white/80 font-medium">
                  — María González, Directora de Marketing Deportivo
                </cite>
              </div>
            </div>
          </div>
        </div>

        {/* Become a Sponsor CTA */}
        <div className="relative">
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-[#ad45ff]/30 p-12 text-center">
            {/* Icono decorativo */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#ad45ff]/10 to-[#a3b3ff]/10 rounded-2xl mb-6">
              <Handshake className="w-8 h-8 text-[#ad45ff]" />
            </div>

            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Quieres ser nuestro próximo partner?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 text-lg">
              Ofrecemos paquetes de patrocinio personalizados para maximizar tu
              alcance y conectar con miles de aficionados deportivos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GradientButton
                size="lg"
                className="shadow-lg shadow-[#ad45ff]/25"
              >
                Solicitar información
                <ArrowRight className="w-5 h-5 ml-2" />
              </GradientButton>
              <GradientButton variant="outline" size="lg">
                Contactar ventas
              </GradientButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
