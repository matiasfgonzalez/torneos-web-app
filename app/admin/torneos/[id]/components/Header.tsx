import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Trophy,
  MapPin,
  Calendar,
  Building,
  Sparkles,
  Layers,
  Users,
} from "lucide-react";
import { ITorneo } from "@modules/torneos/types";
import DialogAddTournaments from "../../components/DialogAddTournaments";
import { DeleteTournamentButton } from "../../components/DeleteTournamentButton";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatDate";
import {
  TOURNAMENT_STATUS_LABELS,
  TOURNAMENT_CATEGORY_LABELS,
  TOURNAMENT_FORMAT_LABELS,
} from "@/lib/constants";
import {
  TournamentStatus,
  TournamentCategory,
  TournamentFormat,
} from "@prisma/client";

interface PropsHeader {
  readonly tournamentData: ITorneo;
}

const Header = ({ tournamentData }: PropsHeader) => {
  // Status badge colors and icons
  const statusConfig: Record<
    string,
    { gradient: string; icon: React.ReactNode }
  > = {
    EN_CURSO: {
      gradient: "from-blue-500 to-blue-600",
      icon: (
        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
      ),
    },
    FINALIZADO: {
      gradient: "from-gray-500 to-gray-600",
      icon: <Trophy className="w-3 h-3 mr-1" />,
    },
    INSCRIPCIONES: {
      gradient: "from-green-500 to-green-600",
      icon: <Users className="w-3 h-3 mr-1" />,
    },
    POR_INICIAR: {
      gradient: "from-amber-500 to-orange-500",
      icon: <Sparkles className="w-3 h-3 mr-1" />,
    },
  };

  const getStatusLabel = (status: string) => {
    return TOURNAMENT_STATUS_LABELS[status as TournamentStatus] || status;
  };

  const getCategoryLabel = (category: string) => {
    return (
      TOURNAMENT_CATEGORY_LABELS[category as TournamentCategory] || category
    );
  };

  const getFormatLabel = (format: string) => {
    return TOURNAMENT_FORMAT_LABELS[format as TournamentFormat] || format;
  };

  const config = statusConfig[tournamentData.status] || {
    gradient: "from-[#ad45ff] to-[#c77dff]",
    icon: null,
  };

  return (
    <div className="space-y-6">
      {/* Back Button - Premium Style */}
      <Button
        variant="ghost"
        className="hover:bg-[#ad45ff]/10 hover:text-[#ad45ff] border border-gray-200 dark:border-gray-700"
        asChild
      >
        <Link href="/admin/torneos">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Torneos
        </Link>
      </Button>

      {/* Main header card - Premium Golazo Style with theme support */}
      <div className="relative bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#1a0a2e] dark:via-[#2d1b4e] dark:to-[#1a0a2e] rounded-3xl shadow-2xl overflow-hidden border border-[#ad45ff]/20 dark:border-[#ad45ff]/20">
        {/* Decorative blur orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#ad45ff]/20 dark:bg-[#ad45ff]/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#c77dff]/10 dark:bg-[#c77dff]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Gradient top accent */}
        <div className="h-1.5 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff]" />

        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Tournament info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Logo with glow effect */}
              <div className="relative group flex-shrink-0">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#ad45ff] to-[#c77dff] rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-3 flex items-center justify-center border-4 border-white/10 overflow-hidden">
                  <img
                    src={tournamentData.logoUrl || "/placeholder.svg"}
                    alt={`Logo ${tournamentData.name}`}
                    className="w-full h-full object-contain"
                  />
                </div>
                {/* Status badge superpuesto */}
                <div className="absolute -top-2 -right-2">
                  <Badge
                    className={`bg-gradient-to-r ${config.gradient} text-white border-0 shadow-lg`}
                  >
                    {config.icon}
                    {getStatusLabel(tournamentData.status)}
                  </Badge>
                </div>
              </div>

              {/* Tournament details */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                    {tournamentData.name}
                  </h1>

                  {/* Info Pills */}
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className="flex items-center gap-2 bg-[#ad45ff]/10 dark:bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#ad45ff]/20 dark:border-white/10">
                      <Trophy className="w-4 h-4 text-[#ad45ff]" />
                      <span className="text-gray-700 dark:text-white/90 text-sm font-medium">
                        {getCategoryLabel(tournamentData.category)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#c77dff]/10 dark:bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#c77dff]/20 dark:border-white/10">
                      <Layers className="w-4 h-4 text-[#c77dff]" />
                      <span className="text-gray-700 dark:text-white/90 text-sm font-medium">
                        {getFormatLabel(tournamentData.format)}
                      </span>
                    </div>
                    {tournamentData.locality && (
                      <div className="flex items-center gap-2 bg-[#a3b3ff]/10 dark:bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#a3b3ff]/20 dark:border-white/10">
                        <MapPin className="w-4 h-4 text-[#a3b3ff]" />
                        <span className="text-gray-700 dark:text-white/90 text-sm">
                          {tournamentData.locality}
                        </span>
                      </div>
                    )}
                    {tournamentData.liga && (
                      <div className="flex items-center gap-2 bg-green-500/10 dark:bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-green-500/20 dark:border-white/10">
                        <Building className="w-4 h-4 text-green-500 dark:text-green-400" />
                        <span className="text-gray-700 dark:text-white/90 text-sm">
                          {tournamentData.liga}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tournament dates */}
                <div className="flex flex-wrap gap-3">
                  {tournamentData.startDate && (
                    <div className="flex items-center gap-2 bg-blue-500/10 dark:bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-500/20">
                      <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-200">
                        Inicio:{" "}
                        {formatDate(tournamentData.startDate, "dd/MM/yyyy")}
                      </span>
                    </div>
                  )}
                  {tournamentData.endDate && (
                    <div className="flex items-center gap-2 bg-purple-500/10 dark:bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-purple-500/20">
                      <Calendar className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-200">
                        Fin: {formatDate(tournamentData.endDate, "dd/MM/yyyy")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description if exists */}
                {tournamentData.description && (
                  <p className="text-gray-600 dark:text-white/60 max-w-2xl leading-relaxed text-sm">
                    {tournamentData.description}
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <DialogAddTournaments tournament={tournamentData} />
              <DeleteTournamentButton tournament={tournamentData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
