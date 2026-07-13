"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldAlert, Gavel, Loader2, X, Plus } from "lucide-react";
import { SuspensionsList } from "@modules/torneos/components/SuspensionsList";
import type { SuspensionView } from "@modules/torneos/actions/suspensions";
import {
  createManualSuspension,
  cancelManualSuspension,
} from "@modules/torneos/actions/suspensions";
import type { ITournamentTeam } from "@modules/torneos/types/tournament-teams.types";

interface PlayerOption {
  teamPlayerId: string;
  label: string;
}

/**
 * Sección de sancionados en el panel admin del torneo (N8): lista de
 * suspensiones activas + alta manual + cancelación de las manuales.
 */
export function AdminSuspensionsSection({
  suspensions,
  tournamentTeams,
}: {
  suspensions: SuspensionView[];
  tournamentTeams: ITournamentTeam[];
}) {
  const router = useRouter();
  const [teamPlayerId, setTeamPlayerId] = useState("");
  const [matches, setMatches] = useState("1");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  // Opciones de jugador a partir de los planteles del torneo
  const playerOptions: PlayerOption[] = tournamentTeams.flatMap((tt) =>
    (tt.teamPlayer ?? []).map((tp) => ({
      teamPlayerId: tp.id,
      label: `${tp.player.name} · ${tt.team?.name ?? "Equipo"}`,
    })),
  );

  const handleCreate = async () => {
    if (!teamPlayerId) {
      toast.warning("Elegí un jugador");
      return;
    }
    const total = parseInt(matches, 10);
    if (!Number.isInteger(total) || total < 1) {
      toast.warning("Las fechas deben ser un número mayor o igual a 1");
      return;
    }
    setSaving(true);
    try {
      const res = await createManualSuspension({
        teamPlayerId,
        totalMatches: total,
        notes: notes || undefined,
      });
      if (res.success) {
        toast.success("Suspensión manual registrada");
        setTeamPlayerId("");
        setMatches("1");
        setNotes("");
        router.refresh();
      } else {
        toast.error(res.error || "No se pudo registrar");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancelingId(id);
    try {
      const res = await cancelManualSuspension(id);
      if (res.success) {
        toast.success("Suspensión cancelada");
        router.refresh();
      } else {
        toast.error(res.error || "No se pudo cancelar");
      }
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-brand to-brand-2 rounded-xl flex items-center justify-center shadow-lg">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Sancionados
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Se actualizan solas con las tarjetas. También podés sancionar a mano.
          </p>
        </div>
      </div>

      {/* Alta manual */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
          <Gavel className="w-4 h-4 text-brand" />
          Suspensión manual
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-600 dark:text-gray-400">
              Jugador
            </Label>
            <Select value={teamPlayerId} onValueChange={setTeamPlayerId}>
              <SelectTrigger>
                <SelectValue placeholder="Elegí un jugador" />
              </SelectTrigger>
              <SelectContent>
                {playerOptions.map((p) => (
                  <SelectItem key={p.teamPlayerId} value={p.teamPlayerId}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-600 dark:text-gray-400">
              Fechas
            </Label>
            <Input
              type="number"
              min={1}
              max={99}
              value={matches}
              onChange={(e) => setMatches(e.target.value)}
              className="sm:w-24"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-600 dark:text-gray-400">
            Motivo (opcional)
          </Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Agresión a un rival"
            maxLength={200}
          />
        </div>
        <Button
          onClick={handleCreate}
          disabled={saving}
          className="bg-gradient-to-r from-brand to-brand-2 hover:from-brand-hover hover:to-brand-2 text-white font-semibold"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Sancionar
        </Button>
      </div>

      {/* Lista */}
      <SuspensionsList
        suspensions={suspensions}
        emptyLabel="No hay jugadores sancionados en este torneo"
        renderAction={(s) =>
          s.reason === "MANUAL" ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCancel(s.id)}
              disabled={cancelingId === s.id}
              className="text-gray-400 hover:text-red-500"
              aria-label={`Cancelar suspensión de ${s.player.name}`}
            >
              {cancelingId === s.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          ) : null
        }
      />
    </div>
  );
}
