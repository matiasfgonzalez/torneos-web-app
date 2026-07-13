import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Users,
  UserCheck,
  Calendar,
  AlertTriangle,
  Sparkles,
  Shield,
  Crown,
  Zap,
  ArrowRight,
  CalendarClock,
} from "lucide-react";

import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/formatDate";
import {
  getOrgDashboardData,
  type DashboardMatch,
} from "@modules/organizaciones/actions/getOrgDashboardData";

function MatchRow({
  match,
  action,
}: {
  match: DashboardMatch;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="flex -space-x-2 shrink-0">
          <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center overflow-hidden">
            {match.homeTeamLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={match.homeTeamLogo}
                alt={match.homeTeamName}
                className="h-full w-full object-cover"
              />
            ) : (
              <Shield className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center overflow-hidden">
            {match.awayTeamLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={match.awayTeamLogo}
                alt={match.awayTeamName}
                className="h-full w-full object-cover"
              />
            ) : (
              <Shield className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {match.homeTeamName} vs {match.awayTeamName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {match.tournamentName} · {formatDate(match.dateTime, "dd MMM HH:mm")}
          </p>
        </div>
      </div>
      {action}
    </div>
  );
}

export default async function AdminDashboard() {
  const user = await checkUser();
  if (!user) redirect("/sign-in");

  const membership = await db.organizationMember.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    select: { organizationId: true },
  });

  const data = membership
    ? await getOrgDashboardData(membership.organizationId)
    : null;

  return (
    <div className="space-y-8">
      {/* Header con gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#ad45ff]/10 via-[#a3b3ff]/10 to-transparent p-6 border border-[#ad45ff]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ad45ff]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-[#ad45ff]" />
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
              {data ? data.organization.name : "Dashboard"}
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {data
              ? "Resumen de tu liga: lo que falta cargar y cómo viene el plan"
              : "Panel de administración de la plataforma"}
          </p>
        </div>
      </div>

      {!data ? (
        <Card className="glass-card border-0">
          <CardContent className="p-10 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Sin organización asociada
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Como administrador de plataforma no tenés una liga propia.
                Gestioná usuarios, torneos y pagos desde el menú lateral.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild variant="outline">
                <Link href="/admin/usuarios">Usuarios</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/torneos">Torneos</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/pagos">Pagos pendientes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Torneos Activos",
                value: data.counts.activeTournaments,
                sub: `de ${data.plan.maxActiveTournaments >= 999 ? "∞" : data.plan.maxActiveTournaments} en tu plan`,
                icon: Trophy,
                color: "from-[#ad45ff] to-[#a3b3ff]",
              },
              {
                title: "Equipos Registrados",
                value: data.counts.teams,
                sub: "activos en tu liga",
                icon: Users,
                color: "from-blue-500 to-cyan-400",
              },
              {
                title: "Jugadores",
                value: data.counts.players,
                sub: "en tu plantel general",
                icon: UserCheck,
                color: "from-green-500 to-emerald-400",
              },
              {
                title: "Resultados sin cargar",
                value: data.pendingResultMatches.length,
                sub: "partidos ya jugados",
                icon: AlertTriangle,
                color: "from-orange-500 to-amber-400",
              },
            ].map((stat) => (
              <Card
                key={stat.title}
                className="glass-card border-0 overflow-hidden group hover:shadow-xl transition-all duration-300 relative"
              >
                <div
                  className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}
                />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stat.sub}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Resultados sin cargar — la tarea más urgente */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Resultados sin cargar
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Partidos que ya se jugaron y siguen sin marcador
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.pendingResultMatches.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                    Al día — no hay resultados pendientes 🎉
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.pendingResultMatches.map((match) => (
                      <MatchRow
                        key={match.id}
                        match={match}
                        action={
                          <Button
                            asChild
                            size="sm"
                            className="gap-1.5 shrink-0 bg-gradient-to-r from-[#ad45ff] to-[#c77dff] hover:from-[#9c3ee6] hover:to-[#b66de6] text-white shadow-md shadow-[#ad45ff]/20"
                          >
                            <Link href={`/admin/partidos/${match.id}/cargar`}>
                              <Zap className="h-3.5 w-3.5" />
                              Cargar
                            </Link>
                          </Button>
                        }
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Próximos partidos */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <CalendarClock className="w-4 h-4 text-[#ad45ff]" />
                  Próximos partidos
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Los siguientes encuentros programados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.upcomingMatches.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                    No hay partidos programados todavía
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.upcomingMatches.map((match) => (
                      <MatchRow key={match.id} match={match} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Estado del plan + acciones rápidas */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="glass-card border-0 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Crown className="w-4 h-4 text-[#ad45ff]" />
                  Tu plan: {data.plan.name}
                  {data.plan.status === "VENCIDA" && (
                    <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-xs">
                      Vencido
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Torneos activos
                  </span>
                  <span className="font-semibold">
                    {data.counts.activeTournaments} /{" "}
                    {data.plan.maxActiveTournaments >= 999
                      ? "∞"
                      : data.plan.maxActiveTournaments}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Vencimiento
                  </span>
                  <span className="font-semibold">
                    {data.plan.currentPeriodEnd
                      ? formatDate(data.plan.currentPeriodEnd, "dd/MM/yyyy")
                      : "Sin vencimiento"}
                  </span>
                </div>
                <Button asChild variant="outline" className="w-full mt-2 gap-2">
                  <Link href="/admin/plan">
                    Gestionar plan
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 overflow-hidden lg:col-span-2 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ad45ff] via-[#a3b3ff] to-[#ad45ff]" />
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Acciones Rápidas
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Accesos directos a las funciones más utilizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                  {[
                    { title: "Cargar resultado", icon: Zap, href: "/admin/partidos", color: "from-[#ad45ff] to-[#c77dff]" },
                    { title: "Crear Torneo", icon: Trophy, href: "/admin/torneos", color: "from-[#ad45ff] to-[#a3b3ff]" },
                    { title: "Programar Partido", icon: Calendar, href: "/admin/partidos", color: "from-green-500 to-emerald-400" },
                  ].map((action) => (
                    <Link key={action.title} href={action.href}>
                      <Card className="glass-card border-0 cursor-pointer group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="flex flex-col items-center justify-center p-6 relative overflow-hidden">
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                          />
                          <div
                            className={`p-3 rounded-xl bg-gradient-to-br ${action.color} mb-3 group-hover:scale-110 transition-transform shadow-lg`}
                          >
                            <action.icon className="h-6 w-6 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-[#ad45ff] transition-colors text-center">
                            {action.title}
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
