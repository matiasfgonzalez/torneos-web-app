import { HeroSection } from "@/components/sections/hero-section";
import { ValuePropositionSection } from "@/components/sections/value-proposition-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { SocialProofSection } from "@/components/sections/social-proof-section";
import { SponsorsSection } from "@/components/sections/sponsors-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { ContactSection } from "@/components/sections/contact-section";
import { CTASection } from "@/components/sections/cta-section";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { checkUser } from "@/lib/checkUser";
import { currentUser } from "@clerk/nextjs/server";

export default async function HomePage() {
  const user = await checkUser();
  console.log("User in header:", user);
  let isLogued: boolean = false;

  if (user) {
    const userLogued = await currentUser();

    if (userLogued) {
      isLogued = true;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header isLogued={isLogued} />

      {/* Hero - Primera impresión impactante */}
      <HeroSection />

      {/* Propuesta de valor - Qué es, para quién, por qué */}
      <ValuePropositionSection />

      {/* Features - Capacidades principales */}
      <FeaturesSection />

      {/* Social Proof - Testimonios y confianza */}
      <SocialProofSection />

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
  );
}
