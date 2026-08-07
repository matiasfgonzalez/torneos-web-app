import { HeroSection } from "@/components/sections/hero-section";
import { TodayFootballSection } from "@/components/sections/today-football-section";
import { ValuePropositionSection } from "@/components/sections/value-proposition-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { InstallAppSection } from "@/components/sections/install-app-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { SponsorsSection } from "@/components/sections/sponsors-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { ContactSection } from "@/components/sections/contact-section";
import { CTASection } from "@/components/sections/cta-section";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { checkUser } from "@/lib/checkUser";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getUserFavorites } from "@modules/favoritos/actions/favorites";
import { getUserNavLinks } from "@/lib/userHats";
import { FanHome } from "@modules/usuarios/components/FanHome";

export default async function HomePage() {
  const user = await checkUser();
  let isLogued: boolean = false;

  if (user) {
    const userLogued = await currentUser();

    if (userLogued) {
      isLogued = true;
    }
  }

  // USUARIO logueado (N10): home personalizado con torneos/equipos seguidos
  // en vez de la landing de marketing, que ya cumplió su función de conversión.
  if (isLogued && user) {
    const [membership, favorites, userLinks] = await Promise.all([
      db.organizationMember.findFirst({
        where: { userId: user.id },
        select: { id: true },
      }),
      getUserFavorites(),
      getUserNavLinks(user),
    ]);

    return (
      <div className="min-h-screen flex flex-col premium-gradient-bg">
        <Header isLogued={isLogued} userLinks={userLinks} />
        <FanHome
          name={user.name || "campeón"}
          hasOrganization={!!membership}
          favorites={favorites}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#120F17]">
      {/* `overlay`: el header flota sobre el hero oscuro en vez de apoyarse
          encima con su fondo claro (ver components/layout/header.tsx). */}
      <Header isLogued={isLogued} overlay />

      {/* Hero - Primera impresión impactante (fondo oscuro inmersivo) */}
      <HeroSection />

      {/* Transición del hero oscuro al contenido claro */}
      <div className="bg-gradient-to-b from-[#120F17] via-slate-50 to-slate-50 dark:from-[#120F17] dark:via-gray-900 dark:to-gray-900">
        <div className="h-16" />
      </div>

      {/* Contenido de la landing con fondo claro/oscuro normal */}
      <div className="bg-slate-50 dark:bg-gray-900">
        {/* Fútbol de hoy - los partidos del mundo, puerta de entrada al hincha */}
        <TodayFootballSection />

        {/* Propuesta de valor - Qué es, para quién, por qué */}
        <ValuePropositionSection />

        {/* Features - Capacidades principales */}
        <FeaturesSection />

        {/* Instalar app (PWA) - el pitch al hincha: llevá la liga en el bolsillo */}
        <InstallAppSection />

        {/* Cómo funciona - los tres pasos reales para arrancar */}
        <HowItWorksSection />

        {/* Pricing - Propuesta clara de valor */}
        <PricingSection />

        {/* Sponsors - Partners y patrocinadores */}
        <SponsorsSection />

        {/* Contact - Formulario y datos de contacto */}
        <ContactSection />

        {/* CTA Final - Llamada a la acción definitiva */}
        <CTASection />

        <Footer />
      </div>
    </div>
  );
}
