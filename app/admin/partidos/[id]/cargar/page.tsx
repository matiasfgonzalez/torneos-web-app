import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";

import { getMatchById } from "@modules/partidos/actions/getMatchById";
import { getTournamentPhases } from "@modules/torneos/actions/cups";
import { checkUser } from "@/lib/checkUser";
import { canManageOrg } from "@/lib/orgAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import QuickMatchLoader from "./QuickMatchLoader";

export default async function CargarResultadoPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  const user = await checkUser();
  if (!user) redirect("/sign-in");

  const match = await getMatchById(id);

  const canManage =
    !!match &&
    (await canManageOrg(user, match.tournament.organizationId ?? "", true));

  if (!match || !canManage) {
    return (
      <div className="min-h-screen premium-gradient-bg flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-0 shadow-2xl glass-card rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-orange-500" />
          <CardContent className="text-center p-12 space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Partido no disponible
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                No existe, fue eliminado, o no tenés permisos para cargar su
                resultado.
              </p>
            </div>
            <Button
              asChild
              className="rounded-full px-8 bg-gradient-to-r from-brand to-brand-mid hover:from-brand-hover hover:to-brand-mid-hover text-white shadow-lg shadow-brand/25 border-0"
            >
              <Link href="/admin/partidos" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Partidos</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fases del torneo, para poder asignar/mantener la fase del partido desde acá
  // (un cruce de copa nace con su fase; al cargar el resultado no hay que perderla).
  const phases = (await getTournamentPhases(match.tournamentId)).map((p) => ({
    id: p.id,
    name: p.name,
    cupName: p.cupName,
  }));

  return <QuickMatchLoader initialMatch={match} phases={phases} />;
}
