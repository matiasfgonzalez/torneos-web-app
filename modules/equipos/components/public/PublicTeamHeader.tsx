import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, User, Shield, Users, Shirt } from "lucide-react";

interface PublicTeamHeaderProps {
  readonly team: any;
}

export default function PublicTeamHeader({
  team,
}: Readonly<PublicTeamHeaderProps>) {
  return (
    <div className="relative">
      {/* Main Card with dark gradient for Premium Golazo */}
      <div className="relative bg-gradient-to-br from-[#1a0a2e] via-[#2d1b4e] to-[#1a0a2e] rounded-3xl shadow-2xl overflow-hidden border border-[#ad45ff]/20">
        {/* Decorative blur orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#ad45ff]/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#c77dff]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Gradient top accent */}
        <div className="h-1.5 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff]" />

        <div className="relative px-6 sm:px-8 lg:px-12 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Logo with glow effect */}
            <div className="relative group flex-shrink-0">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#ad45ff] to-[#c77dff] rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-4 flex items-center justify-center border-4 border-white/10">
                {team.logoUrl ? (
                  <img
                    src={team.logoUrl}
                    alt={team.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Shield className="w-20 h-20 text-[#ad45ff]" />
                )}
              </div>
            </div>

            {/* Team Info */}
            <div className="flex-1 text-center lg:text-left space-y-4">
              {/* Team Name & Badge */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center lg:justify-start">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                    {team.name}
                  </h1>
                  {team.shortName && (
                    <Badge className="bg-gradient-to-r from-[#ad45ff] to-[#c77dff] text-white border-0 text-sm px-3 py-1 w-fit mx-auto sm:mx-0">
                      {team.shortName}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Info Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                  <MapPin className="w-4 h-4 text-[#ad45ff]" />
                  <span className="text-white/90 text-sm">
                    {team.homeCity || "Ciudad no definida"}
                  </span>
                </div>
                {team.yearFounded && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                    <Calendar className="w-4 h-4 text-[#c77dff]" />
                    <span className="text-white/90 text-sm">
                      Fundado: {team.yearFounded}
                    </span>
                  </div>
                )}
                {team.coach && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                    <User className="w-4 h-4 text-[#a3b3ff]" />
                    <span className="text-white/70 text-sm">DT:</span>
                    <span className="text-white font-semibold text-sm">
                      {team.coach}
                    </span>
                  </div>
                )}
              </div>

              {/* Colors */}
              <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-white/50" />
                  <span className="text-white/50 text-xs uppercase tracking-wider">
                    Colores:
                  </span>
                </div>
                <div className="flex gap-2">
                  <div
                    className="w-8 h-8 rounded-xl border-2 border-white/20 shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: team.homeColor || "#4c1d95" }}
                    title="Titular"
                  />
                  <div
                    className="w-8 h-8 rounded-xl border-2 border-white/20 shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: team.awayColor || "#f0f0f0" }}
                    title="Suplente"
                  />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-row lg:flex-col gap-4 flex-shrink-0">
              <div className="bg-gradient-to-br from-[#ad45ff]/20 to-[#c77dff]/10 backdrop-blur-sm rounded-2xl p-4 border border-[#ad45ff]/20 text-center min-w-[100px]">
                <Users className="w-6 h-6 text-[#ad45ff] mx-auto mb-2" />
                <div className="text-2xl font-black text-white">
                  {team.jugadores?.length || 0}
                </div>
                <div className="text-xs text-white/60 uppercase tracking-wider">
                  Jugadores
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#c77dff]/20 to-[#a3b3ff]/10 backdrop-blur-sm rounded-2xl p-4 border border-[#c77dff]/20 text-center min-w-[100px]">
                <Shield className="w-6 h-6 text-[#c77dff] mx-auto mb-2" />
                <div className="text-2xl font-black text-white">
                  {team.tournamentTeams?.length || 0}
                </div>
                <div className="text-xs text-white/60 uppercase tracking-wider">
                  Torneos
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
