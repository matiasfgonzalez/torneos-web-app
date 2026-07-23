"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Activity,
  Calendar,
  Clock,
  CreditCard,
  Edit,
  FileText,
  Footprints,
  Globe,
  Hash,
  ImageIcon,
  InstagramIcon,
  MapPin,
  Plus,
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
import { toDateOnlyInput } from "@/lib/date-input";
import {
  PLAYER_POSITION_OPTIONS,
  PLAYER_STATUS_OPTIONS,
} from "@/lib/constants";
import type { IPlayer } from "@modules/jugadores/types";

/**
 * Alta y edición de jugador (F3). Antes: 677 líneas de `useState` + `fetch`, sin
 * ninguna validación más allá del `required` del navegador (un "número de
 * camiseta: abc" llegaba al server). Ahora: react-hook-form + Zod en español
 * dentro del `<FormSheet>` común.
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

const playerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(120, "El nombre no puede superar los 120 caracteres"),
  // El DNI identifica al jugador en TODA la plataforma (N12): es lo que evita
  // que la misma persona termine cargada dos veces por distintos delegados.
  nationalId: z
    .string()
    .trim()
    .min(6, "El DNI debe tener al menos 6 dígitos")
    .max(20, "El DNI no puede superar los 20 caracteres")
    .regex(/^[0-9A-Za-z.\s-]+$/, "El DNI solo puede tener números y letras"),
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
  number: z
    .number("Ingresá un número")
    .int()
    .min(1, "El número va del 1 al 99")
    .max(99, "El número va del 1 al 99")
    .optional(),
  status: z.string().min(1, "Elegí el estado"),
  joinedAt: z.string(),
  imageUrl: z.string().nullish(),
  imagePublicId: z.string().nullish(),
  imageUrlFace: z.string().nullish(),
  imageFacePublicId: z.string().nullish(),
  instagramUrl: z.url("Pegá el link completo (https://instagram.com/…)").or(z.literal("")),
  twitterUrl: z.url("Pegá el link completo (https://x.com/…)").or(z.literal("")),
  description: z.string().max(1000, "Máximo 1000 caracteres"),
  bio: z.string().max(5000, "Máximo 5000 caracteres"),
});

type PlayerFormValues = z.infer<typeof playerFormSchema>;

const emptyValues = (): PlayerFormValues => ({
  name: "",
  nationalId: "",
  birthDate: "",
  birthPlace: "",
  nationality: "Argentina",
  height: undefined,
  weight: undefined,
  dominantFoot: "",
  position: "",
  number: undefined,
  status: "ACTIVO",
  joinedAt: "",
  imageUrl: null,
  imagePublicId: null,
  imageUrlFace: null,
  imageFacePublicId: null,
  instagramUrl: "",
  twitterUrl: "",
  description: "",
  bio: "",
});

const valuesFromPlayer = (p: IPlayer): PlayerFormValues => ({
  name: p.name ?? "",
  nationalId: p.nationalId ?? "",
  birthDate: toDateOnlyInput(p.birthDate),
  birthPlace: p.birthPlace ?? "",
  nationality: p.nationality ?? "",
  height: p.height ?? undefined,
  weight: p.weight ?? undefined,
  dominantFoot: p.dominantFoot ?? "",
  position: p.position ?? "",
  number: p.number ?? undefined,
  status: p.status || "ACTIVO",
  joinedAt: toDateOnlyInput(p.joinedAt),
  imageUrl: p.imageUrl ?? null,
  imagePublicId: p.imagePublicId ?? null,
  imageUrlFace: p.imageUrlFace ?? null,
  imageFacePublicId: p.imageFacePublicId ?? null,
  instagramUrl: p.instagramUrl ?? "",
  twitterUrl: p.twitterUrl ?? "",
  description: p.description ?? "",
  bio: p.bio ?? "",
});

interface PlayerFormProps {
  isEditMode: boolean;
  player?: IPlayer;
}

export default function PlayerForm({
  isEditMode,
  player,
}: Readonly<PlayerFormProps>) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerFormSchema),
    defaultValues:
      isEditMode && player ? valuesFromPlayer(player) : emptyValues(),
  });

  const onSubmit = async (data: PlayerFormValues) => {
    // La API normaliza "" → null (nullableString/nullableInt de los validadores),
    // así que los opcionales vacíos se mandan tal cual.
    try {
      const res = await fetch(
        isEditMode ? `/api/players/${player?.id}` : "/api/players",
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (!res.ok) {
        const error = await res.json().catch(() => null);

        // 409 = ese DNI ya tiene ficha. No es un error de sistema: es la misma
        // persona ya cargada. El mensaje va en el campo, que es donde se
        // corrige (y no en un toast que se va).
        if (res.status === 409 && error?.existingPlayer) {
          form.setError("nationalId", {
            message: `Ese DNI ya es de ${error.existingPlayer.name}. Sumalo desde el plantel en vez de cargarlo de nuevo.`,
          });
          return;
        }

        toast.error(
          error?.error ??
            (isEditMode
              ? "No se pudo guardar el jugador"
              : "No se pudo crear el jugador"),
        );
        return;
      }

      toast.success(isEditMode ? "Jugador guardado" : "Jugador creado");
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
      icon={isEditMode ? Edit : User}
      title={isEditMode ? "Editar jugador" : "Registrar jugador"}
      description={isEditMode ? player?.name : "Solo el nombre es obligatorio"}
      submitLabel={isEditMode ? "Guardar cambios" : "Registrar jugador"}
      submitIcon={isEditMode ? undefined : Plus}
      trigger={
        isEditMode ? (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg border-brand/50 text-brand hover:border-brand hover:bg-brand/10"
            aria-label={`Editar ${player?.name ?? "jugador"}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="brand" className="h-12 px-6 text-base font-semibold">
            <Plus className="h-5 w-5" />
            Registrar jugador
          </Button>
        )
      }
    >
      <FormSection icon={User} title="Datos personales">
        <FieldRow>
          <TextField
            control={form.control}
            name="name"
            label="Nombre completo"
            icon={User}
            required
            placeholder="Ej: Lionel Andrés Messi"
            autoComplete="name"
          />
          <TextField
            control={form.control}
            name="nationalId"
            label="DNI"
            icon={CreditCard}
            required
            inputMode="numeric"
            placeholder="12345678"
            description="Identifica al jugador en toda la plataforma: evita que se cargue dos veces."
          />
        </FieldRow>
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

      <FormSection icon={Ruler} title="Perfil físico">
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
      </FormSection>

      <FormSection icon={Trophy} title="Ficha deportiva">
        <FieldRow>
          <SelectField
            control={form.control}
            name="position"
            label="Posición"
            icon={Trophy}
            options={PLAYER_POSITION_OPTIONS}
          />
          <NumberField
            control={form.control}
            name="number"
            label="Número de camiseta"
            icon={Hash}
            min={1}
            max={99}
            placeholder="10"
          />
        </FieldRow>
        <FieldRow>
          <SelectField
            control={form.control}
            name="status"
            label="Estado"
            icon={Activity}
            required
            options={PLAYER_STATUS_OPTIONS}
          />
          <DateField
            control={form.control}
            name="joinedAt"
            label="Fecha de ingreso"
            icon={Clock}
          />
        </FieldRow>
      </FormSection>

      <FormSection icon={ImageIcon} title="Fotos y redes">
        <FieldRow>
          <ImageField
            control={form.control}
            name="imageUrl"
            publicIdName="imagePublicId"
            label="Foto de cuerpo entero"
            icon={ImageIcon}
            folder="jugadores/cuerpo"
            placeholder="Arrastrá la foto de cuerpo entero"
          />
          <ImageField
            control={form.control}
            name="imageUrlFace"
            publicIdName="imageFacePublicId"
            label="Foto de rostro"
            icon={ImageIcon}
            folder="jugadores/rostro"
            placeholder="Arrastrá la foto de rostro"
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

      <FormSection icon={FileText} title="Descripción">
        <TextareaField
          control={form.control}
          name="description"
          label="Resumen"
          icon={FileText}
          rows={3}
          placeholder="Características principales del jugador…"
        />
        <TextareaField
          control={form.control}
          name="bio"
          label="Biografía"
          icon={FileText}
          rows={5}
          placeholder="Trayectoria, logros, datos de color…"
        />
      </FormSection>
    </FormSheet>
  );
}
