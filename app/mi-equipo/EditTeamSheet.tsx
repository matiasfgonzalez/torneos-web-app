"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CalendarDays,
  ImageIcon,
  Info,
  MapPin,
  Palette,
  Pencil,
  Shield,
  Tag,
  UserRound,
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

/** Datos del club que el delegado puede editar. */
export interface EditableTeam {
  id: string;
  name: string;
  shortName: string | null;
  description: string | null;
  history: string | null;
  coach: string | null;
  homeCity: string | null;
  yearFounded: number | null;
  homeColor: string | null;
  awayColor: string | null;
  logoUrl: string | null;
  logoPublicId: string | null;
}

const currentYear = new Date().getFullYear();

/**
 * Réplica de `teamUpdateSchema` (`lib/validators/team.ts`, el contrato del
 * server) para que el error aparezca en el campo y no como un 400 genérico.
 */
const teamFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El equipo necesita un nombre")
    .max(120, "Máximo 120 caracteres"),
  shortName: z.string().max(30, "Máximo 30 caracteres"),
  coach: z.string().max(120, "Máximo 120 caracteres"),
  homeCity: z.string().max(120, "Máximo 120 caracteres"),
  // `z.number()` y no `z.coerce.number()`: el coerce deja el tipo de entrada en
  // `unknown` y react-hook-form deja de tipar el form (convención ya usada en
  // `modules/equipos/components/admin/team-form.tsx`). `NumberField` se encarga
  // de convertir el string del input.
  yearFounded: z
    .number("El año de fundación es obligatorio")
    .int()
    .min(1900, "El año no puede ser anterior a 1900")
    .max(currentYear, `No puede ser posterior a ${currentYear}`),
  description: z.string().max(1000, "Máximo 1000 caracteres"),
  history: z.string().max(5000, "Máximo 5000 caracteres"),
  homeColor: z.string().nullish(),
  awayColor: z.string().nullish(),
  logoUrl: z.string().nullish(),
  logoPublicId: z.string().nullish(),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

const toForm = (team: EditableTeam): TeamFormValues => ({
  name: team.name,
  shortName: team.shortName ?? "",
  coach: team.coach ?? "",
  homeCity: team.homeCity ?? "",
  // El campo arranca vacío, no en 0, si el equipo no tiene año cargado.
  yearFounded: team.yearFounded ?? (undefined as unknown as number),
  description: team.description ?? "",
  history: team.history ?? "",
  homeColor: team.homeColor,
  awayColor: team.awayColor,
  logoUrl: team.logoUrl,
  logoPublicId: team.logoPublicId,
});

/** "" no es un dato: se manda `null` para no guardar cadenas vacías. */
const orNull = (v: string) => (v.trim() === "" ? null : v.trim());

/**
 * Edición de la ficha del club por su delegado (`/mi-equipo`).
 *
 * Solo campos de **identidad y presentación**: el estado (`enabled`), la baja y
 * la liga a la que pertenece los maneja la organización, y ni siquiera están en
 * `teamUpdateSchema`, así que el server los rechaza aunque se los mande a mano.
 * Pega al mismo `PATCH /api/teams/[id]` que usa el panel de la liga, que desde
 * N13 autoriza también al delegado aprobado (`canManageTeam`).
 */
export default function EditTeamSheet({
  team,
}: Readonly<{ team: EditableTeam }>) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: toForm(team),
  });

  const onSubmit = async (data: TeamFormValues) => {
    const payload = {
      name: data.name.trim(),
      shortName: orNull(data.shortName),
      coach: orNull(data.coach),
      homeCity: orNull(data.homeCity),
      yearFounded: data.yearFounded,
      description: orNull(data.description),
      history: orNull(data.history),
      homeColor: data.homeColor ?? null,
      awayColor: data.awayColor ?? null,
      logoUrl: data.logoUrl ?? null,
      logoPublicId: data.logoPublicId ?? null,
    };

    try {
      const res = await fetch(`/api/teams/${team.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        toast.error(error?.error ?? "No se pudieron guardar los cambios");
        return;
      }

      toast.success("Los datos del equipo quedaron actualizados");
      setOpen(false);
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
      icon={Pencil}
      title="Editar equipo"
      description={team.name}
      submitLabel="Guardar cambios"
      size="lg"
      trigger={
        <Button variant="outline" size="sm" className="shrink-0">
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Editar
        </Button>
      }
    >
      <FormSection icon={Shield} title="Identidad">
        <TextField
          control={form.control}
          name="name"
          label="Nombre del equipo"
          icon={Shield}
          required
          placeholder="Ej: Club Social y Deportivo Talleres"
          description="Es el nombre que ve tu liga en la tabla de posiciones y el fixture."
        />
        <FieldRow>
          <TextField
            control={form.control}
            name="shortName"
            label="Nombre corto"
            icon={Tag}
            placeholder="Ej: Talleres"
            description="Se usa donde no entra el nombre completo."
          />
          <TextField
            control={form.control}
            name="coach"
            label="Entrenador"
            icon={UserRound}
            placeholder="Nombre del DT"
          />
        </FieldRow>
        <FieldRow>
          <TextField
            control={form.control}
            name="homeCity"
            label="Ciudad"
            icon={MapPin}
            placeholder="Ej: Oro Verde"
          />
          <NumberField
            control={form.control}
            name="yearFounded"
            label="Año de fundación"
            icon={CalendarDays}
            min={1900}
            max={currentYear}
            placeholder={String(currentYear)}
          />
        </FieldRow>
      </FormSection>

      <FormSection icon={ImageIcon} title="Escudo y colores">
        <ImageField
          control={form.control}
          name="logoUrl"
          publicIdName="logoPublicId"
          label="Escudo del club"
          icon={ImageIcon}
          folder="equipos/logos"
          placeholder="Arrastrá el escudo o hacé clic para elegirlo"
        />
        <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Tamaño recomendado: 400 × 400 px
          </span>{" "}
          (cuadrado). El escudo se muestra siempre en redondo y en tamaños
          chicos —la tabla de posiciones y el fixture lo usan a 40 px—, así que
          conviene que se entienda de lejos y no tenga texto fino. JPG o PNG,
          hasta 5 MB.
        </p>
        <FieldRow>
          <ColorField
            control={form.control}
            name="homeColor"
            label="Color local"
            icon={Palette}
          />
          <ColorField
            control={form.control}
            name="awayColor"
            label="Color visitante"
            icon={Palette}
          />
        </FieldRow>
      </FormSection>

      <FormSection icon={Info} title="Sobre el club">
        <TextareaField
          control={form.control}
          name="description"
          label="Descripción"
          icon={Info}
          rows={3}
          placeholder="Una presentación breve del club (opcional)"
        />
        <TextareaField
          control={form.control}
          name="history"
          label="Historia"
          icon={Info}
          rows={6}
          placeholder="Fundación, títulos, hitos… (opcional)"
        />
      </FormSection>
    </FormSheet>
  );
}
