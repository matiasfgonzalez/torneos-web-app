"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeftRight, Check, Loader2, Wand2 } from "lucide-react";

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
import { toDateTimeInput } from "@/lib/date-input";
import {
  previewCupRound,
  saveCupRound,
  type CupPreview,
} from "@modules/torneos/actions/cups";

/** Próximo sábado 16:00, como default de fecha. */
function nextSaturday(): string {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  d.setHours(16, 0, 0, 0);
  return toDateTimeInput(d);
}

type Pair = { homeTeamId: string; awayTeamId: string };

/**
 * Genera los cruces de una ronda de copa y los muestra para **revisarlos y
 * ajustarlos** antes de confirmar. El sistema propone la siembra; el organizador
 * decide el emparejamiento final (puede querer un cruce específico, evitar un
 * clásico en primera ronda, etc.).
 *
 * El botón "Cambiar equipo" de cada lado intercambia ese equipo con el de otro
 * cruce que el usuario elige después — así siempre queda una permutación válida
 * (nadie repetido, nadie afuera), sin tener que validar 32 selects sueltos.
 */
export default function CupRoundPreview({
  phaseId,
  label,
  disabled,
  onSaved,
}: Readonly<{
  phaseId: string;
  label: string;
  disabled?: boolean;
  onSaved: () => void;
}>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<CupPreview | null>(null);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [startDate, setStartDate] = useState(nextSaturday());
  const [swapFrom, setSwapFrom] = useState<{ row: number; side: "home" | "away" } | null>(null);
  const [isLoading, startLoad] = useTransition();
  const [isSaving, startSave] = useTransition();

  const abrir = () =>
    startLoad(async () => {
      const res = await previewCupRound(phaseId);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setPreview(res.preview);
      setPairs(res.preview.matches.map((m) => ({ homeTeamId: m.homeTeamId, awayTeamId: m.awayTeamId })));
      setSwapFrom(null);
      setOpen(true);
    });

  const nameOf = (id: string) =>
    preview?.teams.find((t) => t.id === id)?.name ?? "?";

  /** Intercambia dos posiciones del cuadro; mantiene la permutación válida. */
  const swap = (row: number, side: "home" | "away") => {
    if (!swapFrom) {
      setSwapFrom({ row, side });
      return;
    }
    if (swapFrom.row === row && swapFrom.side === side) {
      setSwapFrom(null); // clic en el mismo: cancelar
      return;
    }
    setPairs((prev) => {
      const next = prev.map((p) => ({ ...p }));
      const a = swapFrom;
      const idA = a.side === "home" ? next[a.row].homeTeamId : next[a.row].awayTeamId;
      const idB = side === "home" ? next[row].homeTeamId : next[row].awayTeamId;
      if (a.side === "home") next[a.row].homeTeamId = idB;
      else next[a.row].awayTeamId = idB;
      if (side === "home") next[row].homeTeamId = idA;
      else next[row].awayTeamId = idA;
      return next;
    });
    setSwapFrom(null);
  };

  const confirmar = () =>
    startSave(async () => {
      const res = await saveCupRound({ phaseId, startDate: new Date(startDate).toISOString(), pairs });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message ?? "Cruces confirmados");
      setOpen(false);
      onSaved();
      router.refresh();
    });

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || isLoading}
        onClick={abrir}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Wand2 className="h-4 w-4" aria-hidden="true" />
        )}
        Generar cruces
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Revisá los cruces — {preview?.roundName ?? label}</DialogTitle>
            <DialogDescription>
              El sistema los sembró por rendimiento. Tocá{" "}
              <ArrowLeftRight className="inline h-3.5 w-3.5" aria-hidden="true" />{" "}
              en un equipo y después en otro para intercambiarlos. Cuando estén
              como querés, confirmá.
            </DialogDescription>
          </DialogHeader>

          {preview && (
            <div className="space-y-2">
              {pairs.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-card p-2.5 dark:border-gray-700"
                >
                  <span className="w-6 shrink-0 text-center text-xs font-medium text-gray-400">
                    {i + 1}
                  </span>
                  <TeamChip
                    name={nameOf(p.homeTeamId)}
                    active={swapFrom?.row === i && swapFrom.side === "home"}
                    onClick={() => swap(i, "home")}
                  />
                  <span className="shrink-0 text-xs font-semibold text-gray-400">
                    vs
                  </span>
                  <TeamChip
                    name={nameOf(p.awayTeamId)}
                    active={swapFrom?.row === i && swapFrom.side === "away"}
                    onClick={() => swap(i, "away")}
                  />
                </div>
              ))}

              {preview.byes.length > 0 && (
                <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                  Pasan sin jugar: {preview.byes.map((b) => b.name).join(", ")}.
                </p>
              )}

              <div className="space-y-2 pt-2">
                <Label htmlFor="cup-start">Primera fecha de la ronda</Label>
                <Input
                  id="cup-start"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Todos se programan ese día; después reprogramás cada uno desde
                  la tabla de partidos.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="brand" onClick={confirmar} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Check className="h-4 w-4" aria-hidden="true" />
              )}
              Confirmar cruces
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Un equipo del cruce: botón que se resalta al elegirlo para intercambiar. */
function TeamChip({
  name,
  active,
  onClick,
}: Readonly<{ name: string; active: boolean; onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border px-2.5 py-2 text-left text-sm transition-colors ${
        active
          ? "border-brand bg-brand/10 font-semibold text-brand ring-2 ring-brand/30"
          : "border-gray-200 hover:border-brand/50 hover:bg-brand/5 dark:border-gray-700"
      }`}
    >
      <ArrowLeftRight
        className="h-3.5 w-3.5 shrink-0 opacity-50"
        aria-hidden="true"
      />
      <span className="truncate">{name}</span>
    </button>
  );
}
