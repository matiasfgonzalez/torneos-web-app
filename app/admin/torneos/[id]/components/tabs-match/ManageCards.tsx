"use client";

import { useEffect, useState } from "react";
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
import { Loader2, Plus, Trash2, ShieldAlert } from "lucide-react";
import { IPartidos } from "@modules/partidos/types";
import { getTournamentTeamPlayers } from "@modules/equipos/actions/getTournamentTeamPlayers";
import { addCard, deleteCard } from "@modules/partidos/actions/cards";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CardType } from "@prisma/client";

interface ManageCardsProps {
  match: IPartidos;
  onUpdate: () => void;
}

interface PlayerOption {
  id: string;
  name: string;
  number: number | null;
}

export default function ManageCards({ match, onUpdate }: ManageCardsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPlayers, setIsFetchingPlayers] = useState(false);
  const [homePlayers, setHomePlayers] = useState<PlayerOption[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<PlayerOption[]>([]);

  // Form states
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    match.homeTeamId,
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [minute, setMinute] = useState<string>("");
  const [cardType, setCardType] = useState<CardType>(CardType.YELLOW);
  const [reason, setReason] = useState("");

  const cards = match.cards || [];
  const sortedCards = [...cards].sort(
    (a, b) => (a.minute || 0) - (b.minute || 0),
  );

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setIsFetchingPlayers(true);
    try {
      const [home, away] = await Promise.all([
        getTournamentTeamPlayers(match.homeTeamId),
        getTournamentTeamPlayers(match.awayTeamId),
      ]);
      setHomePlayers(
        home.map((tp: any) => ({
          id: tp.id,
          name: tp.player.name,
          number: tp.number,
        })),
      );
      setAwayPlayers(
        away.map((tp: any) => ({
          id: tp.id,
          name: tp.player.name,
          number: tp.number,
        })),
      );
    } catch (error) {
      console.error("Error fetching players:", error);
      toast.error("Error al cargar jugadores");
    } finally {
      setIsFetchingPlayers(false);
    }
  };

  const handleAddCard = async () => {
    if (!selectedPlayerId) {
      toast.warning("Selecciona un jugador");
      return;
    }

    setIsLoading(true);
    try {
      const res = await addCard({
        matchId: match.id,
        teamPlayerId: selectedPlayerId,
        type: cardType,
        minute: minute ? parseInt(minute) : undefined,
        reason: reason || undefined,
      });

      if (res.success) {
        toast.success("Tarjeta agregada");
        setMinute("");
        setReason("");
        onUpdate();
      } else {
        toast.error(res.error || "Error al agregar");
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("¿Eliminar tarjeta?")) return;
    setIsLoading(true);
    try {
      const res = await deleteCard(cardId);
      if (res.success) {
        toast.success("Tarjeta eliminada");
        onUpdate();
      } else {
        toast.error(res.error || "Error al eliminar");
      }
    } catch (error) {
      toast.error("Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const currentPlayers =
    selectedTeamId === match.homeTeamId ? homePlayers : awayPlayers;

  return (
    <div className="space-y-6 py-2">
      <div className="space-y-4 border rounded-lg p-4 bg-slate-50/50 dark:bg-slate-900/50">
        <h4 className="font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva Tarjeta
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Equipo</Label>
            <Select
              value={selectedTeamId}
              onValueChange={(v) => {
                setSelectedTeamId(v);
                setSelectedPlayerId("");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={match.homeTeamId}>
                  {match.homeTeam.team.name}
                </SelectItem>
                <SelectItem value={match.awayTeamId}>
                  {match.awayTeam.team.name}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Minuto</Label>
            <Input
              type="number"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              placeholder="Ej: 45"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Jugador</Label>
            <Select
              value={selectedPlayerId}
              onValueChange={setSelectedPlayerId}
              disabled={isFetchingPlayers}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isFetchingPlayers ? "Cargando..." : "Selecciona jugador"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {currentPlayers.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.number ? `#${player.number} ` : ""}
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={cardType}
              onValueChange={(v) => setCardType(v as CardType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CardType.YELLOW}>Amarilla</SelectItem>
                <SelectItem value={CardType.RED}>Roja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Motivo (Opcional)</Label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: Mano intencional"
          />
        </div>

        <Button
          className="w-full"
          onClick={handleAddCard}
          disabled={isLoading || !selectedPlayerId}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <ShieldAlert className="w-4 h-4 mr-2" />
          )}
          Registrar Tarjeta
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Historial de Sanciones
        </h4>
        {sortedCards.length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center py-4">
            Sin tarjetas registradas
          </p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {sortedCards.map((card: any) => {
              const p = card.teamPlayer?.player?.name || "Desconocido";
              const isRed = card.type === "RED";

              return (
                <div
                  key={card.id}
                  className="flex items-center justify-between p-2 rounded border bg-card text-card-foreground text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-10 justify-center">
                      {card.minute}'
                    </Badge>
                    <div
                      className={`w-4 h-6 rounded-sm ${isRed ? "bg-red-500" : "bg-yellow-400"} border border-black/10 shadow-sm`}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{p}</span>
                      {card.reason && (
                        <span className="text-xs text-muted-foreground">
                          {card.reason}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteCard(card.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
