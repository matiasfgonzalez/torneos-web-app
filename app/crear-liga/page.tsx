import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/db";
import { Trophy } from "lucide-react";
import { GradientText } from "@/components/ui-dev/gradient-text";
import CrearLigaWizard from "./CrearLigaWizard";

export const metadata: Metadata = {
  title: "Creá tu liga gratis | GOLAZO",
  description:
    "Creá tu liga en minutos: nombre, primer torneo e invitá a tu equipo. Gratis, sin tarjeta de crédito.",
};

/**
 * Onboarding de organizador (N6): el camino USUARIO → OWNER.
 *
 * - Sin sesión → registro (el sign-up redirige de vuelta acá).
 * - Miembro invitado (no OWNER) → ya tiene panel, no crea liga.
 * - OWNER existente → el wizard corre en modo edición (prefill de su liga).
 */
export default async function CrearLigaPage() {
  const user = await checkUser();
  if (!user) {
    redirect("/sign-up");
  }

  const membership = await db.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  if (membership && membership.role !== "OWNER") {
    // Ya es parte de la liga de otra persona → directo al panel
    redirect("/admin/dashboard");
  }

  const org = membership?.organization ?? null;

  return (
    <div className="min-h-screen premium-gradient-bg">
      {/* Decoración de fondo (estilo Premium Golazo) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#ad45ff]/15 to-[#a3b3ff]/15 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#a3b3ff]/10 to-[#ad45ff]/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header con branding */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              <GradientText>GOLAZO</GradientText>
            </span>
          </Link>
          <Link
            href="/admin/dashboard"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#ad45ff] transition-colors font-medium"
          >
            Ir al panel →
          </Link>
        </div>

        <CrearLigaWizard
          initialOrg={
            org
              ? {
                  name: org.name,
                  locality: org.locality,
                  description: org.description,
                  phone: org.phone,
                  logoUrl: org.logoUrl,
                  logoPublicId: org.logoPublicId,
                }
              : null
          }
          userName={user.name}
        />
      </div>
    </div>
  );
}
