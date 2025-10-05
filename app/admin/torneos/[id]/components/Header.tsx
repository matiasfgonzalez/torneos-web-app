import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Trophy,
  MapPin,
  Calendar,
  Building,
  Star,
} from "lucide-react";
import { ITorneo } from "@/components/torneos/types";
import DialogAddTournaments from "../../components/DialogAddTournaments";
import { DeleteTournamentButton } from "../../components/DeleteTournamentButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/formatDate";

interface PropsHeader {
  tournamentData: ITorneo;
}

const Header = (props: PropsHeader) => {
  const { tournamentData } = props;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "En curso":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            En curso
          </Badge>
        );
      case "Finalizado":
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0">
            <Trophy className="w-3 h-3 mr-1" />
            Finalizado
          </Badge>
        );
      case "Inscripciones":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <Star className="w-3 h-3 mr-1" />
            Inscripciones
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white border-0">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <div className="flex items-center space-x-2">
        <Link href="/admin/torneos">
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-[#ad45ff] hover:text-white hover:border-[#ad45ff] transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Torneos
          </Button>
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600 font-medium">Detalle del Torneo</span>
      </div>

      {/* Main header card */}
      <Card className="border-2 border-[#ad45ff]/20 shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff]/5 to-[#a3b3ff]/5" />

        <CardContent className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Tournament info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Logo */}
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-white">
                  <img
                    src={
                      tournamentData.logoUrl ||
                      "/placeholder.svg?height=96&width=96&query=torneo-logo"
                    }
                    alt={`Logo ${tournamentData.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Badge de estado superpuesto */}
                <div className="absolute -top-2 -right-2">
                  {getStatusBadge(tournamentData.status)}
                </div>
              </div>

              {/* Tournament details */}
              <div className="space-y-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                    {tournamentData.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4 text-[#ad45ff]" />
                      <span className="font-medium">
                        {tournamentData.category}
                      </span>
                    </div>
                    {tournamentData.locality && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-[#ad45ff]" />
                        <span>{tournamentData.locality}</span>
                      </div>
                    )}
                    {tournamentData.liga && (
                      <div className="flex items-center space-x-1">
                        <Building className="w-4 h-4 text-[#ad45ff]" />
                        <span>{tournamentData.liga}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tournament dates */}
                <div className="flex flex-wrap gap-3">
                  {tournamentData.startDate && (
                    <div className="flex items-center space-x-1 bg-blue-50 px-3 py-1 rounded-full">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">
                        Inicio:{" "}
                        {formatDate(tournamentData.startDate, "dd/MM/yyyy")}
                      </span>
                    </div>
                  )}
                  {tournamentData.endDate && (
                    <div className="flex items-center space-x-1 bg-purple-50 px-3 py-1 rounded-full">
                      <Calendar className="w-3 h-3 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">
                        Fin: {formatDate(tournamentData.endDate, "dd/MM/yyyy")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description if exists */}
                {tournamentData.description && (
                  <p className="text-gray-600 max-w-2xl leading-relaxed">
                    {tournamentData.description}
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <DialogAddTournaments tournament={tournamentData} />
              <DeleteTournamentButton tournament={tournamentData} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Header;
