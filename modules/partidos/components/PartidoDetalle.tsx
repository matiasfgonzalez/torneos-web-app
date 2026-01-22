import { formatDate } from "@/lib/formatDate";
import { IPartidos, MatchStatus } from "@modules/partidos/types";
import {
  Calendar,
  Clock,
  MapPin,
  Edit3,
  Trash2,
  MoreHorizontal,
  Eye,
  Trophy,
  Shield,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  XCircle,
  Home,
  Plane,
} from "lucide-react";

interface PartidoDetalleProps {
  match: IPartidos;
}

const PartidoDetalle = (props: PartidoDetalleProps) => {
  const { match } = props;

  const getStatusConfig = (status: MatchStatus) => {
    const configs = {
      PROGRAMADO: {
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
        icon: Calendar,
        label: "Programado",
      },
      EN_JUEGO: {
        color: "text-green-400",
        bgColor: "bg-green-500/20",
        borderColor: "border-green-500/30",
        icon: Play,
        label: "En Juego",
      },
      FINALIZADO: {
        color: "text-slate-400",
        bgColor: "bg-slate-500/20",
        borderColor: "border-slate-500/30",
        icon: CheckCircle,
        label: "Finalizado",
      },
      SUSPENDIDO: {
        color: "text-red-400",
        bgColor: "bg-red-500/20",
        borderColor: "border-red-500/30",
        icon: XCircle,
        label: "Suspendido",
      },
      POSTERGADO: {
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/20",
        borderColor: "border-yellow-500/30",
        icon: Pause,
        label: "Postergado",
      },
      ENTRETIEMPO: {
        color: "text-orange-400",
        bgColor: "bg-orange-500/20",
        borderColor: "border-orange-500/30",
        icon: Pause, // o el icono que prefieras
        label: "Entretiempo",
      },
    };
    return configs[status as keyof typeof configs] || configs["PROGRAMADO"];
  };

  const statusConfig = getStatusConfig(match.status);
  const StatusIcon = statusConfig.icon;
  return (
    <div
      key={match.id}
      className="group bg-slate-800/50 dark:bg-gray-800/80 backdrop-blur-xl border border-slate-700/50 dark:border-gray-700/70 rounded-2xl hover:bg-slate-700/30 dark:hover:bg-gray-700/50 hover:border-slate-600/50 dark:hover:border-gray-600/70 transition-all duration-300"
    >
      <div className="p-6">
        {/* Header del partido */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-lg p-2`}
            >
              <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
            </div>
            <div>
              <span className={`text-sm font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
              <div className="text-xs text-slate-400 dark:text-gray-400">
                {match.phase.name} {match.roundNumber}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-600/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
              <Eye className="w-4 h-4 text-slate-400 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-slate-600/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
              <Edit3 className="w-4 h-4 text-blue-400" />
            </button>
            <button className="p-2 hover:bg-slate-600/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
            <button className="p-2 hover:bg-slate-600/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors">
              <MoreHorizontal className="w-4 h-4 text-slate-400 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Enfrentamiento */}
        <div className="relative mb-6">
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Equipo Local */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-slate-700/50 dark:bg-gray-700/70 rounded-xl flex items-center justify-center overflow-hidden">
                  {match.homeTeam.team.logoUrl ? (
                    <img
                      src={match.homeTeam.team.logoUrl}
                      alt={match.homeTeam.team.shortName}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <Shield className="w-6 h-6 text-slate-400 dark:text-gray-400" />
                  )}
                </div>
                <div className="absolute -top-1 -right-1">
                  <div className="w-5 h-5 bg-blue-500/20 border border-blue-500/50 rounded-full flex items-center justify-center">
                    <Home className="w-3 h-3 text-blue-400" />
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white dark:text-gray-100 text-sm truncate">
                  {match.homeTeam.team.name}
                </div>
                <div className="text-xs text-slate-400 dark:text-gray-400">
                  {match.homeTeam.team.shortName}
                </div>
              </div>
            </div>

            {/* Resultado o VS */}
            <div className="text-center">
              {match.homeScore !== null && match.awayScore !== null ? (
                <div className="bg-slate-700/50 dark:bg-gray-700/70 rounded-lg px-4 py-2">
                  <div className="text-2xl font-bold text-white dark:text-gray-100">
                    {match.homeScore} - {match.awayScore}
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 dark:text-gray-400">
                  <div className="text-lg font-bold">VS</div>
                  <div className="text-xs">{formatDate(match.dateTime)}</div>
                </div>
              )}
            </div>

            {/* Equipo Visitante */}
            <div className="flex items-center gap-3 justify-end">
              <div className="flex-1 min-w-0 text-right">
                <div className="font-semibold text-white dark:text-gray-100 text-sm truncate">
                  {match.awayTeam.team.name}
                </div>
                <div className="text-xs text-slate-400 dark:text-gray-400">
                  {match.awayTeam.team.shortName}
                </div>
              </div>
              <div className="relative">
                <div className="w-12 h-12 bg-slate-700/50 dark:bg-gray-700/70 rounded-xl flex items-center justify-center overflow-hidden">
                  {match.awayTeam.team.logoUrl ? (
                    <img
                      src={match.awayTeam.team.logoUrl}
                      alt={match.awayTeam.team.shortName}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <Shield className="w-6 h-6 text-slate-400 dark:text-gray-400" />
                  )}
                </div>
                <div className="absolute -top-1 -right-1">
                  <div className="w-5 h-5 bg-purple-500/20 border border-purple-500/50 rounded-full flex items-center justify-center">
                    <Plane className="w-3 h-3 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información del partido */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-300 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="font-medium capitalize">
              {formatDate(match.dateTime)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-300 dark:text-gray-300">
            <MapPin className="w-4 h-4 text-green-400" />
            <span>
              {match.stadium}, {match.city}
            </span>
          </div>

          {match.description && (
            <div className="flex items-center gap-2 text-slate-300 dark:text-gray-300 sm:col-span-1">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="truncate">{match.description}</span>
            </div>
          )}
        </div>

        {/* Descripción adicional */}
        {match.description && (
          <div className="mt-4 pt-4 border-t border-slate-700/50 dark:border-gray-700/70">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-slate-300 dark:text-gray-300 text-sm">
                {match.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer con acciones rápidas */}
      <div className="px-6 py-3 bg-slate-900/30 dark:bg-gray-900/50 border-t border-slate-700/30 dark:border-gray-700/50 rounded-b-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>Creado el {formatDate(match.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Ver detalles
            </button>
            <div className="w-1 h-1 bg-slate-600 dark:bg-gray-600 rounded-full"></div>
            <button className="text-xs text-green-400 hover:text-green-300 font-medium transition-colors">
              Editar resultado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartidoDetalle;
