import { MapPin, User, ChevronRight, Shield } from "lucide-react";
import { EntityCard, EntityCardAvatar } from "@/components/shared/EntityCard";
import { ITeam } from "@modules/equipos/types/types";

interface TeamCardProps {
  team: ITeam;
}

/** Card pública de equipo (F2, anatomía consistente con TournamentCard/PlayerCard). */
export default function TeamCard({ team }: TeamCardProps) {
  return (
    <EntityCard href={`/equipos/${team.id}`} aria-label={team.name}>
      <div className="p-6 flex flex-col items-center text-center h-full">
        <EntityCardAvatar
          src={team.logoUrl}
          alt={team.name}
          shape="circle"
          className="mb-4"
          fallback={<Shield className="w-8 h-8 text-brand" />}
        />

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-brand transition-colors line-clamp-1">
          {team.name}
        </h3>

        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <MapPin className="w-3.5 h-3.5" />
          <span className="line-clamp-1">
            {team.homeCity || "Ciudad no definida"}
          </span>
        </div>

        <div className="mt-auto w-full pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
            <User className="w-3.5 h-3.5 text-brand" />
            <span className="text-xs font-medium truncate max-w-[100px]">
              {team.coach || "Sin DT"}
            </span>
          </div>
          <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors duration-300">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </EntityCard>
  );
}
