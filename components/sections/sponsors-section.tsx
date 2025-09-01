import { SectionBadge } from "@/components/ui-dev/section-badge";
import { GradientButton } from "@/components/ui-dev/gradient-button";
import { SPONSORS, featuredSponsor } from "@/lib/constants/sponsors";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

export function SponsorsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionBadge>Nuestros Patrocinadores</SectionBadge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Empresas que Confían en GOLAZO
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Únete a las marcas líderes que apoyan el deporte y confían en
            nuestra plataforma
          </p>
        </div>

        {/* Grid de patrocinadores */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
          {SPONSORS.map((sponsor) => (
            <div
              key={sponsor.id}
              className="flex items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <img
                src={sponsor.logo || "/placeholder.svg"}
                alt={sponsor.name}
                className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>

        {/* Patrocinador destacado */}
        <div className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-2xl p-8 text-white text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Patrocinador Principal</h3>
            <div className="flex items-center justify-center mb-6">
              <img
                src={featuredSponsor.logo || "/placeholder.svg"}
                alt="Patrocinador Principal"
                className="h-30 w-30 object-contain opacity-90 hover:opacity-100 transition-opacity shadow-lg"
              />
            </div>
            <blockquote className="text-lg italic mb-4">
              "GOLAZO ha revolucionado la forma en que gestionamos nuestros
              torneos corporativos. La plataforma es intuitiva, completa y nos
              ha ayudado a crear experiencias deportivas excepcionales."
            </blockquote>
            <cite className="font-semibold">
              - María González, Directora de Marketing Deportivo
            </cite>
          </div>
        </div>

        {/* Become a Sponsor CTA */}
        <div className="mt-16 text-center">
          <Card className="border-2 border-dashed border-[#ad45ff] bg-gradient-to-r from-[#ad45ff]/5 to-[#a3b3ff]/5 p-8">
            <CardContent className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">
                ¿Quieres ser nuestro próximo patrocinador?
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Únete a las marcas líderes que confían en GOLAZO para conectar
                con miles de aficionados deportivos. Ofrecemos paquetes de
                patrocinio personalizados para maximizar tu alcance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button className="cursor-pointer bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white">
                  Información de Patrocinio
                </Button>
                <Button
                  variant="outline"
                  className="cursor-pointer border-[#ad45ff] text-[#ad45ff] hover:bg-[#ad45ff] hover:text-white bg-transparent"
                >
                  Contactar Ventas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
