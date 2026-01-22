"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ITeam } from "@modules/equipos/types/types";

interface TeamCardProps {
  team: ITeam;
}

export default function TeamCard({ team }: TeamCardProps) {
  return (
    <Link href={`/equipos/${team.id}`} className="group block h-full">
      <Card className="h-full border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative group-hover:-translate-y-1">
        {/* Decorative gradient overlay */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

        <CardContent className="p-6 flex flex-col items-center text-center h-full">
          <div className="w-24 h-24 mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ad45ff]/20 to-[#a3b3ff]/20 rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center p-3 relative z-10 border border-gray-100 dark:border-gray-600 group-hover:border-[#ad45ff]/30 transition-colors">
              {team.logoUrl ? (
                <img
                  src={team.logoUrl}
                  alt={team.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff]">
                  {team.name.charAt(0)}
                </span>
              )}
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-[#ad45ff] transition-colors line-clamp-1">
            {team.name}
          </h3>

          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <MapPin className="w-3.5 h-3.5" />
            <span className="line-clamp-1">
              {team.homeCity || "Ciudad no definida"}
            </span>
          </div>

          <div className="mt-auto w-full pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
              <User className="w-3.5 h-3.5 text-[#ad45ff]" />
              <span className="text-xs font-medium truncate max-w-[100px]">
                {team.coach || "Sin DT"}
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-[#ad45ff] group-hover:text-white transition-colors duration-300">
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
