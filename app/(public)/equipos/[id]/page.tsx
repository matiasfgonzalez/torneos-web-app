import { getEquipoById } from "@modules/equipos/actions/getEquipoById";
import PublicTeamHeader from "@modules/equipos/components/public/PublicTeamHeader";
import PublicTabsTeam from "@modules/equipos/components/public/PublicTabsTeam";
import { AlertTriangle, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default async function PublicTeamDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const team = await getEquipoById(id);

  if (team) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="relative pb-20">
          {/* Background decorative blob */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[#ad45ff]/10 blur-3xl -z-10 rounded-full pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <Link href="/" className="hover:text-[#ad45ff] transition-colors">
                Inicio
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link
                href="/equipos"
                className="hover:text-[#ad45ff] transition-colors"
              >
                Equipos
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
                {team.name}
              </span>
            </nav>

            {/* Back Button - Premium Style */}
            <Button
              variant="ghost"
              className="hover:bg-[#ad45ff]/10 hover:text-[#ad45ff] border border-gray-200 dark:border-gray-700"
              asChild
            >
              <Link href="/equipos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Equipos
              </Link>
            </Button>

            <PublicTeamHeader team={team} />
            <PublicTabsTeam teamData={team} />
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-0 shadow-2xl bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff]" />
          <CardContent className="text-center p-12 space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#ad45ff]/20 to-[#c77dff]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-[#ad45ff]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Equipo no encontrado
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Parece que este equipo no existe o no está disponible
                públicamente.
              </p>
            </div>

            <div className="pt-4">
              <Button
                asChild
                className="rounded-full px-8 bg-gradient-to-r from-[#ad45ff] to-[#c77dff] hover:from-[#9d35ef] hover:to-[#b56dff] text-white shadow-lg shadow-[#ad45ff]/25 border-0"
              >
                <Link href="/equipos">Explorar Equipos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
