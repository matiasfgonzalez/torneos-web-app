"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FileText, ImageIcon, Newspaper, Plus, Text } from "lucide-react";

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

/**
 * Alta de noticia de plataforma (patrón §11 de UI_PATTERNS: `FormSheet`).
 *
 * Antes era un `Dialog` centrado con 6 campos y scroll interno, sin validación
 * — el `required` del navegador no alcanza y AGENT_RULES lo prohíbe
 * explícitamente. Los límites replican `lib/validators/news.ts` (contrato del
 * server) para que el error se vea en el campo y no como un 400 genérico.
 */
const noticiaFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(200, "El título no puede superar los 200 caracteres"),
  summary: z.string().max(500, "Máximo 500 caracteres"),
  content: z
    .string()
    .trim()
    .min(1, "Escribí el contenido de la noticia")
    .max(50000, "Máximo 50.000 caracteres"),
  coverImageUrl: z.string().nullish(),
  coverImagePublicId: z.string().nullish(),
  published: z.boolean(),
});

type NoticiaFormValues = z.infer<typeof noticiaFormSchema>;

const emptyValues = (): NoticiaFormValues => ({
  title: "",
  summary: "",
  content: "",
  coverImageUrl: null,
  coverImagePublicId: null,
  published: false,
});

export function NoticiaForm({
  onSuccess,
}: Readonly<{ onSuccess: () => void }>) {
  const [open, setOpen] = useState(false);

  const form = useForm<NoticiaFormValues>({
    resolver: zodResolver(noticiaFormSchema),
    defaultValues: emptyValues(),
  });

  // `useWatch` y no `form.watch()`: el segundo devuelve una función que el
  // React Compiler no puede memoizar y desactiva la optimización del componente.
  const willPublish = useWatch({ control: form.control, name: "published" });

  const onSubmit = async (data: NoticiaFormValues) => {
    // "" no es un resumen: se manda null para no guardar cadenas vacías.
    const payload = {
      ...data,
      summary: data.summary.trim() === "" ? null : data.summary.trim(),
    };

    try {
      const res = await fetch("/api/noticias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        toast.error(error?.error ?? "No se pudo crear la noticia");
        return;
      }

      toast.success(data.published ? "Noticia publicada" : "Borrador guardado");
      setOpen(false);
      form.reset(emptyValues());
      // Se recarga la lista en vez de insertar la respuesta: el POST devuelve
      // la noticia sin su autor, y la tabla espera la forma completa.
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
      icon={Newspaper}
      title="Nueva noticia"
      description="Se publica en la portada de GOLAZO."
      submitLabel={willPublish ? "Crear y publicar" : "Guardar borrador"}
      submitIcon={Plus}
      trigger={
        <Button variant="brand" className="h-12 px-6 text-base font-semibold">
          <Plus className="h-5 w-5" />
          Nueva noticia
        </Button>
      }
    >
      <FormSection icon={FileText} title="Contenido">
        <TextField
          control={form.control}
          name="title"
          label="Título"
          icon={Newspaper}
          required
          placeholder="Ej: Arranca la fecha 5 con clásico incluido"
        />
        <TextField
          control={form.control}
          name="summary"
          label="Resumen"
          icon={Text}
          placeholder="Una línea que resuma la noticia (opcional)"
          description="Aparece en la tarjeta de la noticia, antes de abrirla."
        />
        <TextareaField
          control={form.control}
          name="content"
          label="Noticia"
          icon={FileText}
          required
          rows={8}
          placeholder="Desarrollá la noticia con el detalle que quieras…"
        />
      </FormSection>

      <FormSection icon={ImageIcon} title="Portada y publicación">
        <ImageField
          control={form.control}
          name="coverImageUrl"
          publicIdName="coverImagePublicId"
          label="Imagen de portada"
          icon={ImageIcon}
          folder="noticias/covers"
          placeholder="Arrastrá una imagen o hacé clic para elegirla (opcional)"
        />
        <SwitchField
          control={form.control}
          name="published"
          label="Publicar"
          onText="Visible ahora para todos en GOLAZO."
          offText="Se guarda como borrador; nadie la ve todavía."
        />
      </FormSection>
    </FormSheet>
  );
}
