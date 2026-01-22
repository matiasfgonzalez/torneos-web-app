import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  TrendingUp,
  Trophy,
  Calendar,
  MapPin,
  Sparkles,
  Clock,
  Gamepad2,
  Award,
  Shield,
} from "lucide-react";
import { ITorneo } from "@modules/torneos/types";
import { formatDate } from "@/lib/formatDate";
import {
  TOURNAMENT_CATEGORY_LABELS,
  TOURNAMENT_FORMAT_LABELS,
  TOURNAMENT_STATUS_LABELS,
} from "@/lib/constants";

interface PropsHeaderTorneo {
  tournamentData: ITorneo;
}

// Colores de estado
const statusColors: Record<string, string> = {
  ACTIVO:
    "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25",
  INSCRIPCION:
    "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25",
  PENDIENTE:
    "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25",
  FINALIZADO: "bg-gray-500 text-white shadow-lg shadow-gray-500/25",
  SUSPENDIDO: "bg-orange-500 text-white shadow-lg shadow-orange-500/25",
  CANCELADO: "bg-red-500 text-white shadow-lg shadow-red-500/25",
  BORRADOR: "bg-gray-400 text-white shadow-lg shadow-gray-400/25",
  ARCHIVADO: "bg-gray-600 text-white shadow-lg shadow-gray-600/25",
};

const HeaderTorneo = (props: PropsHeaderTorneo) => {
  const { tournamentData } = props;
  const diasRestantes = tournamentData.endDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(tournamentData.endDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  const categoryLabel =
    TOURNAMENT_CATEGORY_LABELS[
      tournamentData.category as keyof typeof TOURNAMENT_CATEGORY_LABELS
    ] || tournamentData.category;

  const formatLabel =
    TOURNAMENT_FORMAT_LABELS[
      tournamentData.format as keyof typeof TOURNAMENT_FORMAT_LABELS
    ] || tournamentData.format;

  const statusLabel =
    TOURNAMENT_STATUS_LABELS[
      tournamentData.status as keyof typeof TOURNAMENT_STATUS_LABELS
    ] || tournamentData.status;

  return (
    <div className="mb-10">
      {/* Hero Section Premium */}
      <div className="relative overflow-hidden rounded-3xl mb-8">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#2d1b4e] to-[#1a0a2e]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff]/20 via-transparent to-[#a3b3ff]/20" />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ad45ff]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#a3b3ff]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#c77dff]/10 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] rounded-3xl blur-lg opacity-50" />
                <div className="relative w-32 h-32 lg:w-40 lg:h-40 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-4 border-white/20 overflow-hidden flex items-center justify-center">
                  {tournamentData.logoUrl ? (
                    <img
                      src={tournamentData.logoUrl}
                      alt={`Logo de ${tournamentData.name}`}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <Trophy className="w-16 h-16 lg:w-20 lg:h-20 text-[#ad45ff]" />
                  )}
                </div>
              </div>
            </div>

            {/* Tournament Info */}
            <div className="flex-1 space-y-5">
              {/* Status Badge */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  className={`${statusColors[tournamentData.status] || "bg-gray-500 text-white"} px-4 py-1.5 text-sm font-semibold`}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  {statusLabel}
                </Badge>
                {tournamentData.homeAndAway && (
                  <Badge className="bg-white/10 text-white border border-white/20 px-3 py-1">
                    Ida y Vuelta
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {tournamentData.name}
              </h1>

              {/* Description */}
              {tournamentData.description && (
                <p className="text-lg text-white/70 max-w-2xl">
                  {tournamentData.description}
                </p>
              )}

              {/* Meta Info Pills */}
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-white">
                  <Award className="w-4 h-4 text-[#ad45ff]" />
                  <span className="font-medium">{categoryLabel}</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-white">
                  <Gamepad2 className="w-4 h-4 text-[#a3b3ff]" />
                  <span className="font-medium">{formatLabel}</span>
                </div>
                {tournamentData.locality && (
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-white">
                    <MapPin className="w-4 h-4 text-[#c77dff]" />
                    <span>{tournamentData.locality}</span>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Inicio:{" "}
                    {formatDate(tournamentData.startDate, "dd 'de' MMMM, yyyy")}
                  </span>
                </div>
                {tournamentData.endDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      Fin:{" "}
                      {formatDate(tournamentData.endDate, "dd 'de' MMMM, yyyy")}
                    </span>
                  </div>
                )}
                {tournamentData.liga && (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>{tournamentData.liga}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Premium Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="group bg-white dark:bg-gray-800 shadow-xl border-0 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="h-1.5 bg-gradient-to-r from-[#ad45ff] to-[#c77dff]" />
          <CardContent className="p-5 lg:p-6 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-[#ad45ff]/10 to-[#c77dff]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Users className="h-7 w-7 text-[#ad45ff]" />
            </div>
            <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">
              {tournamentData.tournamentTeams?.length || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Equipos
            </div>
          </CardContent>
        </Card>

        <Card className="group bg-white dark:bg-gray-800 shadow-xl border-0 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="h-1.5 bg-gradient-to-r from-[#c77dff] to-[#a3b3ff]" />
          <CardContent className="p-5 lg:p-6 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-[#c77dff]/10 to-[#a3b3ff]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-7 w-7 text-[#c77dff]" />
            </div>
            <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">
              {tournamentData.matches?.length || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Partidos
            </div>
          </CardContent>
        </Card>

        <Card className="group bg-white dark:bg-gray-800 shadow-xl border-0 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />
          <CardContent className="p-5 lg:p-6 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400/10 to-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Trophy className="h-7 w-7 text-amber-500" />
            </div>
            <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">
              {tournamentData.trophy || "—"}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Premio
            </div>
          </CardContent>
        </Card>

        <Card className="group bg-white dark:bg-gray-800 shadow-xl border-0 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500" />
          <CardContent className="p-5 lg:p-6 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="h-7 w-7 text-green-500" />
            </div>
            <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">
              {diasRestantes ?? "—"}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Días restantes
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HeaderTorneo;
