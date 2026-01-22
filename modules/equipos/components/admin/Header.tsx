"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, User, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DeleteTeamButton from "./DeleteTeamButton";
import TeamForm from "./team-form";

interface PropsHeader {
  teamData: any; // Using any for flexibility with Prisma includes, or we can define a proper interface extending ITeam
}

const Header = (props: PropsHeader) => {
  const { teamData } = props;

  const getStatusBadge = (enabled: boolean) => {
    if (enabled) {
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
          Activo
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
          Inactivo
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <div className="flex items-center space-x-2">
        <Link href="/admin/equipos">
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-[#ad45ff] hover:text-white hover:border-[#ad45ff] transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Equipos
          </Button>
        </Link>
        <span className="text-gray-400 dark:text-gray-500">/</span>
        <span className="text-gray-600 dark:text-gray-300 font-medium">
          Detalle del Equipo
        </span>
      </div>

      {/* Main header card */}
      <Card className="border-2 border-[#ad45ff]/20 dark:border-[#ad45ff]/30 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff]/5 to-[#a3b3ff]/5 dark:from-[#ad45ff]/10 dark:to-[#a3b3ff]/10" />

        <CardContent className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Team info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Logo */}
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-4 border-white dark:border-gray-600 shadow-xl overflow-hidden bg-white dark:bg-gray-700 p-2 flex items-center justify-center">
                  {teamData.logoUrl ? (
                    <img
                      src={teamData.logoUrl}
                      alt={`Escudo ${teamData.name}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Shield className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                {/* Badge de estado superpuesto */}
                <div className="absolute -top-2 -right-2">
                  {getStatusBadge(teamData.enabled)}
                </div>
              </div>

              {/* Team details */}
              <div className="space-y-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                    {teamData.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-600 dark:text-gray-300">
                    {teamData.shortName && (
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold text-[#ad45ff] bg-[#ad45ff]/10 px-2 py-0.5 rounded-md">
                          {teamData.shortName}
                        </span>
                      </div>
                    )}
                    {teamData.homeCity && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-[#ad45ff]" />
                        <span>{teamData.homeCity}</span>
                      </div>
                    )}
                    {teamData.yearFounded && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-[#ad45ff]" />
                        <span>Fundado: {teamData.yearFounded}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex flex-wrap gap-3">
                  {teamData.coach && (
                    <div className="flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                      <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        DT: {teamData.coach}
                      </span>
                    </div>
                  )}

                  {/* Colors */}
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                    {(teamData.homeColor || teamData.awayColor) && (
                      <div className="flex gap-1">
                        {teamData.homeColor && (
                          <div
                            className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                            style={{ backgroundColor: teamData.homeColor }}
                            title="Color Local"
                          />
                        )}
                        {teamData.awayColor && (
                          <div
                            className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                            style={{ backgroundColor: teamData.awayColor }}
                            title="Color Visitante"
                          />
                        )}
                      </div>
                    )}
                    <span className="text-xs text-gray-500">Colores</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
              <TeamForm isEditMode={true} team={teamData} />
              <div className="w-full sm:w-auto">
                <DeleteTeamButton team={teamData} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Header;
