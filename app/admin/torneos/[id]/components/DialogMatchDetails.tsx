"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Goal as GoalIcon, ShieldAlert, Users } from "lucide-react";
import { IPartidos } from "@modules/partidos/types";
import ManageGoals from "./tabs-match/ManageGoals";
import ManageCards from "./tabs-match/ManageCards";
import ManageReferees from "./tabs-match/ManageReferees";

interface DialogMatchDetailsProps {
  match: IPartidos;
  onUpdate: () => void;
}

export default function DialogMatchDetails({
  match,
  onUpdate,
}: DialogMatchDetailsProps) {
  const [open, setOpen] = useState(false);

  const homeTeamName =
    match.homeTeam.team.shortName || match.homeTeam.team.name;
  const awayTeamName =
    match.awayTeam.team.shortName || match.awayTeam.team.name;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-[#ad45ff]/20 text-[#ad45ff] hover:bg-[#ad45ff]/5"
        >
          Detalles
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto glass-card border-0">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
            {homeTeamName} vs {awayTeamName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="goals" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 dark:bg-gray-800/50 p-1">
            <TabsTrigger
              value="goals"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white transition-all"
            >
              <GoalIcon className="w-4 h-4 mr-2" /> Goles
            </TabsTrigger>
            <TabsTrigger
              value="cards"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white transition-all"
            >
              <ShieldAlert className="w-4 h-4 mr-2" /> Tarjetas
            </TabsTrigger>
            <TabsTrigger
              value="referees"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white transition-all"
            >
              <Users className="w-4 h-4 mr-2" /> Autoridades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="mt-4">
            <ManageGoals match={match} onUpdate={onUpdate} />
          </TabsContent>

          <TabsContent value="cards" className="mt-4">
            <ManageCards match={match} onUpdate={onUpdate} />
          </TabsContent>

          <TabsContent value="referees" className="mt-4">
            <ManageReferees match={match} onUpdate={onUpdate} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
