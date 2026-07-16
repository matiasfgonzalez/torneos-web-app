import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Heart, Shield, Trophy } from "lucide-react";

import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Bienvenido | GOLAZO",
  description: "Elegí cómo querés usar GOLAZO.",
};

/**
 * Las tres puertas del alta (N13).
 *
 * Hasta ahora el sign-up forzaba `/crear-liga`: a un hincha o a un delegado les
 * ofrecía el producto equivocado y la única salida era volver al home a mano.
 * Acá cada quien elige, una sola vez y sin fricción — y "solo quiero mirar" es
 * una respuesta válida y visible, no un callejón.
 */

const DOORS = [
  {
    href: "/",
    icon: Heart,
    title: "Sigo a mi equipo",
    description:
      "Seguí torneos y equipos, mirá la tabla, el fixture y los resultados. No hace falta nada más.",
    cta: "Explorar torneos",
    featured: false,
  },
  {
    href: "/mi-equipo",
    icon: Shield,
    title: "Represento a un equipo",
    description:
      "Cargá el plantel de tu equipo e inscribilo en los torneos de tu liga. La liga aprueba que sos su delegado.",
    cta: "Buscar mi equipo",
    featured: true,
  },
  {
    href: "/crear-liga",
    icon: Trophy,
    title: "Organizo una liga",
    description:
      "Creá tu liga gratis: torneos, fixture automático, tabla de posiciones y estadísticas.",
    cta: "Crear mi liga",
    featured: false,
  },
];

export default async function BienvenidaPage() {
  const user = await checkUser();
  if (!user) redirect("/sign-in");

  // Quien ya eligió no vuelve a elegir: esta pantalla es de alta, no un menú.
  const [membership, managership] = await Promise.all([
    db.organizationMember.findFirst({
      where: { userId: user.id },
      select: { id: true },
    }),
    db.teamManager.findFirst({
      where: { userId: user.id },
      select: { id: true },
    }),
  ]);

  if (membership) redirect("/admin/dashboard");
  if (managership) redirect("/mi-equipo");

  const firstName = user.name?.split(" ")[0] || "campeón";

  return (
    <div className="flex min-h-screen flex-col premium-gradient-bg">
      <Header isLogued />

      <main className="mx-auto w-full max-w-5xl flex-grow px-4 py-12 sm:py-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
            Hola, <span className="premium-gradient-text">{firstName}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-gray-300">
            ¿Qué te trae por acá? Elegí una opción para empezar — podés cambiarla
            cuando quieras.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {DOORS.map((door) => (
            <Link
              key={door.href}
              href={door.href}
              className={`interactive-surface group flex flex-col rounded-2xl border bg-card p-6 shadow-sm ${
                door.featured
                  ? "border-brand/40 ring-1 ring-brand/20"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-mid shadow-lg shadow-brand/25">
                <door.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>

              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {door.title}
              </h2>
              <p className="mt-2 flex-grow text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {door.description}
              </p>

              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                {door.cta}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 ease-brand group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Crear una liga es gratis y no necesita tarjeta.
        </p>
      </main>

      <Footer />
    </div>
  );
}
