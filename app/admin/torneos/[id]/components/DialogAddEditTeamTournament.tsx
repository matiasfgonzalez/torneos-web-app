"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Edit, Plus, Trophy } from "lucide-react";
import TournamentTeamForm from "./tournament-team-form";
import { ITorneo } from "@modules/torneos/types";
import { ITeam } from "@modules/equipos/types/types";
import { ITournamentTeam } from "@modules/torneos/types/tournament-teams.types";

interface DialogAddEditTeamTournamentProps {
  mode: "create" | "edit";
  tournamentData: ITorneo;
  tournamentTeam: ITournamentTeam | null;
  equipos: ITeam[];
  usedTeamIds: string[];
}

const DialogAddEditTeamTournament = (
  porps: DialogAddEditTeamTournamentProps,
) => {
  const { mode, tournamentData, equipos, usedTeamIds, tournamentTeam } = porps;
  const [createAssocOpen, setCreateAssocOpen] = useState(false);
  return (
    <Dialog open={createAssocOpen} onOpenChange={setCreateAssocOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button className="bg-gradient-to-r from-[#ad45ff] to-[#c77dff] hover:from-[#9c3ee6] hover:to-[#b66de6] text-white shadow-lg shadow-[#ad45ff]/25 hover:shadow-xl hover:shadow-[#ad45ff]/30 transition-all duration-300">
            <Plus className="mr-2 h-4 w-4" />
            Asociar equipo
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            title="Editar asociación"
            className="hover:bg-[#ad45ff]/10 hover:text-[#ad45ff] transition-colors"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-2xl p-0">
        {/* Gradient accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] rounded-t-2xl" />

        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#ad45ff] to-[#c77dff] rounded-xl shadow-lg shadow-[#ad45ff]/25">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                {mode === "create"
                  ? "Asociar equipo al torneo"
                  : "Editar asociación"}
              </DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400 mt-1">
                {mode === "create"
                  ? "Selecciona un equipo y configura su participación en el torneo"
                  : "Actualiza grupo, estado y estadísticas del equipo"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          <TournamentTeamForm
            mode={mode}
            tournamentId={tournamentData.id}
            tournamentTeam={tournamentTeam}
            teams={equipos}
            usedTeamIds={usedTeamIds}
            onCancel={() => setCreateAssocOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogAddEditTeamTournament;
