"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Palette,
  User,
  Trophy,
  Save,
  Edit,
  Plus,
  BookOpenText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import z from "zod";
import { useRouter } from "next/navigation";
import { useController, UseControllerProps, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTrigger } from "@radix-ui/react-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ITeam } from "@modules/equipos/types/types";

const teamSchema = z.object({
  name: z.string().min(3, "El nombre es obligatorio."),
  shortName: z.string().optional(),
  description: z.string().optional(),
  history: z.string().optional(),
  coach: z.string().optional(),
  homeCity: z.string().optional(),
  yearFounded: z.string().optional(),
  homeColor: z.string().optional(),
  awayColor: z.string().optional(),
  logoUrl: z.string().optional(),
});

type TeamFormValues = z.infer<typeof teamSchema>;

interface TeamFormProps {
  isEditMode: boolean;
  team?: ITeam;
}

const predefinedColors = [
  { name: "Rojo", value: "#DC2626", bg: "bg-red-600" },
  { name: "Azul", value: "#2563EB", bg: "bg-blue-600" },
  { name: "Verde", value: "#16A34A", bg: "bg-green-600" },
  { name: "Amarillo", value: "#CA8A04", bg: "bg-yellow-600" },
  { name: "Negro", value: "#000000", bg: "bg-black" },
  { name: "Blanco", value: "#FFFFFF", bg: "bg-white border" },
  { name: "Naranja", value: "#EA580C", bg: "bg-orange-600" },
  { name: "Morado", value: "#9333EA", bg: "bg-purple-600" },
];

// Componente ColorPicker adaptado para `react-hook-form`
const FormColorPicker = ({
  name,
  control,
  label,
}: UseControllerProps<TeamFormValues> & { label: string }) => {
  const { field } = useController({ name, control });

  return (
    <FormItem className="space-y-3">
      <div className="flex items-center space-x-2">
        <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </FormLabel>
      </div>
      <div className="flex flex-wrap gap-2">
        {predefinedColors.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => field.onChange(color.value)}
            className={`w-8 h-8 rounded-full ${color.bg} border-2 ${
              field.value === color.value
                ? "border-[#ad45ff] ring-2 ring-[#ad45ff]/20"
                : "border-gray-300 dark:border-gray-600"
            } hover:scale-110 transition-transform`}
            title={color.name}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <FormControl>
          <Input
            type="color"
            value={field.value || ""}
            onChange={(e) => field.onChange(e.target.value)}
            className="w-12 h-10 p-1 border-2 border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer"
          />
        </FormControl>
        <FormControl>
          <Input
            type="text"
            value={field.value || ""}
            onChange={(e) => field.onChange(e.target.value)}
            placeholder=""
            className="flex-1 font-mono text-sm h-10 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] text-gray-900 dark:text-white rounded-xl"
          />
        </FormControl>
      </div>
      <FormMessage />
    </FormItem>
  );
};

export default function TeamForm(props: Readonly<TeamFormProps>) {
  const { isEditMode, team } = props;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: isEditMode ? team?.name || "" : "",
      shortName: isEditMode ? team?.shortName || "" : "",
      description: isEditMode ? team?.description || "" : "",
      history: isEditMode ? team?.history || "" : "",
      coach: isEditMode ? team?.coach || "" : "",
      homeCity: isEditMode ? team?.homeCity || "" : "",
      yearFounded: isEditMode ? team?.yearFounded || "" : "",
      homeColor: isEditMode ? team?.homeColor || "#FFFFFF" : "#FFFFFF",
      awayColor: isEditMode ? team?.awayColor || "#000000" : "#000000",
      logoUrl: isEditMode ? team?.logoUrl || "" : "",
    },
  });

  const onSubmit = async (data: TeamFormValues) => {
    try {
      setIsLoading(true);
      const payload = { ...data };

      const method = isEditMode ? "PATCH" : "POST";
      const url = isEditMode ? `/api/teams/${team?.id}` : `/api/teams`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        form.reset();
        toast.success(
          isEditMode
            ? "Equipo editado correctamente"
            : "Equipo creado correctamente",
        );
        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(
          isEditMode ? "Error al editar el equipo" : "Error al crear el equipo",
        );
        console.error("Error al crear equipo:", errorData);
      }
    } catch (err) {
      toast.error(
        isEditMode
          ? "Error al editar el equipo: " + err
          : "Error al crear el equipo: " + err,
      );
      console.error("Error en la petición:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const logoUrl = form.watch("logoUrl");
  const homeColor = form.watch("homeColor");
  const awayColor = form.watch("awayColor");

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
            Registrar Equipo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
        {/* Header con gradiente */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#ad45ff] via-[#a3b3ff] to-[#ad45ff] rounded-t-2xl" />

        <DialogHeader className="space-y-4 pt-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center shadow-lg">
              {isEditMode ? (
                <Edit className="h-6 w-6 text-white" />
              ) : (
                <Trophy className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? "Editar Equipo" : "Registrar Nuevo Equipo"}
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300 text-base">
                {isEditMode
                  ? "Modifica la información del equipo"
                  : "Completa toda la información del equipo"}
              </DialogDescription>
            </div>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-600 to-transparent" />
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            {/* Información Básica */}
            <Card className="bg-gray-50/50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-lg flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                {/* Campo: nombre del equipo */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Nombre del Equipo
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Ej: Club Atletico Federal"
                          {...field}
                          disabled={isLoading}
                          className="h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl transition-all duration-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campo: nombre corto del equipo */}
                <FormField
                  control={form.control}
                  name="shortName"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Nombre Corto
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Ej: C.A.F."
                          {...field}
                          disabled={isLoading}
                          className="h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl transition-all duration-200"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Campo: Descripción */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-3 md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Descripción
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción del equipo..."
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
              </CardContent>
            </Card>

            {/* Información Adicional */}
            <Card className="bg-gray-50/50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  Información Adicional
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-3">
                {/* Campo: nombre del entrenador */}
                <FormField
                  control={form.control}
                  name="coach"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Entrenador (DT)
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Ej: Raul Perez"
                          {...field}
                          disabled={isLoading}
                          className="h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl transition-all duration-200"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Campo: Ciudad Base */}
                <FormField
                  control={form.control}
                  name="homeCity"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Ciudad
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Ciudad de local"
                          {...field}
                          disabled={isLoading}
                          className="h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl transition-all duration-200"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Campo: Año de fundación */}
                <FormField
                  control={form.control}
                  name="yearFounded"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Año Fundación
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="1905"
                          {...field}
                          disabled={isLoading}
                          className="h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl transition-all duration-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Historia del Equipo */}
            <Card className="bg-gray-50/50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <BookOpenText className="h-4 w-4 text-white" />
                  </div>
                  Historia del Equipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="history"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Historia y logros
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Cuenta la historia y logros más importantes del equipo..."
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
              </CardContent>
            </Card>

            {/* Colores y Logo */}
            <Card className="bg-gray-50/50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Palette className="h-4 w-4 text-white" />
                  </div>
                  Identidad Visual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormColorPicker
                    name="homeColor"
                    control={form.control}
                    label="Color Principal"
                  />
                  <FormColorPicker
                    name="awayColor"
                    control={form.control}
                    label="Color Secundario"
                  />
                </div>

                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          URL del Escudo
                        </FormLabel>
                      </div>
                      <FormControl>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Upload className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="https://ejemplo.com/escudo.png"
                              className="pl-10 h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] text-gray-900 dark:text-white rounded-xl"
                              {...field}
                              disabled={isLoading}
                            />
                          </div>
                          {logoUrl && (
                            <div className="w-12 h-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <img
                                src={logoUrl || "/placeholder.svg"}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Vista previa:
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-lg border-2 border-white shadow-lg"
                      style={{ backgroundColor: homeColor }}
                      title="Color Principal"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Principal
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-lg"
                      style={{ backgroundColor: awayColor }}
                      title="Color Secundario"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Secundario
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl font-medium transition-all duration-200"
                onClick={() => {
                  setIsDialogOpen(false);
                  form.reset();
                }}
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
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
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
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Registrar Equipo
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
}
