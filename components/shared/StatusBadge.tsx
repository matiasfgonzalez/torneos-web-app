import {
  MatchStatus,
  PayStatus,
  PlayerStatus,
  RefereeStatus,
  TournamentStatus,
  UserStatus,
} from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  MATCH_STATUS_LABELS,
  PAY_STATUS_LABELS,
  PLAYER_STATUS_LABELS,
  TOURNAMENT_STATUS_LABELS,
  USER_STATUS_LABELS,
} from "@/lib/constants";
import {
  MATCH_STATUS_COLORS,
  PAY_STATUS_COLORS,
  PLAYER_STATUS_BADGE_COLORS,
  TOURNAMENT_STATUS_COLORS,
  USER_STATUS_COLORS,
} from "@/lib/status-colors";
import {
  REFEREE_STATUS_COLORS,
  REFEREE_STATUS_LABELS,
} from "@modules/arbitros/types";

/**
 * Badge de estado unificado (F0): label en español + color del mapa único
 * de la entidad. No inventes colores inline — si falta un estado, agregalo
 * a lib/status-colors.ts.
 *
 * Uso: <StatusBadge entity="match" status={match.status} />
 */

const ENTITY_MAPS = {
  tournament: {
    labels: TOURNAMENT_STATUS_LABELS,
    colors: TOURNAMENT_STATUS_COLORS,
  },
  match: { labels: MATCH_STATUS_LABELS, colors: MATCH_STATUS_COLORS },
  player: { labels: PLAYER_STATUS_LABELS, colors: PLAYER_STATUS_BADGE_COLORS },
  user: { labels: USER_STATUS_LABELS, colors: USER_STATUS_COLORS },
  payment: { labels: PAY_STATUS_LABELS, colors: PAY_STATUS_COLORS },
  referee: { labels: REFEREE_STATUS_LABELS, colors: REFEREE_STATUS_COLORS },
} as const;

type StatusByEntity = {
  tournament: TournamentStatus;
  match: MatchStatus;
  player: PlayerStatus;
  user: UserStatus;
  payment: PayStatus;
  referee: RefereeStatus;
};

const FALLBACK_COLOR =
  "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30";

export function StatusBadge<E extends keyof StatusByEntity>({
  entity,
  status,
  className,
}: {
  entity: E;
  /** Acepta string para datos que llegan sin tipar (fetch de API) */
  status: StatusByEntity[E] | string;
  className?: string;
}) {
  const maps = ENTITY_MAPS[entity];
  const label =
    (maps.labels as Record<string, string>)[status] ?? String(status);
  const color = (maps.colors as Record<string, string>)[status];

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", color ?? FALLBACK_COLOR, className)}
    >
      {label}
    </Badge>
  );
}
