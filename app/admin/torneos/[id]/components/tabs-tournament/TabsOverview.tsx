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
        <Card>
          <CardHeader>
            <CardTitle>Información del Torneo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Nombre:</span>
                <span>{tournamentData.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Liga:</span>
                <span>{tournamentData.liga}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Localidad:</span>
                <span>{tournamentData.locality}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Inicio:</span>
                <span>
                  {formatDate(tournamentData.startDate, "dd 'de' MMMM yyyy")}
                </span>
              </div>
              {tournamentData.endDate && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Fin:</span>
                  <span>
                    {formatDate(tournamentData.endDate, "dd 'de' MMMM yyyy")}
                  </span>
                </div>
              )}
            </div>
            {tournamentData.description && (
              <div>
                <h4 className="font-medium mb-2">Descripción:</h4>
                <p className="text-sm text-muted-foreground">
                  {tournamentData.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Formato:</span>
                <Badge variant="outline">{tournamentData.format}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Categoría:</span>
                <Badge variant="secondary">{tournamentData.category}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Ida y Vuelta:</span>
                <Badge
                  variant={tournamentData.homeAndAway ? "default" : "outline"}
                >
                  {tournamentData.homeAndAway ? "Sí" : "No"}
                </Badge>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground space-y-1">
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
