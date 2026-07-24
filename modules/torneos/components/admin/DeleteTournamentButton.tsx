"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { api } from "@/lib/api-client";
import { ITorneo } from "@modules/torneos/types";

interface DeleteTournamentButtonProps {
  tournament: ITorneo;
  /** Ruta a la que ir tras eliminar. Pasala cuando el botón vive en la ficha
      del propio torneo: esa ruta deja de existir al darlo de baja. Mismo
      contrato que `<DeleteOrDisableButtons redirectAfterDelete>`. */
  redirectAfterDelete?: string;
}

/**
 * Baja de un torneo (F4).
 *
 * Dos cosas cambiaron acá:
 *
 * 1. **El copy mentía.** Decía "Esta acción no se puede deshacer. Se eliminará
 *    el torneo y todos sus datos", pero el DELETE es un **soft delete** (C7):
 *    escribe `deletedAt` y conserva partidos, goles, tarjetas y la tabla de
 *    posiciones. Asustaba con una consecuencia que no ocurre.
 * 2. **Ahora se puede deshacer de verdad**: el toast ofrece "Deshacer" contra
 *    `POST /api/tournaments/[id]/restore`. El soft delete siempre lo permitió;
 *    lo que faltaba era la forma de pedirlo sin entrar a la base a mano.
 */
export function DeleteTournamentButton({
  tournament,
  redirectAfterDelete,
}: Readonly<DeleteTournamentButtonProps>) {
  const router = useRouter();

  const restore = async () => {
    const res = await api.post(`/api/tournaments/${tournament.id}/restore`);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(`"${tournament.name}" volvió al listado`);
    // Si se eliminó desde la ficha, el "Deshacer" tiene que devolver ahí:
    // deshacer significa volver al estado anterior, también el de navegación.
    if (redirectAfterDelete) router.push(`/admin/torneos/${tournament.id}`);
    router.refresh();
  };

  const handleDelete = async () => {
    const res = await api.del(`/api/tournaments/${tournament.id}`);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(`"${tournament.name}" eliminado`, {
      description: "El historial se conserva por si lo restaurás.",
      // 10s en vez de los 4 por defecto: un "Deshacer" que se va antes de que
      // el usuario registre el error no sirve de nada.
      duration: 10000,
      action: { label: "Deshacer", onClick: () => void restore() },
    });

    // Tras borrar desde la ficha del propio torneo, esa ruta ya no existe
    if (redirectAfterDelete) router.push(redirectAfterDelete);
    router.refresh();
  };

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="destructive"
          size="sm"
          aria-label={`Eliminar ${tournament.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      }
      title="¿Eliminar el torneo?"
      description={
        <>
          <b>{tournament.name}</b> sale del listado y del sitio público. Sus
          partidos, goles y tabla de posiciones se conservan, y vas a poder
          restaurarlo desde el aviso que aparece al eliminarlo.
        </>
      }
      confirmLabel="Eliminar"
      onConfirm={handleDelete}
    />
  );
}
