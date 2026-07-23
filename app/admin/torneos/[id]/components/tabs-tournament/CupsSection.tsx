"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Medal,
  Plus,
  Swords,
  Trash2,
  Trophy,
  Wand2,
} from "lucide-react";
import type { PhaseSeedSource } from "@prisma/client";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  createCupPhase,
  deleteCupPhase,
  generateCupRound,
  getTournamentGroupCount,
  getTournamentPhases,
} from "@modules/torneos/actions/cups";

type Phase = Awaited<ReturnType<typeof getTournamentPhases>>[number];

const SOURCE_LABEL: Record<PhaseSeedSource, string> = {
  STANDINGS: "Por posición en la tabla general",
  GROUP_POSITION: "Por posición en cada grupo (tipo Mundial)",
  WINNERS: "Ganadores de otra fase",
  LOSERS: "Perdedores de otra fase",
};

/** Potencia de 2 igual o mayor: cuántas llaves entran en el cuadro. */
function bracketSize(n: number): number {
  let size = 1;
  while (size < n) size *= 2;
  return size;
}

/** De dónde salen los equipos de una copa, en texto para la lista. */
function describeSource(p: Phase, origen: string | undefined): string {
  const fase = `«${origen ?? "?"}»`;
  switch (p.seedSource) {
    case "STANDINGS":
      return `Posiciones ${p.seedFrom}-${p.seedTo} de ${fase}`;
    case "GROUP_POSITION":
      return `${p.seedFrom} por grupo${
        p.seedTo ? ` + ${p.seedTo} mejores` : ""
      } de ${fase}`;
    case "WINNERS":
      return `Ganadores de ${fase}`;
    case "LOSERS":
      return `Perdedores de ${fase}`;
    default:
      return fase;
  }
}

/**
 * Copas y fase final del torneo (S13).
 *
 * Permite armar, dentro de un mismo torneo, tantas copas como haga falta:
 * "1-8 a la Copa de Oro, 9-16 a la Plata, 17-20 a la Bronce", o el cruce
 * clásico donde los ganadores de cuartos van a una copa y los perdedores a
 * otra. Un torneo de liga simple no crea ninguna y esta pestaña queda vacía.
 */
export default function CupsSection({
  tournamentId,
}: Readonly<{ tournamentId: string }>) {
  const router = useRouter();
  const [phases, setPhases] = useState<Phase[] | null>(null);
  const [, startLoad] = useTransition();
  const [isWorking, startWork] = useTransition();
  const [open, setOpen] = useState(false);

  const [cupName, setCupName] = useState("");
  const [name, setName] = useState("");
  const [source, setSource] = useState<PhaseSeedSource>("STANDINGS");
  const [sourcePhaseId, setSourcePhaseId] = useState("");
  const [from, setFrom] = useState("1");
  const [to, setTo] = useState("8");
  // Modo "por grupo": cuántos clasifican de cada grupo + cuántos mejores terceros.
  const [perGroup, setPerGroup] = useState("2");
  const [bestThirds, setBestThirds] = useState("8");
  const [groupCount, setGroupCount] = useState(0);

  const load = () =>
    startLoad(async () => {
      const [ph, gc] = await Promise.all([
        getTournamentPhases(tournamentId),
        getTournamentGroupCount(tournamentId),
      ]);
      setPhases(ph);
      setGroupCount(gc);
    });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId]);

  const run = (fn: () => Promise<{ success: boolean; message?: string; error?: string }>) =>
    startWork(async () => {
      const res = await fn();
      if (!res.success) {
        toast.error(res.error ?? "No se pudo completar la acción");
        return;
      }
      toast.success(res.message ?? "Listo");
      setOpen(false);
      setPhases(await getTournamentPhases(tournamentId));
      router.refresh();
    });

  const isLoading = phases === null;
  const list = phases ?? [];
  const cups = list.filter((p) => p.cupName);
  const sourceOptions = list; // cualquier fase puede ser origen

  // Cuántos clasifican con el modo "por grupo", en vivo, para que el usuario
  // vea el resultado antes de crear la ronda.
  const clasificados =
    groupCount * (Number(perGroup) || 0) + (Number(bestThirds) || 0);
  const cruces = Math.floor(bracketSize(clasificados) / 2);
  const hayByes = clasificados > 0 && clasificados !== bracketSize(clasificados);

  const submit = () => {
    const config =
      source === "STANDINGS"
        ? { seedFrom: Number(from), seedTo: Number(to) }
        : source === "GROUP_POSITION"
          ? { seedFrom: Number(perGroup), seedTo: Number(bestThirds) }
          : { seedFrom: null, seedTo: null };

    run(() =>
      createCupPhase({
        tournamentId,
        name,
        cupName,
        seedSource: source,
        sourcePhaseId,
        ...config,
      }),
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <Trophy className="h-5 w-5 text-brand" aria-hidden="true" />
            Copas y fase final
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Terminada la fase regular, repartí los equipos en las copas que
            necesites. Los partidos de copa no suman puntos a la tabla.
          </p>
        </div>
        <Button
          variant="brand"
          onClick={() => setOpen(true)}
          disabled={isLoading || sourceOptions.length === 0}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nueva ronda de copa
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-brand" aria-hidden="true" />
        </div>
      ) : sourceOptions.length === 0 ? (
        <EmptyState
          icon={Swords}
          title="Todavía no hay fases"
          description="Generá primero el fixture de la fase regular: las copas toman sus equipos de esa tabla."
        />
      ) : cups.length === 0 ? (
        <EmptyState
          icon={Medal}
          title="Este torneo no tiene copas"
          description="Creá una ronda para repartir a los equipos: por ejemplo, del 1 al 8 a la Copa de Oro y del 9 al 16 a la Copa de Plata."
        />
      ) : (
        <div className="space-y-3">
          {cups.map((p) => {
            const origen = list.find((x) => x.id === p.sourcePhaseId);
            const generada = p._count.matches > 0;
            return (
              <div
                key={p.id}
                className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-card p-4 sm:flex-row sm:items-center dark:border-gray-700"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {p.cupName} — {p.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {describeSource(p, origen?.name)}
                    {generada
                      ? ` · ${p._count.matches} ${p._count.matches === 1 ? "cruce" : "cruces"}`
                      : " · sin generar"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!generada && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isWorking}
                      onClick={() => run(() => generateCupRound(p.id))}
                    >
                      <Wand2 className="h-4 w-4" aria-hidden="true" />
                      Generar cruces
                    </Button>
                  )}
                  <ConfirmDialog
                    title="¿Eliminar esta ronda?"
                    description={
                      <>
                        Se elimina <strong>{p.cupName} — {p.name}</strong> y sus
                        cruces programados. Si ya tiene partidos jugados, el
                        sistema no te va a dejar.
                      </>
                    }
                    confirmLabel="Eliminar"
                    tone="danger"
                    icon={Trash2}
                    onConfirm={() => run(() => deleteCupPhase(p.id))}
                    trigger={
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-500/10"
                        disabled={isWorking}
                        aria-label={`Eliminar ${p.cupName} ${p.name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva ronda de copa</DialogTitle>
            <DialogDescription>
              Definís de dónde salen los equipos. Los cruces se generan después,
              cuando la fase de origen tenga resultados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cup-name">Copa</Label>
                <Input
                  id="cup-name"
                  placeholder="Copa de Oro"
                  value={cupName}
                  onChange={(e) => setCupName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="round-name">Ronda</Label>
                <Input
                  id="round-name"
                  placeholder="Semifinal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>¿De dónde salen los equipos?</Label>
              <Select
                value={source}
                onValueChange={(v) => setSource(v as PhaseSeedSource)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SOURCE_LABEL).map(([v, label]) => (
                    <SelectItem key={v} value={v}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fase de origen</Label>
              <Select value={sourcePhaseId} onValueChange={setSourcePhaseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegí la fase" />
                </SelectTrigger>
                <SelectContent>
                  {sourceOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.cupName ? `${p.cupName} — ${p.name}` : p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {source === "STANDINGS" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pos-from">Desde la posición</Label>
                  <Input
                    id="pos-from"
                    type="number"
                    min={1}
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pos-to">Hasta la posición</Label>
                  <Input
                    id="pos-to"
                    type="number"
                    min={1}
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
              </div>
            )}

            {source === "GROUP_POSITION" && (
              <div className="space-y-3">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="per-group">
                      Clasifican de cada grupo
                    </Label>
                    <Input
                      id="per-group"
                      type="number"
                      min={1}
                      value={perGroup}
                      onChange={(e) => setPerGroup(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Los primeros de cada grupo (2 = 1° y 2°).
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="best-thirds">Más los mejores</Label>
                    <Input
                      id="best-thirds"
                      type="number"
                      min={0}
                      value={bestThirds}
                      onChange={(e) => setBestThirds(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Mejores terceros entre todos los grupos (0 = ninguno).
                    </p>
                  </div>
                </div>

                {/* Contador en vivo: el usuario ve el resultado antes de crear. */}
                <div className="rounded-xl border border-brand/20 bg-brand/5 p-3 text-sm">
                  {groupCount === 0 ? (
                    <span className="text-amber-600 dark:text-amber-400">
                      Este torneo no tiene grupos asignados. Este modo necesita
                      una fase de grupos.
                    </span>
                  ) : (
                    <span className="text-gray-700 dark:text-gray-200">
                      <strong>{groupCount}</strong> grupos ×{" "}
                      <strong>{perGroup || 0}</strong> ={" "}
                      {groupCount * (Number(perGroup) || 0)} directos
                      {Number(bestThirds) > 0 &&
                        ` + ${Number(bestThirds)} mejores`}{" "}
                      = <strong>{clasificados}</strong> clasificados →{" "}
                      <strong>{cruces}</strong>{" "}
                      {cruces === 1 ? "cruce" : "cruces"}
                      {hayByes && (
                        <span className="text-amber-600 dark:text-amber-400">
                          {" "}
                          (no es potencia de 2: algunos pasan sin jugar)
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            )}

            <p className="rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-600 dark:bg-gray-900/50 dark:text-gray-400">
              <strong>Mundial (grupos):</strong> «Por posición en cada grupo» con
              2 por grupo + 8 mejores terceros arma los dieciseisavos. Después,
              cada ronda siguiente (octavos, cuartos…) se crea con «Ganadores de
              otra fase», y el 3° puesto con «Perdedores» de la semifinal.
              <br />
              <strong>Liga con playoff:</strong> «Por posición en la tabla
              general», 1-8 «Copa de Oro» y 9-16 «Copa de Plata».
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isWorking}>
              Cancelar
            </Button>
            <Button
              variant="brand"
              onClick={submit}
              disabled={isWorking || !cupName.trim() || !name.trim() || !sourcePhaseId}
            >
              {isWorking && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Crear ronda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
