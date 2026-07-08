import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Trophy,
  Users,
  MapPin,
  MessageCircle,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getOrganizationBySlug } from "@modules/organizaciones/actions/getOrganizationBySlug";
import {
  formatTournamentCategory,
  TOURNAMENT_STATUS_LABELS,
} from "@/lib/constants";
import { TournamentStatus } from "@prisma/client";

type RouteParams = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);
  if (!org) return { title: "Liga no encontrada | GOLAZO" };

  const title = `${org.name} | GOLAZO`;
  const description =
    org.description ??
    `Seguí los torneos de ${org.name} en GOLAZO: posiciones, fixture y resultados en tiempo real.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: org.logoUrl ? [{ url: org.logoUrl }] : undefined,
    },
  };
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

export default async function LeaguePage({
  params,
}: Readonly<{ params: RouteParams }>) {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);
  if (!org) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero de la liga */}
      <section className="relative overflow-hidden border-b border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ad45ff]/10 via-transparent to-[#a3b3ff]/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ad45ff]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
            <Link href="/" className="hover:text-[#ad45ff] transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white font-medium truncate max-w-[220px]">
              {org.name}
            </span>
          </nav>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative shrink-0">
              {org.logoUrl ? (
                <Image
                  src={org.logoUrl}
                  alt={org.name}
                  width={96}
                  height={96}
                  className="rounded-2xl object-cover h-24 w-24 ring-2 ring-[#ad45ff]/20 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] flex items-center justify-center shadow-lg">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                {org.name}
              </h1>
              {org.description && (
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                  {org.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {org.locality && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#ad45ff]" />
                    {org.locality}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-[#ad45ff]" />
                  {org.tournaments.length}{" "}
                  {org.tournaments.length === 1 ? "torneo" : "torneos"}
                </span>
                {org.phone && (
                  <a
                    href={`https://wa.me/${normalizePhone(org.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-green-600 dark:text-green-400 hover:underline"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Torneos de la liga */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Torneos
        </h2>

        {org.tournaments.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Esta liga todavía no tiene torneos publicados.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {org.tournaments.map((t) => {
              const href = t.slug
                ? `/liga/${org.slug}/${t.slug}`
                : `/torneos/${t.id}`;
              return (
                <Link
                  key={t.id}
                  href={href}
                  className="group relative flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:border-[#ad45ff]/50 hover:shadow-xl hover:shadow-[#ad45ff]/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    {t.logoUrl ? (
                      <Image
                        src={t.logoUrl}
                        alt={t.name}
                        width={48}
                        height={48}
                        className="rounded-xl object-cover h-12 w-12"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ad45ff]/20 to-[#a3b3ff]/20 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-[#ad45ff]" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-[#ad45ff] transition-colors">
                        {t.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {formatTournamentCategory(t)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <Badge className="bg-[#ad45ff]/10 text-[#ad45ff] border-0">
                      {TOURNAMENT_STATUS_LABELS[t.status as TournamentStatus] ??
                        t.status}
                    </Badge>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {t.teamCount}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {new Date(t.startDate).toLocaleDateString("es-AR", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
