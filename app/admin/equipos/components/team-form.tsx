"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Palette,
  User,
  Trophy,
  Save,
  X,
  Edit,
  Plus,
  BookOpenText,
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
import { ITeam } from "@/components/equipos/types";

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
  tournamentId: z.string().optional(),
});

type TeamFormValues = z.infer<typeof teamSchema>;

interface TeamFormProps {
  isEditMode: boolean;
  team?: ITeam;
}

const tournaments = [
  {
    id: "eb2f01c7-a03b-423f-8e0d-544df5b5fc6e",
    name: "Liga Profesional 2024",
  },
  { id: "2", name: "Copa Nacional" },
  { id: "3", name: "Torneo Clausura" },
  { id: "4", name: "Liga Juvenil" },
];

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
    <FormItem>
      <FormLabel className="text-sm font-medium">{label}</FormLabel>
      <div className="flex flex-wrap gap-2">
        {predefinedColors.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => field.onChange(color.value)}
            className={`w-8 h-8 rounded-full ${color.bg} border-2 ${
              field.value === color.value
                ? "border-primary ring-2 ring-primary/20"
                : "border-gray-300"
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
            className="w-12 h-8 p-0 border-0 rounded cursor-pointer"
          />
        </FormControl>
        <FormControl>
          <Input
            type="text"
            value={field.value || ""}
            onChange={(e) => field.onChange(e.target.value)}
            placeholder=""
            className="flex-1 font-mono text-sm"
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
      tournamentId: isEditMode ? team?.tournamentId || "" : "",
    },
  });

  const onSubmit = async (data: TeamFormValues) => {
    try {
      // Si startDate o endDate son objetos Date, quizás debas formatearlos a ISO string para la API
      const payload = {
        ...data,
      };

      const method = isEditMode ? "PATCH" : "POST";
      const url = isEditMode ? `/api/teams/${team?.id}` : `/api/teams`;

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
            ? "Equipo editado correctamente"
            : "Equipo creado correctamente"
        );
        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(
          isEditMode ? "Error al editar el equipo" : "Error al crear el equipo"
        );
        console.error("Error al crear equipo:", errorData);
      }
    } catch (err) {
      toast.error(
        isEditMode
          ? "Error al editar el torneo: " + err
          : "Error al crear el torneo: " + err
      );
      console.error("Error en la petición:", err);
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
            Registrar Equipo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {isEditMode ? "Editar Equipo" : "Registrar Nuevo Equipo"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Modifica la información del equipo"
              : "Completa toda la información del equipo para registrarlo en el sistema"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información Básica */}
            <Card className="bg-transparent">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  {/* Campo: nombre del equipo */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Equipo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Club Atletico Federal"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  {/* Campo: nombre corto del equipo */}
                  <FormField
                    control={form.control}
                    name="shortName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Corto del Equipo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: C.A.F." {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  {/* Campo: Descripción */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descripción del equipo..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Información Adicional */}
            <Card className="bg-transparent">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Información Adicional
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  {/* Campo: nombre del entrenador */}
                  <FormField
                    control={form.control}
                    name="coach"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del entrenador</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Raul Perez" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  {/* Campo: nombre del entrenador */}
                  <FormField
                    control={form.control}
                    name="homeCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad Base</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ciudad donde juega de local"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  {/* Campo: Año de fundación */}
                  <FormField
                    control={form.control}
                    name="yearFounded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Año de Fundación</FormLabel>
                        <FormControl>
                          <Input placeholder="1905" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/**/}
                <div className="space-y-2">
                  {/* Campo: Formato del Torneo (Select) */}
                  <FormField
                    control={form.control}
                    name="tournamentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Torneo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un formato" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tournaments.map((format) => (
                              <SelectItem key={format.id} value={format.id}>
                                {format.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Historia del Equipo */}
            <Card className="bg-transparent">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpenText className="h-4 w-4" />
                  Historia del Equipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Campo: Historia */}
                  <FormField
                    control={form.control}
                    name="history"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Historia y logros</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Cuenta la historia y logros más importantes del equipo..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Colores y Logo */}
            <Card className="bg-transparent">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Identidad Visual del Equipo
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
                    <FormItem className="space-y-2">
                      <FormLabel htmlFor="logoUrl">URL del Escudo</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="logoUrl"
                              placeholder="https://ejemplo.com/escudo.png"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                          {logoUrl && (
                            <div className="w-12 h-12 border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
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

                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Vista previa:</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border-2 border-white shadow-sm"
                      style={{
                        backgroundColor: homeColor,
                      }}
                      title="Color Principal"
                    />
                    <span className="text-xs text-muted-foreground">
                      Principal
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border-2 border-gray-300 shadow-sm"
                      style={{
                        backgroundColor: awayColor,
                      }}
                      title="Color Secundario"
                    />
                    <span className="text-xs text-muted-foreground">
                      Secundario
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botones de Acción */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="default"
                onClick={() => {
                  setIsDialogOpen(false);
                  form.reset(); // Resetear el formulario al cancelar
                }}
                className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              {isEditMode ? (
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-white
                  hover:from-yellow-500 hover:to-yellow-600 hover:scale-105 transition-all duration-300
                  active:scale-95 cursor-pointer"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-blue-600 text-white
                  hover:from-primary/80 hover:to-blue-700 hover:scale-105 transition-all duration-300
                  active:scale-95 cursor-pointer"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Registrar Equipo
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
