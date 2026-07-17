"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Edit,
  FileText,
  ImageIcon,
  Megaphone,
  Plus,
  Text,
} from "lucide-react";

import { z } from "@/lib/zod-locale";
import { Button } from "@/components/ui/button";
import { FormSheet } from "@/components/shared/form/FormSheet";
import {
  FormSection,
  ImageField,
  SwitchField,
  TextField,
  TextareaField,
} from "@/components/shared/form/fields";
import type { IOrgPost } from "@modules/novedades/types";

const orgPostFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(160, "El título no puede superar los 160 caracteres"),
  summary: z.string().max(300, "Máximo 300 caracteres"),
  content: z
    .string()
    .trim()
    .min(1, "Escribí el contenido de la novedad")
    .max(10000, "Máximo 10.000 caracteres"),
  coverImageUrl: z.string().nullish(),
  coverImagePublicId: z.string().nullish(),
  published: z.boolean(),
});

type OrgPostFormValues = z.infer<typeof orgPostFormSchema>;

const emptyValues = (): OrgPostFormValues => ({
  title: "",
  summary: "",
  content: "",
  coverImageUrl: null,
  coverImagePublicId: null,
  published: false,
});

const valuesFromPost = (post: IOrgPost): OrgPostFormValues => ({
  title: post.title,
  summary: post.summary ?? "",
  content: post.content,
  coverImageUrl: post.coverImageUrl,
  coverImagePublicId: post.coverImagePublicId,
  published: post.published,
});

interface OrgPostFormProps {
  isEditMode: boolean;
  post?: IOrgPost;
  /** En modo creación, false deshabilita el disparador (plan sin `orgNews`). */
  canCreate?: boolean;
}

export function OrgPostForm({
  isEditMode,
  post,
  canCreate = true,
}: Readonly<OrgPostFormProps>) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<OrgPostFormValues>({
    resolver: zodResolver(orgPostFormSchema),
    defaultValues: isEditMode && post ? valuesFromPost(post) : emptyValues(),
  });

  const onSubmit = async (data: OrgPostFormValues) => {
    // "" no es un resumen: mandamos null para no guardar cadenas vacías.
    const payload = {
      ...data,
      summary: data.summary.trim() === "" ? null : data.summary.trim(),
    };

    try {
      const res = await fetch(
        isEditMode ? `/api/org-posts/${post?.id}` : "/api/org-posts",
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        toast.error(
          error?.error ??
            (isEditMode
              ? "No se pudo guardar la novedad"
              : "No se pudo crear la novedad"),
        );
        return;
      }

      toast.success(
        isEditMode
          ? "Novedad guardada"
          : data.published
            ? "Novedad publicada"
            : "Borrador guardado",
      );
      setOpen(false);
      form.reset(isEditMode ? valuesFromPost({ ...post!, ...payload }) : emptyValues());
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
      icon={isEditMode ? Edit : Megaphone}
      title={isEditMode ? "Editar novedad" : "Nueva novedad"}
      description={
        isEditMode
          ? post?.title
          : "Contala en tu página pública; tus seguidores la ven ahí."
      }
      submitLabel={isEditMode ? "Guardar cambios" : "Crear novedad"}
      submitIcon={isEditMode ? undefined : Plus}
      trigger={
        isEditMode ? (
          <Button
            variant="outline"
            size="sm"
            className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
            title="Editar novedad"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Editar {post?.title}</span>
          </Button>
        ) : (
          <Button
            variant="brand"
            className="h-12 px-6 text-base font-semibold"
            disabled={!canCreate}
          >
            <Plus className="h-5 w-5" />
            Nueva novedad
          </Button>
        )
      }
    >
      <FormSection icon={FileText} title="Contenido">
        <TextField
          control={form.control}
          name="title"
          label="Título"
          icon={Megaphone}
          required
          placeholder="Ej: Se viene la fecha 5 con clásico incluido"
        />
        <TextField
          control={form.control}
          name="summary"
          label="Resumen"
          icon={Text}
          placeholder="Una línea que resuma la novedad (opcional)"
          description="Aparece en la tarjeta de la novedad, antes de abrirla."
        />
        <TextareaField
          control={form.control}
          name="content"
          label="Novedad"
          icon={FileText}
          required
          rows={8}
          placeholder="Contá la novedad con el detalle que quieras…"
        />
      </FormSection>

      <FormSection icon={ImageIcon} title="Portada y publicación">
        <ImageField
          control={form.control}
          name="coverImageUrl"
          publicIdName="coverImagePublicId"
          label="Imagen de portada"
          icon={ImageIcon}
          folder="novedades/covers"
          placeholder="Arrastrá una imagen o hacé clic para elegirla (opcional)"
        />
        <SwitchField
          control={form.control}
          name="published"
          label="Publicar"
          onText="Visible ahora en la página de tu liga."
          offText="Se guarda como borrador; nadie la ve todavía."
        />
      </FormSection>
    </FormSheet>
  );
}
