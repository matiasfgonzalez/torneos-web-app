"use client";

import { ITeam } from "@modules/equipos/types/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PropsDeleteTeamButton {
  team: ITeam;
}

const DeleteTeamButton = (props: Readonly<PropsDeleteTeamButton>) => {
  const { team } = props;

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);

      const res = await fetch(`/api/team/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar el torneo");

      toast.success("Equipo eliminado correctamente");

      // Sólo cerrar el modal si la eliminación fue exitosa
      setOpen(false);
      router.refresh(); // o router.push("/admin/torneos")
    } catch (error) {
      toast.error("No se pudo eliminar el equipo");
      console.error(error);
    } finally {
      setIsLoading(false); // Siempre asegurarse de resetear el estado
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="cursor-pointer">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar equipo?</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Esta acción no se puede deshacer. Se eliminará el equipo{" "}
          <strong>{team.name}</strong> y todos sus datos.
        </p>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete(team.id)}
            disabled={isLoading}
            className="cursor-pointer"
          >
            {isLoading ? "Eliminando..." : "Confirmar eliminación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTeamButton;
