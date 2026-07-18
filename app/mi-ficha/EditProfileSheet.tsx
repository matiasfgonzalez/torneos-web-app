"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Calendar,
  FileText,
  Footprints,
  Globe,
  ImageIcon,
  InstagramIcon,
  MapPin,
  Pencil,
  Ruler,
  Trophy,
  TwitterIcon,
  User,
  Weight,
} from "lucide-react";

import { z } from "@/lib/zod-locale";
import { Button } from "@/components/ui/button";
import { FormSheet } from "@/components/shared/form/FormSheet";
import {
  DateField,
  FieldRow,
  FormSection,
  ImageField,
  NumberField,
  SelectField,
  TextField,
  TextareaField,
} from "@/components/shared/form/fields";
import { toDateInput } from "@/lib/date-input";
import { PLAYER_POSITION_OPTIONS } from "@/lib/constants";
import type { MyPlayerProfile } from "@modules/jugadores/actions/claims";

/**
 * Editar la propia ficha desde /mi-ficha (N12). El dueño edita un SUBCONJUNTO
 * de la ficha: sus datos personales, físicos, de posición, fotos y redes. Lo
 * administrativo queda afuera a propósito —el **DNI** (clave de identidad global,
 * no se cambia acá), el **estado** y la **fecha de ingreso** (los maneja la
 * liga), y el **número** (es por torneo, lo pone el club en el plantel).
 *
 * Mismo endpoint que usa el admin (`PATCH /api/players/[id]`): ese ya autoriza
 * al dueño vía `canEditPlayer` y audita el cambio en `AuditLog`.
 */

const FOOT_OPTIONS = [
  { value: "DERECHA", label: "Derecha" },
  { value: "IZQUIERDA", label: "Izquierda" },
  { value: "AMBOS", label: "Ambas" },
] as const;

const NATIONALITIES = [
  "Argentina",
  "Brasil",
  "Chile",
  "Colombia",
  "Ecuador",
  "Paraguay",
  "Perú",
  "Uruguay",
  "Venezuela",
  "Bolivia",
  "México",
  "España",
  "Italia",
  "Otra",
].map((value) => ({ value, label: value }));

const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(120, "El nombre no puede superar los 120 caracteres"),
  birthDate: z.string(),
  birthPlace: z.string().max(120, "Máximo 120 caracteres"),
  nationality: z.string(),
  height: z
    .number("Ingresá la altura en centímetros")
    .int()
    .min(120, "¿Seguro? La altura va en centímetros (mínimo 120)")
    .max(230, "La altura máxima es 230 cm")
    .optional(),
  weight: z
    .number("Ingresá el peso en kilos")
    .int()
    .min(30, "El peso mínimo es 30 kg")
    .max(180, "El peso máximo es 180 kg")
    .optional(),
  dominantFoot: z.string(),
  position: z.string(),
  imageUrl: z.string().nullish(),
  imagePublicId: z.string().nullish(),
  imageUrlFace: z.string().nullish(),
  imageFacePublicId: z.string().nullish(),
  instagramUrl: z
    .url("Pegá el link completo (https://instagram.com/…)")
    .or(z.literal("")),
  twitterUrl: z.url("Pegá el link completo (https://x.com/…)").or(z.literal("")),
  description: z.string().max(1000, "Máximo 1000 caracteres"),
  bio: z.string().max(5000, "Máximo 5000 caracteres"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const valuesFromProfile = (p: MyPlayerProfile): ProfileFormValues => ({
  name: p.name ?? "",
  birthDate: toDateInput(p.birthDate),
  birthPlace: p.birthPlace ?? "",
  nationality: p.nationality ?? "",
  height: p.height ?? undefined,
  weight: p.weight ?? undefined,
  dominantFoot: p.dominantFoot ?? "",
  position: p.position ?? "",
  imageUrl: p.imageUrl ?? null,
  imagePublicId: p.imagePublicId ?? null,
  imageUrlFace: p.imageUrlFace ?? null,
  imageFacePublicId: p.imageFacePublicId ?? null,
  instagramUrl: p.instagramUrl ?? "",
  twitterUrl: p.twitterUrl ?? "",
  description: p.description ?? "",
  bio: p.bio ?? "",
});

export default function EditProfileSheet({
  player,
}: Readonly<{ player: MyPlayerProfile }>) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: valuesFromProfile(player),
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const res = await fetch(`/api/players/${player.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        toast.error(error?.error ?? "No se pudieron guardar tus datos");
        return;
      }

      toast.success("Tus datos quedaron actualizados");
      setOpen(false);
      form.reset(data);
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
      title="Editar mis datos"
      description="Lo que cambies lo ve tu liga en tu ficha."
      submitLabel="Guardar cambios"
      trigger={
        <Button variant="brand" className="h-11 px-5">
          <Pencil className="h-4 w-4" />
          Editar mis datos
        </Button>
      }
    >
      <FormSection icon={User} title="Datos personales">
        <TextField
          control={form.control}
          name="name"
          label="Nombre completo"
          icon={User}
          required
          placeholder="Como figurás en tu documento"
          autoComplete="name"
        />
        <FieldRow>
          <DateField
            control={form.control}
            name="birthDate"
            label="Fecha de nacimiento"
            icon={Calendar}
          />
          <TextField
            control={form.control}
            name="birthPlace"
            label="Lugar de nacimiento"
            icon={MapPin}
            placeholder="Ej: Rosario, Santa Fe"
          />
        </FieldRow>
        <SelectField
          control={form.control}
          name="nationality"
          label="Nacionalidad"
          icon={Globe}
          options={NATIONALITIES}
        />
      </FormSection>

      <FormSection icon={Ruler} title="Perfil físico y posición">
        <FieldRow cols={3}>
          <NumberField
            control={form.control}
            name="height"
            label="Altura"
            icon={Ruler}
            min={120}
            max={230}
            unit="cm"
            placeholder="175"
          />
          <NumberField
            control={form.control}
            name="weight"
            label="Peso"
            icon={Weight}
            min={30}
            max={180}
            unit="kg"
            placeholder="70"
          />
          <SelectField
            control={form.control}
            name="dominantFoot"
            label="Pie hábil"
            icon={Footprints}
            options={FOOT_OPTIONS}
          />
        </FieldRow>
        <SelectField
          control={form.control}
          name="position"
          label="Posición"
          icon={Trophy}
          options={PLAYER_POSITION_OPTIONS}
        />
      </FormSection>

      <FormSection icon={ImageIcon} title="Fotos y redes">
        <FieldRow>
          <ImageField
            control={form.control}
            name="imageUrlFace"
            publicIdName="imageFacePublicId"
            label="Foto de rostro"
            icon={ImageIcon}
            folder="jugadores/rostro"
            placeholder="Arrastrá tu foto de rostro"
          />
          <ImageField
            control={form.control}
            name="imageUrl"
            publicIdName="imagePublicId"
            label="Foto de cuerpo entero"
            icon={ImageIcon}
            folder="jugadores/cuerpo"
            placeholder="Arrastrá tu foto de cuerpo entero"
          />
        </FieldRow>
        <FieldRow>
          <TextField
            control={form.control}
            name="instagramUrl"
            label="Instagram"
            icon={InstagramIcon}
            type="url"
            inputMode="url"
            placeholder="https://instagram.com/usuario"
          />
          <TextField
            control={form.control}
            name="twitterUrl"
            label="X / Twitter"
            icon={TwitterIcon}
            type="url"
            inputMode="url"
            placeholder="https://x.com/usuario"
          />
        </FieldRow>
      </FormSection>

      <FormSection icon={FileText} title="Sobre mí">
        <TextareaField
          control={form.control}
          name="description"
          label="Resumen"
          icon={FileText}
          rows={3}
          placeholder="Tus características como jugador…"
        />
        <TextareaField
          control={form.control}
          name="bio"
          label="Biografía"
          icon={FileText}
          rows={5}
          placeholder="Tu trayectoria, logros, datos de color…"
        />
      </FormSection>
    </FormSheet>
  );
}
