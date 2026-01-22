import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, TrendingUp } from "lucide-react";

const activeTournaments = [
  {
    id: 1,
    name: "Torneo Clausura 2024",
    category: "Primera División",
    teams: 16,
    matchesPlayed: 45,
    totalMatches: 60,
    status: "En curso",
    nextMatch: "2024-01-20",
  },
  {
    id: 2,
    name: "Copa Juvenil",
    category: "Sub-20",
    teams: 12,
    matchesPlayed: 18,
    totalMatches: 24,
    status: "Semifinales",
    nextMatch: "2024-01-18",
  },
  {
    id: 3,
    name: "Liga Amateur",
    category: "Amateur",
    teams: 20,
    matchesPlayed: 30,
    totalMatches: 38,
    status: "En curso",
    nextMatch: "2024-01-19",
  },
];

const ListTorneos = () => {
  return (
    <section className="py-16 bg-muted/50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Torneos en Curso
          </h2>
          <Button variant="outline" asChild>
            <Link href="/torneos">Ver todos los torneos</Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTournaments.map((tournament) => (
            <Card
              key={tournament.id}
              className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{tournament.name}</CardTitle>
                  <Badge
                    variant={
                      tournament.status === "En curso" ? "default" : "secondary"
                    }
                  >
                    {tournament.status}
                  </Badge>
                </div>
                <CardDescription>{tournament.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{tournament.teams} equipos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>
                        {tournament.matchesPlayed}/{tournament.totalMatches}{" "}
                        partidos
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>Próximo partido: {tournament.nextMatch}</span>
                  </div>
                  <Button
                    className="w-full bg-transparent"
                    variant="outline"
                    asChild
                  >
                    <Link href={`/torneos/${tournament.id}`}>Ver detalles</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ListTorneos;

