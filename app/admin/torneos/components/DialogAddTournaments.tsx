"use client";

import { useState } from "react";
import { z } from "zod";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { TOURNAMENT_CATEGORIES, TOURNAMENT_FORMATS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, // Importar el componente Form de Shadcn
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
import { Textarea } from "@/components/ui/textarea";
import { Edit, Plus } from "lucide-react";
import { ITorneo } from "@/components/torneos/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Esquema Zod mejorado
const tournamentSchema = z
  .object({
    name: z.string().min(3, "El nombre es obligatorio"),
    description: z.string().optional(),
    category: z.string({
      error: "La categoría es obligatoria",
    }),
    locality: z.string().min(3, "La localidad es obligatoria"),
    startDate: z.date({
      error: "Fecha de inicio inválida",
    }),
    endDate: z
      .date({
        error: "Fecha de fin inválida",
      })
      .optional(),
    logoUrl: z.string().optional(),
    liga: z.string().optional(),
    format: z.string({
      error: "El formato es obligatoria",
    }),
    homeAndAway: z.boolean({
      error: "Debes indicar si es ida y vuelta",
    }),
    nextMatch: z
      .date({
        error: "Fecha del próximo partido inválida",
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate) {
        // Asegurarse de que endDate no sea anterior a startDate
        // Usamos getTime() para comparar objetos Date
        return data.endDate.getTime() >= data.startDate.getTime();
      }
      return true; // Si endDate es opcional y no está, o startDate no está, no hay error aquí.
    },
    {
      message: "La fecha de fin no puede ser anterior a la fecha de inicio.",
      path: ["endDate"], // El error se asignará al campo 'endDate'
    }
  );

type TournamentFormValues = z.infer<typeof tournamentSchema>;

interface PropsDialogAddTournaments {
  tournament?: ITorneo;
}

const DialogAddTournaments = (props: PropsDialogAddTournaments) => {
  const { tournament } = props;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const isEditMode = !!tournament;

  // Inicializar useForm con zodResolver y defaultValues
  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      name: isEditMode && tournament?.name ? tournament.name : "",
      description: isEditMode ? tournament?.description || "" : "",
      category: isEditMode
        ? tournament?.category || TOURNAMENT_CATEGORIES[0].value
        : TOURNAMENT_CATEGORIES[0].value, // Valor por defecto
      locality: isEditMode ? tournament?.locality || "" : "",
      startDate: isEditMode
        ? tournament?.startDate
          ? new Date(tournament.startDate)
          : undefined
        : undefined,
      endDate: isEditMode
        ? tournament?.endDate
          ? new Date(tournament.endDate)
          : undefined // Si no hay fecha, dejarlo como undefined
        : undefined,
      logoUrl: isEditMode ? tournament?.logoUrl || "" : "", // Si no hay logo, dejarlo vacío
      liga: isEditMode ? tournament?.liga || "" : "", // Si no hay liga, dejarlo vacío
      // Valores por defecto para los campos nuevos
      format: isEditMode
        ? tournament?.format || TOURNAMENT_FORMATS[0].value
        : TOURNAMENT_FORMATS[0].value, // Valor por defecto
      homeAndAway: isEditMode
        ? tournament?.homeAndAway || false // Si no hay valor, por defecto es false
        : false, // Por defecto es false
      nextMatch: isEditMode
        ? tournament?.nextMatch
          ? new Date(tournament.nextMatch)
          : undefined // Si no hay próximo partido, dejarlo como undefined
        : undefined, // Por defecto es undefined
    },
  });

  const onSubmit = async (data: TournamentFormValues) => {
    try {
      setIsLoading(true);
      // Si startDate o endDate son objetos Date, quizás debas formatearlos a ISO string para la API
      const payload = {
        ...data,
        startDate: data.startDate
          ? data.startDate.toISOString().split("T")[0]
          : undefined, // Formato YYYY-MM-DD
        endDate: data.endDate
          ? data.endDate.toISOString().split("T")[0]
          : undefined, // Formato YYYY-MM-DD
        nextMatch: data.nextMatch ? data.nextMatch.toISOString() : undefined, // Formato ISO completo
      };

      const method = isEditMode ? "PATCH" : "POST";
      const url = isEditMode
        ? `/api/tournaments/${tournament?.id}`
        : `/api/tournaments`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        form.reset(); // Limpia el formulario después de un envío exitoso
        toast.success(
          isEditMode
            ? "Torneo editado correctamente"
            : "Torneo creado correctamente"
        );
        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(
          isEditMode ? "Error al editar el torneo" : "Error al crear el torneo"
        );
        console.error("Error al crear torneo:", errorData);
      }
    } catch (err) {
      toast.error(
        isEditMode
          ? "Error al editar el torneo: " + err
          : "Error al crear el torneo: " + err
      );
      console.error("Error en la petición:", err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {isEditMode ? (
          <Button
            variant="secondary"
            size="sm"
            asChild
            className="bg-green-700 hover:bg-green-900 text-white cursor-pointer"
          >
            <div>
              <Edit className="h-4 w-4" />
            </div>
          </Button>
        ) : (
          <Button
            className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-6 text-white
        hover:from-primary/80 hover:to-blue-700 hover:scale-105 transition-all duration-300
         cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear Torneo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Torneo" : "Crear Nuevo Torneo"}
          </DialogTitle>
          <DialogDescription>
            Completa la información básica del torneo
          </DialogDescription>
        </DialogHeader>

        {/* Formulario con react-hook-form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            {/* Campo: Nombre del Torneo */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Torneo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Copa de Verano 2024"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Localidad */}
            <FormField
              control={form.control}
              name="locality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localidad</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Buenos Aires"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Categoría (Select) */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TOURNAMENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campos de Fecha (Inicio y Fin) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Inicio</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        // `field.value` para un input type="date" debe ser un string YYYY-MM-DD
                        // Si Zod transforma a Date, necesitas transformar de vuelta para el input.
                        value={
                          field.value
                            ? field.value.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Fin</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        // `field.value` para un input type="date" debe ser un string YYYY-MM-DD
                        value={
                          field.value
                            ? field.value.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Campo: Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del torneo..."
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Formato del Torneo (Select) */}
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Formato</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un formato" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TOURNAMENT_FORMATS.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: ida y vuelta */}
            <FormField
              control={form.control}
              name="homeAndAway"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormLabel className="mb-0">¿Ida y vuelta?</FormLabel>
                  <FormControl>
                    <input
                      type="checkbox"
                      className="scale-125"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Liga o Asociación */}
            <FormField
              control={form.control}
              name="liga"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liga o Asociación (Organizador)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: AFA, Liga Cordobesa..."
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: URL del Logo */}
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL del Logo</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://logo.com/escudo.png"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Próximo partido (opcional) */}
            <FormField
              control={form.control}
              name="nextMatch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Próximo partido (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={
                        field.value
                          ? new Date(field.value).toISOString().slice(0, 16)
                          : ""
                      }
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="default"
                className="bg-red-500 hover:bg-red-600 hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => {
                  setIsDialogOpen(false);
                  form.reset(); // Resetear el formulario al cancelar
                }}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              {isEditMode ? (
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-white
                  hover:from-yellow-500 hover:to-yellow-600 hover:scale-105 transition-all duration-300
                  active:scale-95 cursor-pointer"
                  disabled={isLoading}
                >
                  Guardar Cambios
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-blue-600 text-white
                  hover:from-primary/80 hover:to-blue-700 hover:scale-105 transition-all duration-300
                  active:scale-95 cursor-pointer"
                  disabled={isLoading}
                >
                  Registrar Torneo
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogAddTournaments;
