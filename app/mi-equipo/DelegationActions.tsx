"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, MoreVertical, Send, UserRoundPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  cancelMyTeamRequest,
  resignMyDelegation,
  transferMyDelegation,
} from "@modules/delegados/actions/requests";
import type { ApprovalStatus } from "@prisma/client";

/**
 * Acciones que el delegado tiene sobre su propio vínculo con el equipo (N13):
 * cancelar la solicitud mientras está pendiente, proponer un sucesor, o dejar
 * el rol. Las tres viven acá y no en la liga, porque son decisiones suyas.
 */
export default function DelegationActions({
  teamId,
  teamName,
  status,
}: Readonly<{ teamId: string; teamName: string; status: ApprovalStatus }>) {
  const router = useRouter();
  const [isPending, startAction] = useTransition();
  const [transferOpen, setTransferOpen] = useState(false);
  const [email, setEmail] = useState("");

  const run = (fn: () => Promise<{ success: boolean; message?: string; error?: string }>) =>
    startAction(async () => {
      const res = await fn();
      if (!res.success) {
        toast.error(res.error ?? "No se pudo completar la acción");
        return;
      }
      toast.success(res.message ?? "Listo");
      setTransferOpen(false);
      setEmail("");
      router.refresh();
    });

  if (status === "PENDIENTE") {
    return (
      <ConfirmDialog
        title="¿Cancelar la solicitud?"
        description={
          <>
            Se retira tu pedido para representar a <strong>{teamName}</strong>.
            La liga deja de verlo. Podés volver a pedirlo cuando quieras.
          </>
        }
        confirmLabel="Cancelar solicitud"
        cancelLabel="Volver"
        tone="warning"
        icon={X}
        onConfirm={() => run(() => cancelMyTeamRequest(teamId))}
        trigger={
          <Button variant="ghost" size="sm" disabled={isPending}>
            <X className="h-4 w-4" aria-hidden="true" />
            Cancelar
          </Button>
        }
      />
    );
  }

  if (status !== "APROBADO") return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled={isPending}
            aria-label={`Más acciones para ${teamName}`}
          >
            <MoreVertical className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setTransferOpen(true)}>
            <UserRoundPlus className="h-4 w-4" aria-hidden="true" />
            Pasarle el equipo a otra persona
          </DropdownMenuItem>
          <ConfirmDialog
            title="¿Dejar de ser delegado?"
            description={
              <>
                Vas a dejar de representar a <strong>{teamName}</strong>: no vas
                a poder cargar su plantel ni inscribirlo en torneos. La liga
                puede aprobar a otra persona cuando la haya.
              </>
            }
            confirmLabel="Dejar el rol"
            tone="danger"
            icon={LogOut}
            onConfirm={() => run(() => resignMyDelegation(teamId))}
            trigger={
              <DropdownMenuItem
                // `preventDefault` para que el menú no se cierre antes de que
                // el ConfirmDialog llegue a montarse.
                onSelect={(e) => e.preventDefault()}
                className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-500/10 dark:focus:text-red-300"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Dejar de ser delegado
              </DropdownMenuItem>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pasarle {teamName} a otra persona</DialogTitle>
            <DialogDescription>
              La liga tiene que aprobarlo, igual que cuando pediste el equipo.
              Mientras tanto seguís siendo el delegado, así que el equipo nunca
              queda sin nadie a cargo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="email-sucesor">Email de la persona</Label>
            <Input
              id="email-sucesor"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="persona@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && email.trim()) {
                  run(() => transferMyDelegation(teamId, email));
                }
              }}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tiene que tener una cuenta en GOLAZO con ese email.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTransferOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="brand"
              disabled={isPending || !email.trim()}
              onClick={() => run(() => transferMyDelegation(teamId, email))}
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Proponer a la liga
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
