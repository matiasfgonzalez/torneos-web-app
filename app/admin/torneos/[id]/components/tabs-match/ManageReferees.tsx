"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, UserMinus, ShieldCheck } from "lucide-react";
import { IPartidos, IReferee } from "@modules/partidos/types";
import { getReferees } from "@modules/arbitros/actions/actions";
import {
  assignRefereeToMatch,
  removeRefereeFromMatch,
} from "@modules/partidos/actions/referees";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface ManageRefereesProps {
  match: IPartidos;
  onUpdate: () => void;
}

const REFEREE_ROLES = [
  "Árbitro Principal",
  "Asistente 1",
  "Asistente 2",
  "Cuarto Árbitro",
  "VAR",
];

export default function ManageReferees({
  match,
  onUpdate,
}: ManageRefereesProps) {
  const [allReferees, setAllReferees] = useState<IReferee[]>([]);
  // El pendiente de la transición hace de "cargando árbitros".
  const [isLoadingReferees, startFetch] = useTransition();
  const [isAssigning, setIsAssigning] = useState(false);

  const [selectedRefereeId, setSelectedRefereeId] = useState("");
  const [selectedRole, setSelectedRole] = useState("Árbitro Principal");

  const matchReferees = match.referees || [];

  // Declarada ANTES del effect que la usa (si no, el effect la lee en la zona
  // muerta temporal: react-hooks/immutability) y con el fetch dentro de una
  // transición, para que el setState no quede en el cuerpo del effect
  // (react-hooks/set-state-in-effect).
  const fetchReferees = useCallback(() => {
    startFetch(async () => {
      const res = await getReferees();
      if (res.success) {
        setAllReferees(res.data as unknown as IReferee[]);
      }
    });
  }, []);

  useEffect(() => {
    fetchReferees();
  }, [fetchReferees]);

  const handleAssign = async () => {
    if (!selectedRefereeId) {
      toast.warning("Selecciona un árbitro");
      return;
    }

    // Validar si ya está asignado
    if (matchReferees.some((mr) => mr.refereeId === selectedRefereeId)) {
      toast.error("Este árbitro ya está asignado al partido");
      return;
    }

    setIsAssigning(true);
    try {
      const res = await assignRefereeToMatch({
        matchId: match.id,
        refereeId: selectedRefereeId,
        role: selectedRole,
      });

      if (res.success) {
        toast.success("Árbitro asignado");
        setSelectedRefereeId("");
        onUpdate();
      } else {
        toast.error(res.error || "Error al asignar");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast.error("Error inesperado");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemove = async (refereeId: string) => {
    setIsAssigning(true);
    try {
      const res = await removeRefereeFromMatch(match.id, refereeId);
      if (res.success) {
        toast.success("Árbitro removido");
        onUpdate();
      } else {
        toast.error(res.error);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast.error("Error inesperado");
    } finally {
      setIsAssigning(false);
    }
  };

  // Filtrar árbitros ya seleccionados para no mostrar en el select (opcional, o mostrar disabled)
  // Aquí los muestro todos pero validaré en el submit

  return (
    <div className="space-y-6 py-2">
      <div className="space-y-4 border rounded-lg p-4 bg-slate-50/50 dark:bg-slate-900/50">
        <h4 className="font-medium flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Asignar Autoridad
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Árbitro</Label>
            <Select
              value={selectedRefereeId}
              onValueChange={setSelectedRefereeId}
              disabled={isLoadingReferees}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingReferees ? "Cargando..." : "Selecciona..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {allReferees.map((ref) => (
                  <SelectItem key={ref.id} value={ref.id}>
                    {ref.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFEREE_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleAssign}
          disabled={isAssigning || !selectedRefereeId}
        >
          {isAssigning ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Asignar
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Autoridades Designadas
        </h4>
        {matchReferees.length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center py-4">
            Sin autoridades asignadas
          </p>
        ) : (
          <div className="space-y-2">
            {matchReferees.map((mr) => (
              <div
                key={mr.id}
                className="flex items-center justify-between p-2 rounded border bg-card text-card-foreground text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{mr.referee?.name}</span>
                  <Badge variant="outline" className="w-fit mt-1 text-xs">
                    {mr.role}
                  </Badge>
                </div>
                <ConfirmDialog
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Desasignar árbitro"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      disabled={isAssigning}
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  }
                  title="¿Desasignar árbitro?"
                  description={
                    <>
                      <b>{mr.referee?.name}</b> deja de estar designado como{" "}
                      <b>{mr.role}</b> en este partido.
                    </>
                  }
                  confirmLabel="Desasignar"
                  onConfirm={() => handleRemove(mr.refereeId)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
