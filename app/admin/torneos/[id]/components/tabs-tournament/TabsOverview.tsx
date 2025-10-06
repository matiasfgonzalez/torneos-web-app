import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trophy, Building } from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import { ITorneo } from "@/components/torneos/types";

interface PropsTabsOverview {
  tournamentData: ITorneo;
}

const TabsOverview = (props: PropsTabsOverview) => {
  const { tournamentData } = props;
  return (
    <TabsContent value="overview" className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 border-[#ad45ff]/20 dark:border-[#8b39cc]/30 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Información del Torneo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Nombre:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {tournamentData.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Liga:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {tournamentData.liga}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Localidad:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {tournamentData.locality}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Inicio:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatDate(tournamentData.startDate, "dd 'de' MMMM yyyy")}
                </span>
              </div>
              {tournamentData.endDate && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Fin:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(tournamentData.endDate, "dd 'de' MMMM yyyy")}
                  </span>
                </div>
              )}
            </div>
            {tournamentData.description && (
              <div>
                <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                  Descripción:
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {tournamentData.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-[#ad45ff]/20 dark:border-[#8b39cc]/30 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Configuración
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Formato:
                </span>
                <Badge
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  {tournamentData.format}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Categoría:
                </span>
                <Badge
                  variant="secondary"
                  className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  {tournamentData.category}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Ida y Vuelta:
                </span>
                <Badge
                  variant={tournamentData.homeAndAway ? "default" : "outline"}
                  className={
                    tournamentData.homeAndAway
                      ? "bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white border-0"
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  }
                >
                  {tournamentData.homeAndAway ? "Sí" : "No"}
                </Badge>
              </div>
            </div>
            <div className="pt-4 border-t dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>Creado: {formatDate(tournamentData.createdAt)}</p>
                <p>Actualizado: {formatDate(tournamentData.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};

export default TabsOverview;
