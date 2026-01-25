import { db } from "@/lib/db";
import { User } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Shield, Calendar } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ActivityHistoryProps {
  user: User;
}

export default async function ActivityHistory({ user }: ActivityHistoryProps) {
  // Fetch tournaments created by user (if admin/organizer)
  const tournaments = await db.tournament.findMany({
    where: { userId: user.id },
    orderBy: { startDate: "desc" },
    take: 5,
  });

  // Since we don't have a direct 'manager' relation for teams yet in the schema shown earlier (except ownerId maybe?),
  // we will focus on tournaments for now or generic stats.
  // Actually, checking schema might be useful but let's stick to what we know: Tournaments have userId.

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#ad45ff]" />
          Torneos Organizados
        </h3>
        {tournaments.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-1">
            {tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/admin/torneos/${tournament.id}`}
              >
                <Card className="glass-card hover:bg-white/40 dark:hover:bg-gray-800/40 transition-all cursor-pointer group border-0">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {tournament.logoUrl ? (
                          <img
                            src={tournament.logoUrl}
                            alt={tournament.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-[#ad45ff] transition-colors">
                          {tournament.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(tournament.startDate).toLocaleDateString()}
                          <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5 px-1.5"
                          >
                            {tournament.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground glass-card rounded-xl">
            No has organizado ningún torneo aún.
          </div>
        )}
      </div>

      {/* Placeholder for future sections like "Equipos", "Partidos", etc. */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#a3b3ff]" />
          Equipos (Próximamente)
        </h3>
        <Card className="glass-card border-dashed border-2 border-gray-200 dark:border-gray-800 bg-transparent shadow-none">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            La gestión de equipos vinculados a tu perfil estará disponible
            pronto.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
