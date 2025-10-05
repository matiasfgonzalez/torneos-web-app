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
import { Edit, Plus, Loader2 } from "lucide-react";
import { ITorneo } from "@/components/torneos/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Esquema Zod mejorado con validaciones robustas
const tournamentSchema = z
  .object({
    name: z
      .string()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(100, "El nombre no puede superar los 100 caracteres"),
    description: z
      .string()
      .max(500, "La descripción no puede superar los 500 caracteres")
      .optional(),
    category: z.string().min(1, "La categoría es obligatoria"),
    locality: z
      .string()
      .min(3, "La localidad debe tener al menos 3 caracteres")
      .max(50, "La localidad no puede superar los 50 caracteres"),
    startDate: z.date(),
    endDate: z.date().optional(),
    logoUrl: z
      .string()
      .refine((val) => {
        if (!val || val === "") return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      }, "Debe ser una URL válida")
      .optional(),
    liga: z
      .string()
      .max(100, "La liga no puede superar los 100 caracteres")
      .optional(),
    format: z.string().min(1, "El formato es obligatorio"),
    homeAndAway: z.boolean(),
    nextMatch: z.date().optional(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate) {
        return data.endDate.getTime() >= data.startDate.getTime();
      }
      return true;
    },
    {
      message: "La fecha de fin no puede ser anterior a la fecha de inicio.",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      if (data.nextMatch && data.startDate) {
        return data.nextMatch.getTime() >= data.startDate.getTime();
      }
      return true;
    },
    {
      message: "El próximo partido debe ser posterior a la fecha de inicio.",
      path: ["nextMatch"],
    }
  );

type TournamentFormValues = z.infer<typeof tournamentSchema>;

interface PropsDialogAddTournaments {
  tournament?: ITorneo;
}

// Función helper para formatear fechas
const formatDateForAPI = (date: Date | undefined): string | undefined => {
  return date ? date.toISOString().split("T")[0] : undefined;
};

// Hook personalizado para manejar el submit
const useSubmitTournament = (isEditMode: boolean, tournament?: ITorneo) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const submitTournament = async (data: TournamentFormValues) => {
    try {
      setIsLoading(true);

      const payload = {
        ...data,
        startDate: formatDateForAPI(data.startDate),
        endDate: formatDateForAPI(data.endDate),
        nextMatch: data.nextMatch ? data.nextMatch.toISOString() : undefined,
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
        toast.success(
          isEditMode
            ? "Torneo editado correctamente"
            : "Torneo creado correctamente"
        );
        router.refresh();
        return true;
      } else {
        const errorData = await res.json();
        toast.error(
          errorData.message ||
            (isEditMode
              ? "Error al editar el torneo"
              : "Error al crear el torneo")
        );
        console.error("Error al procesar torneo:", errorData);
        return false;
      }
    } catch (err) {
      const errorMessage = isEditMode
        ? "Error al editar el torneo"
        : "Error al crear el torneo";
      toast.error(`${errorMessage}: ${err}`);
      console.error("Error en la petición:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { submitTournament, isLoading };
};

const DialogAddTournaments = (props: PropsDialogAddTournaments) => {
  const { tournament } = props;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isEditMode = !!tournament;

  const { submitTournament, isLoading } = useSubmitTournament(
    isEditMode,
    tournament
  );

  // Inicializar useForm con zodResolver y defaultValues
  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      name: isEditMode && tournament?.name ? tournament.name : "",
      description: isEditMode ? tournament?.description || "" : "",
      category: isEditMode
        ? tournament?.category || TOURNAMENT_CATEGORIES[0].value
        : TOURNAMENT_CATEGORIES[0].value,
      locality: isEditMode ? tournament?.locality || "" : "",
      startDate:
        isEditMode && tournament?.startDate
          ? new Date(tournament.startDate)
          : undefined,
      endDate:
        isEditMode && tournament?.endDate
          ? new Date(tournament.endDate)
          : undefined,
      logoUrl: isEditMode ? tournament?.logoUrl || "" : "",
      liga: isEditMode ? tournament?.liga || "" : "",
      format: isEditMode
        ? tournament?.format || TOURNAMENT_FORMATS[0].value
        : TOURNAMENT_FORMATS[0].value,
      homeAndAway: isEditMode ? tournament?.homeAndAway || false : false,
      nextMatch:
        isEditMode && tournament?.nextMatch
          ? new Date(tournament.nextMatch)
          : undefined,
    },
  });

  const onSubmit = async (data: TournamentFormValues) => {
    const success = await submitTournament(data);
    if (success) {
      setIsDialogOpen(false);
      form.reset();
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    form.reset();
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
      <DialogContent className="sm:max-w-[750px] max-w-[95vw] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 text-black dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {isEditMode ? "Editar Torneo" : "Crear Nuevo Torneo"}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
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
                      className="border-2 border-gray-300 focus:border-blue-500 focus:ring-0 transition-all duration-300"
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
                      className="border-2 border-gray-300 focus:border-blue-500 focus:ring-0 transition-all duration-300"
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
                    <FormControl className="border-2 border-gray-300 focus:border-blue-500 focus:ring-0 transition-all duration-300">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="border-2 border-gray-300 focus:border-blue-500 focus:ring-0 transition-all duration-300"
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
                        className="border-2 border-gray-300 focus:border-blue-500 focus:ring-0 transition-all duration-300"
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
                      className="border-2 border-gray-300 focus:border-blue-500 focus:ring-0 transition-all duration-300"
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
                    <FormControl className="border-2 border-gray-300 focus:border-blue-500 focus:ring-0 transition-all duration-300">
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
                      className="border-2 border-gray-300 focus:border-blue-500 focus:ring-0 transition-all duration-300"
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
                      className="border-2 border-gray-300 focus:border-blue-500 focus:ring-0 transition-all duration-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.getValues("logoUrl") && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Vista previa:
                </p>
                <img
                  src={form.getValues("logoUrl") || "/placeholder.svg"}
                  alt="Vista previa del logo"
                  className="w-20 h-20 object-cover rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

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
                      className="border-2 border-gray-300 focus:border-blue-500 focus:ring-0 transition-all duration-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
              <Button
                type="button"
                variant="default"
                className="bg-red-500 hover:bg-red-600 hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={handleCancel}
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
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-blue-600 text-white
                  hover:from-primary/80 hover:to-blue-700 hover:scale-105 transition-all duration-300
                  active:scale-95 cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Registrar Torneo"
                  )}
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
