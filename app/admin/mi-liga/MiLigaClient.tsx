"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CloudinaryUpload } from "@/components/ui/cloudinary-upload";
import {
  Palette,
  Loader2,
  ExternalLink,
  Lock,
  Sparkles,
  Trophy,
} from "lucide-react";

interface OrgProfile {
  name: string;
  locality: string | null;
  description: string | null;
  phone: string | null;
  logoUrl: string | null;
  logoPublicId: string | null;
  brandColor: string | null;
}

type FormState = {
  name: string;
  locality: string;
  description: string;
  phone: string;
  logoUrl: string | null;
  logoPublicId: string | null;
  brandColor: string;
};

const toForm = (org: OrgProfile): FormState => ({
  name: org.name ?? "",
  locality: org.locality ?? "",
  description: org.description ?? "",
  phone: org.phone ?? "",
  logoUrl: org.logoUrl,
  logoPublicId: org.logoPublicId,
  brandColor: org.brandColor ?? "",
});

const DEFAULT_BRAND = "#ad45ff";
const isValidHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);

async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.error ?? "Ocurrió un error inesperado";
  } catch {
    return "Ocurrió un error inesperado";
  }
}

/**
 * Reusa el "paso de marca" del wizard de alta (CrearLigaWizard, paso 1)
 * contra `PATCH /api/org`. El color de marca se gatea con `customBranding`:
 * `canBrand=false` reemplaza el selector por un upsell a /admin/plan.
 */
export default function MiLigaClient({
  initialOrg,
  canBrand,
  publicSlug,
}: Readonly<{
  initialOrg: OrgProfile;
  canBrand: boolean;
  publicSlug: string;
}>) {
  const [initial, setInitial] = useState<FormState>(toForm(initialOrg));
  const [form, setForm] = useState<FormState>(toForm(initialOrg));
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Comparación campo a campo: el botón de guardar solo se activa con cambios
  // reales (evita PATCH inútiles y da feedback de estado sin estado extra).
  const dirty = useMemo(
    () => (Object.keys(form) as (keyof FormState)[]).some((k) => form[k] !== initial[k]),
    [form, initial],
  );

  const nameTooShort = form.name.trim().length < 2;
  const brandInvalid = form.brandColor !== "" && !isValidHex(form.brandColor);
  // El acento que se verá en la página pública (o el violeta de GOLAZO por
  // defecto). Solo se aplica de verdad si el plan incluye marca propia.
  const previewColor =
    canBrand && isValidHex(form.brandColor) ? form.brandColor : DEFAULT_BRAND;

  const save = async () => {
    if (nameTooShort) {
      toast.error("Poné un nombre para tu liga (mínimo 2 caracteres)");
      return;
    }
    if (brandInvalid) {
      toast.error("El color debe estar en formato #RRGGBB");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        locality: form.locality,
        description: form.description,
        phone: form.phone,
        logoUrl: form.logoUrl,
        logoPublicId: form.logoPublicId,
      };
      // Sin la feature no se toca el color (el gating vive también en la UI,
      // pero el payload lo respeta para no pisar el valor guardado).
      if (canBrand) payload.brandColor = form.brandColor || null;

      const res = await fetch("/api/org", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        toast.error(await readError(res));
        return;
      }
      toast.success("Cambios guardados");
      setInitial(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-3xl mx-auto">
      <PageHeader
        variant="simple"
        icon={Palette}
        title="Mi liga"
        description="Cómo se ve tu liga en las páginas públicas: nombre, escudo y marca."
        actions={
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/liga/${publicSlug}`} target="_blank" rel="noopener">
              <ExternalLink className="w-4 h-4" />
              Ver página pública
            </Link>
          </Button>
        }
      />

      {/* ---------------- Perfil de la liga ---------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-brand" />
            Perfil de la liga
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="org-name">
              Nombre de la liga <span className="text-red-500">*</span>
            </Label>
            <Input
              id="org-name"
              placeholder='Ej: "Liga Municipal de Rafaela"'
              value={form.name}
              maxLength={100}
              aria-invalid={nameTooShort}
              onChange={(e) => set("name", e.target.value)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Si lo cambiás, la dirección pública de tu liga se actualiza.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="org-locality">Localidad</Label>
              <Input
                id="org-locality"
                placeholder="Ciudad / zona"
                value={form.locality}
                maxLength={120}
                onChange={(e) => set("locality", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-phone">WhatsApp de contacto</Label>
              <Input
                id="org-phone"
                placeholder="+54 9 ..."
                value={form.phone}
                maxLength={30}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-description">Descripción corta</Label>
            <Textarea
              id="org-description"
              placeholder="Ej: Fútbol amateur los sábados, categorías libre y veteranos."
              value={form.description}
              maxLength={500}
              rows={3}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Logo o escudo</Label>
            <CloudinaryUpload
              folder="organizaciones/logos"
              value={form.logoUrl}
              publicId={form.logoPublicId}
              onChange={(url, publicId) => {
                set("logoUrl", url);
                set("logoPublicId", publicId);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* ---------------- Marca propia (gated customBranding) ---------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-brand" />
            Color de tu marca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {canBrand ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="color"
                  value={isValidHex(form.brandColor) ? form.brandColor : DEFAULT_BRAND}
                  onChange={(e) => set("brandColor", e.target.value)}
                  className="h-11 w-14 cursor-pointer rounded-xl border-2 border-gray-200 p-1 dark:border-gray-700"
                  aria-label="Elegí el color de tu marca"
                />
                <Input
                  value={form.brandColor}
                  placeholder={DEFAULT_BRAND}
                  maxLength={7}
                  aria-invalid={brandInvalid}
                  onChange={(e) => set("brandColor", e.target.value)}
                  className="w-32 font-mono"
                />
                {form.brandColor && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-gray-500"
                    onClick={() => set("brandColor", "")}
                  >
                    Quitar
                  </Button>
                )}
              </div>
              {brandInvalid && (
                <p className="text-xs text-red-500">
                  Usá un color en formato #RRGGBB (ej: {DEFAULT_BRAND}).
                </p>
              )}
              <BrandPreview color={previewColor} />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sin un color propio, tu página pública usa el violeta de GOLAZO.
              </p>
            </>
          ) : (
            <div className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/5 to-brand-2/5 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-2 shadow-lg shadow-brand/25">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Marca propia
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Pintá tu página pública con el color de tu liga y sacá la
                      atribución <strong>Hecho con GOLAZO</strong>. Disponible en
                      los planes con marca propia.
                    </p>
                  </div>
                  <BrandPreview color={DEFAULT_BRAND} locked />
                  <Button
                    asChild
                    variant="brand"
                    className="gap-2 font-semibold"
                  >
                    <Link href="/admin/plan">
                      <Sparkles className="h-4 w-4" />
                      Ver planes
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------------- Barra de guardado ---------------- */}
      <div className="sticky bottom-0 -mx-6 sm:-mx-8 border-t border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/80 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {dirty ? "Tenés cambios sin guardar" : "Todo guardado"}
          </p>
          <Button
            onClick={save}
            disabled={saving || !dirty || nameTooShort}
            variant="brand"
            className="font-semibold px-6"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Muestra el acento aplicado a un botón y una insignia — el mismo efecto que
 * verá el hincha en `/liga/[slug]`. `locked` lo atenúa para el upsell.
 */
function BrandPreview({
  color,
  locked = false,
}: Readonly<{ color: string; locked?: boolean }>) {
  return (
    <div
      className={`rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50 ${
        locked ? "opacity-60 saturate-50" : ""
      }`}
    >
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
        Vista previa
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-white shadow-sm"
          style={{ backgroundColor: color }}
        >
          <Trophy className="h-4 w-4" />
          Ver torneo
        </span>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ backgroundColor: `${color}1a`, color }}
        >
          En curso
        </span>
        <span className="text-sm font-medium" style={{ color }}>
          Leer más →
        </span>
      </div>
    </div>
  );
}
