"use client";

import { useState } from "react";
import { z } from "zod";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  TOURNAMENT_CATEGORIES,
  TOURNAMENT_FORMATS,
  TOURNAMENT_STATUS_OPTIONS,
} from "@/lib/constants";
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
import { ITorneo } from "@modules/torneos/types";
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
    // Nuevos campos
    status: z.string().min(1, "El estado es obligatorio"),
    enabled: z.boolean(),
    rules: z
      .string()
      .max(2000, "El reglamento no puede superar los 2000 caracteres")
      .optional(),
    trophy: z
      .string()
      .max(500, "La descripción del premio no puede superar los 500 caracteres")
      .optional(),
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
    },
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
    },
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
            : "Torneo creado correctamente",
        );
        router.refresh();
        return true;
      } else {
        const errorData = await res.json();
        toast.error(
          errorData.message ||
            (isEditMode
              ? "Error al editar el torneo"
              : "Error al crear el torneo"),
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
    tournament,
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
      // Nuevos campos
      status: isEditMode
        ? tournament?.status || TOURNAMENT_STATUS_OPTIONS[0].value
        : TOURNAMENT_STATUS_OPTIONS[0].value,
      enabled: isEditMode ? (tournament?.enabled ?? true) : true,
      rules: isEditMode ? tournament?.rules || "" : "",
      trophy: isEditMode ? tournament?.trophy || "" : "",
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
            className="bg-green-600 hover:bg-green-700 text-white cursor-pointer rounded-xl shadow-lg"
          >
            <div>
              <Edit className="h-4 w-4" />
            </div>
          </Button>
        ) : (
          <Button className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] dark:from-[#8b39cc] dark:to-[#829bd9] hover:from-[#9c3ee6] hover:to-[#92a6ff] dark:hover:from-[#7a32b8] dark:hover:to-[#7189c5] text-white border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 rounded-2xl px-8 py-6 text-base font-semibold cursor-pointer">
            <Plus className="mr-2 h-5 w-5" />
            Crear Torneo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] max-w-[95vw] max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
        {/* Header con gradiente */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#ad45ff] via-[#a3b3ff] to-[#ad45ff] rounded-t-2xl" />

        <DialogHeader className="space-y-4 pt-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center shadow-lg">
              {isEditMode ? (
                <Edit className="h-6 w-6 text-white" />
              ) : (
                <Plus className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? "Editar Torneo" : "Crear Nuevo Torneo"}
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300 text-base">
                Completa la información básica del torneo
              </DialogDescription>
            </div>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-600 to-transparent" />
        </DialogHeader>

        {/* Formulario con react-hook-form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-6 py-6 px-1"
          >
            {/* Campo: Nombre del Torneo */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Nombre del Torneo
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="Ej: Copa de Verano 2024"
                      {...field}
                      disabled={isLoading}
                      className="h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl transition-all duration-200"
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
                <FormItem className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Localidad
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="Ej: Buenos Aires"
                      {...field}
                      disabled={isLoading}
                      className="h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl transition-all duration-200"
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
                <FormItem className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Categoría
                    </FormLabel>
                  </div>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] text-gray-900 dark:text-white rounded-xl">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
                  <FormItem className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Fecha de Inicio
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value
                            ? field.value.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                        disabled={isLoading}
                        className="h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl transition-all duration-200"
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
                  <FormItem className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Fecha de Fin
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value
                            ? field.value.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                        disabled={isLoading}
                        className="h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl transition-all duration-200"
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
                <FormItem className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Descripción
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del torneo..."
                      {...field}
                      disabled={isLoading}
                      rows={3}
                      className="bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl resize-none transition-all duration-200"
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
                <FormItem className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Formato
                    </FormLabel>
                  </div>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] text-gray-900 dark:text-white rounded-xl">
                        <SelectValue placeholder="Selecciona un formato" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
                <FormItem className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="homeAndAway"
                        className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-[#ad45ff] focus:ring-[#ad45ff] dark:focus:ring-[#a3b3ff]"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        disabled={isLoading}
                      />
                      <div>
                        <FormLabel
                          htmlFor="homeAndAway"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                        >
                          ¿Ida y vuelta?
                        </FormLabel>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {field.value
                            ? "Los equipos jugarán partidos de ida y vuelta"
                            : "Los equipos jugarán solo un partido"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Estado del Torneo (Select) */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Estado del Torneo
                    </FormLabel>
                  </div>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] text-gray-900 dark:text-white rounded-xl">
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      {TOURNAMENT_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Torneo Habilitado */}
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="enabled"
                        className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-[#ad45ff] focus:ring-[#ad45ff] dark:focus:ring-[#a3b3ff]"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        disabled={isLoading}
                      />
                      <div>
                        <FormLabel
                          htmlFor="enabled"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                        >
                          ¿Torneo habilitado?
                        </FormLabel>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {field.value
                            ? "El torneo es visible al público"
                            : "El torneo está oculto"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Liga o Asociación */}
            <FormField
              control={form.control}
              name="liga"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Liga o Asociación (Organizador)
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="Ej: AFA, Liga Cordobesa..."
                      {...field}
                      disabled={isLoading}
                      className="h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl transition-all duration-200"
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
                <FormItem className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      URL del Logo
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://logo.com/escudo.png"
                      {...field}
                      disabled={isLoading}
                      className="h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.getValues("logoUrl") && (
              <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600">
                <img
                  src={form.getValues("logoUrl") || "/placeholder.svg"}
                  alt="Vista previa del logo"
                  className="w-16 h-16 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Vista previa del logo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Asegúrate de que la imagen sea cuadrada para mejor
                    visualización
                  </p>
                </div>
              </div>
            )}

            {/* Campo: Próximo partido (opcional) */}
            <FormField
              control={form.control}
              name="nextMatch"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Próximo partido (opcional)
                    </FormLabel>
                  </div>
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
                      className="h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Reglamento */}
            <FormField
              control={form.control}
              name="rules"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Reglamento (opcional)
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Reglas especiales, configuraciones del torneo..."
                      {...field}
                      disabled={isLoading}
                      rows={4}
                      className="bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl resize-none transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Premio/Trofeo */}
            <FormField
              control={form.control}
              name="trophy"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Premio / Trofeo (opcional)
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del premio para el ganador..."
                      {...field}
                      disabled={isLoading}
                      rows={2}
                      className="bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl resize-none transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl font-medium transition-all duration-200"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              {isEditMode ? (
                <Button
                  type="submit"
                  className="px-8 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-0 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all duration-200"
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
                  className="px-8 py-2.5 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] dark:from-[#8b39cc] dark:to-[#829bd9] hover:from-[#9c3ee6] hover:to-[#92a6ff] dark:hover:from-[#7a32b8] dark:hover:to-[#7189c5] text-white border-0 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Registrar Torneo
                    </>
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
