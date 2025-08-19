"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { ITorneo } from "@/components/torneos/types";
import { useState } from "react";
import TournamentForm from "./tournament-form";

interface PropsHeader {
  tournamentData: ITorneo;
}

const Header = (props: PropsHeader) => {
  const { tournamentData } = props;
  console.log(tournamentData);
  const [editingTournament, setEditingTournament] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Tournament editing actions (mock)
  const handleEditTournament = async (data: ITorneo) => {
    setIsLoading(true);
    try {
      console.log("Editando torneo:", data.id, data);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setEditingTournament(false);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link href="/admin/torneos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div className="flex items-center space-x-3">
          <img
            src={
              tournamentData.logoUrl ||
              "/placeholder.svg?height=48&width=48&query=torneo-logo"
            }
            alt={`Logo ${tournamentData.name}`}
            className="w-13 h-13 object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {tournamentData.name}
            </h1>
            <p className="text-muted-foreground">
              {tournamentData.category} • {tournamentData.locality}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Dialog open={editingTournament} onOpenChange={setEditingTournament}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Torneo</DialogTitle>
              <DialogDescription>
                Modifica la información del torneo
              </DialogDescription>
            </DialogHeader>
            <TournamentForm
              onSubmit={handleEditTournament}
              onCancel={() => setEditingTournament(false)}
              initialData={{
                name: tournamentData.name,
                description: tournamentData.description,
                category: tournamentData.category,
                locality: tournamentData.locality,
                logoUrl: tournamentData.logoUrl,
                liga: tournamentData.liga,
                status: tournamentData.status,
                format: tournamentData.format,
                nextMatch: tournamentData.nextMatch || "",
                homeAndAway: tournamentData.homeAndAway,
                startDate: tournamentData.startDate,
                endDate: tournamentData.endDate || "",
              }}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente
                el torneo <strong> "{tournamentData.name}"</strong> y todos sus
                datos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                Eliminar Torneo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Header;
