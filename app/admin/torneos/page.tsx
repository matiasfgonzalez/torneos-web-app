import StatsCards from "./components/StatsCards";
import ListTournaments from "./components/ListTournaments";
import DialogAddTournaments from "./components/DialogAddTournaments";
import { getTorneos } from "@/app/actions/torneos/getTorneos";
import { Trophy, TrendingUp, Calendar, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminTorneos() {
  const tournaments = await getTorneos();

  console.log("Torneos obtenidos:", tournaments);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="space-y-8 p-6 sm:p-8">
        {/* Header mejorado */}
        <div className="relative">
          {/* Background decorativo */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff]/5 to-[#a3b3ff]/5 rounded-3xl -z-10" />
          
          <Card className="border-2 border-[#ad45ff]/20 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-2xl flex items-center justify-center shadow-lg">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                        Gestión de Torneos
                      </h1>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <p className="text-gray-600 font-medium">
                          Sistema activo - {tournaments.length} torneos registrados
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 max-w-2xl leading-relaxed">
                    Administra todos los torneos de la plataforma con herramientas 
                    profesionales para crear, editar y gestionar competencias deportivas
                  </p>

                  {/* Quick stats inline */}
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">
                        {tournaments.filter(t => t.status === "En curso").length} activos
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        {tournaments.filter(t => t.status === "Inscripciones").length} inscribiendo
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">
                        Total: {tournaments.length}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full lg:w-auto">
                  <DialogAddTournaments />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards mejoradas */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
            <h2 className="text-xl font-semibold text-gray-900">
              Estadísticas Generales
            </h2>
          </div>
          <StatsCards tournaments={tournaments} />
        </div>

        {/* Lista de torneos mejorada */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
            <h2 className="text-xl font-semibold text-gray-900">
              Administración de Torneos
            </h2>
          </div>
          <ListTournaments tournaments={tournaments} />
        </div>
      </div>
    </div>
  );
}
