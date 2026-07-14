"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  BookOpenText,
  CalendarDays,
  Edit,
  FileText,
  ImageIcon,
  MapPin,
  Palette,
  Plus,
  Shield,
  User,
} from "lucide-react";

import { z } from "@/lib/zod-locale";
import { Button } from "@/components/ui/button";
import { FormSheet } from "@/components/shared/form/FormSheet";
import {
  ColorField,
  FieldRow,
  FormSection,
  ImageField,
  NumberField,
  TextField,
  TextareaField,
} from "@/components/shared/form/fields";
import type { ITeam } from "@modules/equipos/types/types";

/**
 * Alta y edición de equipo (F3).
 *
 * Bug que destapó la validación inline: `teamCreateSchema` exige `yearFounded`
 * (no está en su `.partial()`), pero el formulario lo mandaba como string
 * opcional. Crear un equipo sin año → `z.coerce.number("")` = 0 → el server
 * respondía 400 "Datos inválidos" y la UI solo mostraba "Error al crear el
 * equipo", sin decir qué campo faltaba. Ahora el año es obligatorio en el
 * formulario, con su mensaje.
 */

const currentYear = new Date().getFullYear();

const teamFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(120, "El nombre no puede superar los 120 caracteres"),
  shortName: z.string().max(30, "Máximo 30 caracteres"),
  yearFounded: z
    .number("El año de fundación es obligatorio")
    .int()
    .min(1900, "El año no puede ser anterior a 1900")
    .max(currentYear, `El año no puede ser posterior a ${currentYear}`),
  coach: z.string().max(120, "Máximo 120 caracteres"),
  homeCity: z.string().max(120, "Máximo 120 caracteres"),
  description: z.string().max(1000, "Máximo 1000 caracteres"),
  history: z.string().max(5000, "Máximo 5000 caracteres"),
  homeColor: z.string().max(30),
  awayColor: z.string().max(30),
  logoUrl: z.string().nullish(),
  logoPublicId: z.string().nullish(),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

const emptyValues = (): TeamFormValues => ({
  name: "",
  shortName: "",
  yearFounded: undefined as unknown as number, // el campo arranca vacío, no en 0
  coach: "",
  homeCity: "",
  description: "",
  history: "",
  homeColor: "#FFFFFF",
  awayColor: "#000000",
  logoUrl: null,
  logoPublicId: null,
});

const valuesFromTeam = (team: ITeam): TeamFormValues => ({
  name: team.name ?? "",
  shortName: team.shortName ?? "",
  yearFounded: team.yearFounded ?? (undefined as unknown as number),
  coach: team.coach ?? "",
  homeCity: team.homeCity ?? "",
  description: team.description ?? "",
  history: team.history ?? "",
  homeColor: team.homeColor ?? "#FFFFFF",
  awayColor: team.awayColor ?? "#000000",
  logoUrl: team.logoUrl ?? null,
  logoPublicId: team.logoPublicId ?? null,
});

interface TeamFormProps {
  isEditMode: boolean;
  team?: ITeam;
}

export default function TeamForm({
  isEditMode,
  team,
}: Readonly<TeamFormProps>) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: isEditMode && team ? valuesFromTeam(team) : emptyValues(),
  });

  // `useWatch` y no `form.watch()`: el segundo devuelve una función que el
  // React Compiler no puede memoizar (`react-hooks/incompatible-library`) y
  // además re-renderiza el formulario entero en cada tecla de cualquier campo.
  const [homeColor, awayColor] = useWatch({
    control: form.control,
    name: ["homeColor", "awayColor"],
  });

  const onSubmit = async (data: TeamFormValues) => {
    try {
      const res = await fetch(
        isEditMode ? `/api/teams/${team?.id}` : "/api/teams",
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        toast.error(
          error?.error ??
            (isEditMode
              ? "No se pudo guardar el equipo"
              : "No se pudo crear el equipo"),
        );
        return;
      }

      toast.success(isEditMode ? "Equipo guardado" : "Equipo creado");
      setOpen(false);
      form.reset(isEditMode ? data : emptyValues());
      router.refresh();
    } catch {
      toast.error("No se pudo conectar con el servidor. Revisá tu conexión.");
    }
  };

  return (
    <FormSheet
      form={form}
      onSubmit={onSubmit}
      open={open}
      onOpenChange={setOpen}
      icon={isEditMode ? Edit : Shield}
      title={isEditMode ? "Editar equipo" : "Registrar equipo"}
      description={isEditMode ? team?.name : "Nombre y año de fundación son obligatorios"}
      submitLabel={isEditMode ? "Guardar cambios" : "Registrar equipo"}
      submitIcon={isEditMode ? undefined : Plus}
      trigger={
        isEditMode ? (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg border-brand/50 text-brand hover:border-brand hover:bg-brand/10"
            aria-label={`Editar ${team?.name ?? "equipo"}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="brand" className="h-12 px-6 text-base font-semibold">
            <Plus className="h-5 w-5" />
            Registrar equipo
          </Button>
        )
      }
    >
      <FormSection icon={Shield} title="Identidad">
        <FieldRow>
          <TextField
            control={form.control}
            name="name"
            label="Nombre del equipo"
            icon={Shield}
            required
            placeholder="Ej: Club Atlético Federal"
          />
          <TextField
            control={form.control}
            name="shortName"
            label="Nombre corto"
            placeholder="Ej: CAF"
            description="El que se muestra en la tabla de posiciones."
          />
        </FieldRow>
        <FieldRow cols={3}>
          <NumberField
            control={form.control}
            name="yearFounded"
            label="Año de fundación"
            icon={CalendarDays}
            required
            min={1900}
            max={currentYear}
            placeholder="1905"
          />
          <TextField
            control={form.control}
            name="coach"
            label="Entrenador"
            icon={User}
            placeholder="Ej: Raúl Pérez"
          />
          <TextField
            control={form.control}
            name="homeCity"
            label="Ciudad"
            icon={MapPin}
            placeholder="Ciudad de local"
          />
        </FieldRow>
        <TextareaField
          control={form.control}
          name="description"
          label="Descripción"
          icon={FileText}
          rows={3}
          placeholder="Quiénes son, en qué categorías juegan…"
        />
      </FormSection>

      <FormSection icon={Palette} title="Identidad visual">
        <ImageField
          control={form.control}
          name="logoUrl"
          publicIdName="logoPublicId"
          label="Escudo"
          icon={ImageIcon}
          folder="equipos/logos"
          placeholder="Arrastrá el escudo o hacé clic para elegirlo"
        />
        <FieldRow>
          <ColorField
            control={form.control}
            name="homeColor"
            label="Color principal"
            icon={Palette}
          />
          <ColorField
            control={form.control}
            name="awayColor"
            label="Color alternativo"
            icon={Palette}
          />
        </FieldRow>
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Vista previa
          </span>
          <div className="flex items-center gap-3">
            <span
              className="h-10 w-10 rounded-lg border border-gray-300 shadow-sm dark:border-gray-600"
              style={{ backgroundColor: homeColor || "#FFFFFF" }}
              aria-hidden="true"
            />
            <span
              className="h-10 w-10 rounded-lg border border-gray-300 shadow-sm dark:border-gray-600"
              style={{ backgroundColor: awayColor || "#000000" }}
              aria-hidden="true"
            />
          </div>
        </div>
      </FormSection>

      <FormSection icon={BookOpenText} title="Historia">
        <TextareaField
          control={form.control}
          name="history"
          label="Historia y logros"
          icon={BookOpenText}
          rows={5}
          placeholder="Fundación, títulos, clásicos, hitos del club…"
        />
      </FormSection>
    </FormSheet>
  );
}
