"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Award,
  Calendar,
  CreditCard,
  Edit,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Plus,
  Shield,
  User,
} from "lucide-react";

import { RefereeStatus } from "@prisma/client";
import { z } from "@/lib/zod-locale";
import { Button } from "@/components/ui/button";
import { FormSheet } from "@/components/shared/form/FormSheet";
import {
  DateField,
  FieldRow,
  FormSection,
  SelectField,
  TextField,
} from "@/components/shared/form/fields";
import { toDateInput } from "@/lib/date-input";
import { createReferee, updateReferee } from "@modules/arbitros/actions/actions";
import {
  CERTIFICATION_LEVELS,
  REFEREE_STATUS_LABELS,
  type IReferee,
} from "@modules/arbitros/types";

/**
 * Alta y edición de árbitro (F3). Migrado de 9 `useState` sueltos + validación
 * "el botón se deshabilita si el nombre está vacío" a react-hook-form + Zod en
 * el `<FormSheet>` común (mismo loading, misma guarda de cambios sin guardar y
 * mismos mensajes de error que el resto del panel).
 */

const STATUS_OPTIONS = Object.entries(REFEREE_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);

const refereeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(120, "El nombre no puede superar los 120 caracteres"),
  nationalId: z.string().max(20, "Máximo 20 caracteres"),
  birthDate: z.string(),
  nationality: z.string().max(80, "Máximo 80 caracteres"),
  imageUrl: z.url("Pegá el link completo de la foto (https://…)").or(z.literal("")),
  email: z.email("Revisá el email: falta el @ o el dominio").or(z.literal("")),
  phone: z.string().max(30, "Máximo 30 caracteres"),
  certificationLevel: z.string(),
  status: z.enum(RefereeStatus),
});

type RefereeFormValues = z.infer<typeof refereeFormSchema>;

const emptyValues = (): RefereeFormValues => ({
  name: "",
  nationalId: "",
  birthDate: "",
  nationality: "",
  imageUrl: "",
  email: "",
  phone: "",
  certificationLevel: CERTIFICATION_LEVELS[0].value,
  status: "ACTIVO",
});

const valuesFromReferee = (referee: IReferee): RefereeFormValues => ({
  name: referee.name ?? "",
  nationalId: referee.nationalId ?? "",
  birthDate: toDateInput(referee.birthDate),
  nationality: referee.nationality ?? "",
  imageUrl: referee.imageUrl ?? "",
  email: referee.email ?? "",
  phone: referee.phone ?? "",
  certificationLevel: referee.certificationLevel || CERTIFICATION_LEVELS[0].value,
  status: referee.status,
});

interface DialogRefereeProps {
  readonly mode: "create" | "edit";
  readonly referee?: IReferee;
  readonly onSuccess: () => void;
}

export default function DialogReferee({
  mode,
  referee,
  onSuccess,
}: DialogRefereeProps) {
  const isEdit = mode === "edit";
  const [open, setOpen] = useState(false);

  const form = useForm<RefereeFormValues>({
    resolver: zodResolver(refereeFormSchema),
    defaultValues: isEdit && referee ? valuesFromReferee(referee) : emptyValues(),
  });

  const onSubmit = async (data: RefereeFormValues) => {
    const payload = {
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      nationalId: data.nationalId || undefined,
      birthDate: data.birthDate || undefined,
      nationality: data.nationality || undefined,
      imageUrl: data.imageUrl || undefined,
      certificationLevel: data.certificationLevel || undefined,
      // El estado solo se toca al editar: uno nuevo nace ACTIVO
      status: isEdit ? data.status : undefined,
    };

    try {
      const res =
        isEdit && referee
          ? await updateReferee(referee.id, payload)
          : await createReferee(payload);

      if (!res.success) {
        toast.error(res.error || "No se pudo guardar el árbitro");
        return;
      }

      toast.success(isEdit ? "Árbitro guardado" : "Árbitro creado");
      setOpen(false);
      form.reset(isEdit ? data : emptyValues());
      onSuccess();
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
      size="md"
      icon={isEdit ? Edit : Award}
      title={isEdit ? "Editar árbitro" : "Nuevo árbitro"}
      description={isEdit ? referee?.name : "Solo el nombre es obligatorio"}
      submitLabel={isEdit ? "Guardar cambios" : "Crear árbitro"}
      submitIcon={isEdit ? undefined : Plus}
      trigger={
        isEdit ? (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg border-brand/50 text-brand transition-all hover:border-brand hover:bg-brand/10"
            aria-label={`Editar ${referee?.name ?? "árbitro"}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="brand" className="h-12 px-6 text-base font-semibold">
            <Plus className="h-5 w-5" />
            Nuevo árbitro
          </Button>
        )
      }
    >
      <FormSection icon={User} title="Datos personales">
        <TextField
          control={form.control}
          name="name"
          label="Nombre completo"
          icon={User}
          required
          placeholder="Ej: Néstor Pitana"
          autoComplete="name"
        />
        <FieldRow>
          <TextField
            control={form.control}
            name="nationalId"
            label="DNI"
            icon={CreditCard}
            inputMode="numeric"
            placeholder="12345678"
          />
          <DateField
            control={form.control}
            name="birthDate"
            label="Fecha de nacimiento"
            icon={Calendar}
          />
        </FieldRow>
        <FieldRow>
          <TextField
            control={form.control}
            name="nationality"
            label="Nacionalidad"
            icon={MapPin}
            placeholder="Ej: Argentina"
          />
          <TextField
            control={form.control}
            name="imageUrl"
            label="Foto (URL)"
            icon={ImageIcon}
            type="url"
            inputMode="url"
            placeholder="https://ejemplo.com/foto.jpg"
          />
        </FieldRow>
      </FormSection>

      <FormSection icon={Phone} title="Contacto">
        <FieldRow>
          <TextField
            control={form.control}
            name="email"
            label="Email"
            icon={Mail}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="arbitro@email.com"
          />
          <TextField
            control={form.control}
            name="phone"
            label="Teléfono"
            icon={Phone}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+54 9 343 123-4567"
          />
        </FieldRow>
      </FormSection>

      <FormSection icon={Shield} title="Ficha profesional">
        <FieldRow>
          <SelectField
            control={form.control}
            name="certificationLevel"
            label="Nivel de certificación"
            icon={Award}
            options={CERTIFICATION_LEVELS}
          />
          {isEdit && (
            <SelectField
              control={form.control}
              name="status"
              label="Estado"
              icon={Shield}
              options={STATUS_OPTIONS}
            />
          )}
        </FieldRow>
      </FormSection>
    </FormSheet>
  );
}
