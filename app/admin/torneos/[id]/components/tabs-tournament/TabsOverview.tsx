import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Trophy,
  Building,
  Settings,
  Clock,
} from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import { ITorneo } from "@modules/torneos/types";
import {
  TOURNAMENT_FORMAT_LABELS,
  TOURNAMENT_CATEGORY_LABELS,
} from "@/lib/constants";

interface PropsTabsOverview {
  tournamentData: ITorneo;
}

const TabsOverview = (props: PropsTabsOverview) => {
  const { tournamentData } = props;
  return (
    <TabsContent value="overview" className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Información del Torneo Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
          <Card className="relative bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-2xl overflow-hidden h-full">
            <div className="h-1.5 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff]" />
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-[#ad45ff] to-[#c77dff] rounded-xl shadow-lg shadow-[#ad45ff]/25">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  Información del Torneo
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="p-2 bg-[#ad45ff]/10 rounded-lg">
                    <Trophy className="h-4 w-4 text-[#ad45ff]" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Nombre
                    </span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {tournamentData.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="p-2 bg-[#c77dff]/10 rounded-lg">
                    <Building className="h-4 w-4 text-[#c77dff]" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Liga
                    </span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {tournamentData.liga}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="p-2 bg-[#a3b3ff]/10 rounded-lg">
                    <MapPin className="h-4 w-4 text-[#a3b3ff]" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Localidad
                    </span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {tournamentData.locality}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Inicio
                      </span>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {formatDate(tournamentData.startDate, "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  {tournamentData.endDate && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Fin
                        </span>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {formatDate(tournamentData.endDate, "dd MMM yyyy")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {tournamentData.description && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Descripción
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {tournamentData.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Configuración Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#c77dff] via-[#a3b3ff] to-[#ad45ff] rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
          <Card className="relative bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-2xl overflow-hidden h-full">
            <div className="h-1.5 bg-gradient-to-r from-[#c77dff] via-[#a3b3ff] to-[#ad45ff]" />
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-[#c77dff] to-[#a3b3ff] rounded-xl shadow-lg shadow-[#c77dff]/25">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  Configuración
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Formato
                  </span>
                  <Badge className="bg-gradient-to-r from-[#ad45ff] to-[#c77dff] text-white border-0 shadow-lg shadow-[#ad45ff]/25">
                    {TOURNAMENT_FORMAT_LABELS[tournamentData.format] ||
                      tournamentData.format}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Categoría
                  </span>
                  <Badge className="bg-gradient-to-r from-[#c77dff] to-[#a3b3ff] text-white border-0 shadow-lg shadow-[#c77dff]/25">
                    {TOURNAMENT_CATEGORY_LABELS[tournamentData.category] ||
                      tournamentData.category}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Ida y Vuelta
                  </span>
                  <Badge
                    className={`${
                      tournamentData.homeAndAway
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    } border-0`}
                  >
                    {tournamentData.homeAndAway ? "Sí" : "No"}
                  </Badge>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Clock className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Registro de actividad
                  </span>
                </div>
                <div className="space-y-2 pl-11 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Creado</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(tournamentData.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Actualizado</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(tournamentData.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
};

export default TabsOverview;
