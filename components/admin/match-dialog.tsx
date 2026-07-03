"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";

const matchSchema = z.object({
  tournamentId: z.string().min(1, "Selecciona un torneo"),
  homeTeamId: z.string().min(1, "Selecciona el equipo local"),
  awayTeamId: z.string().min(1, "Selecciona el equipo visitante"),
  dateTime: z.date(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato HH:MM inválido"),
  status: z.enum(["PROGRAMADO", "EN_JUEGO", "FINALIZADO", "SUSPENDIDO", "POSTERGADO", "CANCELADO", "WALKOVER"]),
  stadium: z.string().optional(),
  city: z.string().optional(),
  description: z.string().optional(),
});

type MatchFormValues = z.infer<typeof matchSchema>;

interface MatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchToEdit?: any; // Replace with proper type if available
  onSuccess: () => void;
}

export function MatchDialog({ open, onOpenChange, matchToEdit, onSuccess }: MatchDialogProps) {
  const [loading, setLoading] = useState(false);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      status: "PROGRAMADO",
      time: "20:00",
    },
  });

  useEffect(() => {
    if (open) {
      fetchAuxData();
    }
  }, [open]);

  useEffect(() => {
    if (matchToEdit) {
      const matchDate = new Date(matchToEdit.dateTime);
      form.reset({
        tournamentId: matchToEdit.tournamentId,
        homeTeamId: matchToEdit.homeTeamId,
        awayTeamId: matchToEdit.awayTeamId,
        dateTime: matchDate,
        time: format(matchDate, "HH:mm"),
        status: matchToEdit.status,
        stadium: matchToEdit.stadium || "",
        city: matchToEdit.city || "",
        description: matchToEdit.description || "",
      });
    } else {
      form.reset({
        status: "PROGRAMADO",
        time: "20:00",
      });
    }
  }, [matchToEdit, form]);

  const fetchAuxData = async () => {
    try {
      const [tournamentsRes, teamsRes] = await Promise.all([
        fetch("/api/tournaments"),
        fetch("/api/teams")
      ]);
      
      if (tournamentsRes.ok) setTournaments(await tournamentsRes.json());
      if (teamsRes.ok) setTeams(await teamsRes.json());
    } catch (error) {
      console.error("Error loading data", error);
      toast.error("Error", {
        description: "No se pudieron cargar torneos o equipos",
      });
    }
  };

  const onSubmit = async (data: MatchFormValues) => {
    setLoading(true);
    try {
      // Combine date and time
      const [hours, minutes] = data.time.split(":");
      const dateTime = new Date(data.dateTime);
      dateTime.setHours(parseInt(hours), parseInt(minutes));

      const payload = {
        ...data,
        dateTime: dateTime.toISOString(),
      };

      const url = matchToEdit ? `/api/matches/${matchToEdit.id}` : "/api/matches";
      const method = matchToEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al guardar el partido");
      }

      toast.success("Éxito", {
        description: `Partido ${matchToEdit ? "actualizado" : "creado"} correctamente`,
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>{matchToEdit ? "Editar Partido" : "Nuevo Partido"}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            {matchToEdit ? "Modifica los detalles del encuentro." : "Programa un nuevo encuentro entre dos equipos."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="tournamentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Torneo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-900 border-zinc-700">
                        <SelectValue placeholder="Seleccionar torneo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      {tournaments.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="homeTeamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipo Local</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-900 border-zinc-700">
                          <SelectValue placeholder="Seleccionar local" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        {teams.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="awayTeamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipo Visitante</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-900 border-zinc-700">
                          <SelectValue placeholder="Seleccionar visitante" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        {teams.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-zinc-900 border-zinc-700",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date: Date) => date < new Date("1900-01-01")}
                          initialFocus
                          className="bg-zinc-950 text-zinc-100"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" className="bg-zinc-900 border-zinc-700" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-900 border-zinc-700">
                        <SelectValue placeholder="Estado del partido" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="PROGRAMADO">Programado</SelectItem>
                      <SelectItem value="EN_JUEGO">En Juego</SelectItem>
                      <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                      <SelectItem value="SUSPENDIDO">Suspendido</SelectItem>
                      <SelectItem value="POSTERGADO">Postergado</SelectItem>
                      <SelectItem value="CANCELADO">Cancelado</SelectItem>
                      <SelectItem value="WALKOVER">Walkover</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stadium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estadio (Opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-zinc-900 border-zinc-700" placeholder="Ej. Camp Nou" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad (Opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-zinc-900 border-zinc-700" placeholder="Ej. Barcelona" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
             <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción / Notas (Opcional)</FormLabel>
                    <FormControl>
                       <Textarea {...field} className="bg-zinc-900 border-zinc-700 resize-none" placeholder="Información adicional..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <DialogFooter>
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guadar Partido
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
