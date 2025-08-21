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

import { Edit, Plus } from "lucide-react";
import TournamentTeamForm from "./tournament-team-form";
import { ITorneo } from "@/components/torneos/types";
import { ITeam } from "@/components/equipos/types";
import { ITournamentTeam } from "@/components/tournament-teams/types";

interface DialogAddEditTeamTournamentProps {
  mode: "create" | "edit";
  tournamentData: ITorneo;
  tournamentTeam: ITournamentTeam | null;
  equipos: ITeam[];
  usedTeamIds: string[];
}

const DialogAddEditTeamTournament = (
  porps: DialogAddEditTeamTournamentProps
) => {
  const { mode, tournamentData, equipos, usedTeamIds, tournamentTeam } = porps;
  const [createAssocOpen, setCreateAssocOpen] = useState(false);
  return (
    <Dialog open={createAssocOpen} onOpenChange={setCreateAssocOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Asociar equipo
          </Button>
        ) : (
          <Button variant="ghost" size="sm" title="Editar asociación">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Asociar equipo al torneo"
              : "Editar asociación"}
          </DialogTitle>
          <DialogDescription>
            Actualiza grupo, estado y estadísticas
          </DialogDescription>
        </DialogHeader>
        <TournamentTeamForm
          mode={mode}
          tournamentId={tournamentData.id}
          tournamentTeam={tournamentTeam}
          teams={equipos}
          usedTeamIds={usedTeamIds}
          onCancel={() => setCreateAssocOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DialogAddEditTeamTournament;
