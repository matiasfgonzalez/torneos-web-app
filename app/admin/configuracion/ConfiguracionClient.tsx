"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { toast } from "sonner";
import {
  Settings,
  Loader2,
  Save,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Wallet,
  User,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSiteSettings } from "@modules/configuracion/actions/siteSettings";
import type { SiteSettings } from "@prisma/client";

interface ConfiguracionClientProps {
  initialSettings: SiteSettings;
}

interface FormValues {
  description: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  paymentAlias: string;
  paymentHolder: string;
  paymentInstructions: string;
}

function settingsToForm(s: SiteSettings): FormValues {
  return {
    description: s.description ?? "",
    contactEmail: s.contactEmail ?? "",
    contactPhone: s.contactPhone ?? "",
    address: s.address ?? "",
    facebookUrl: s.facebookUrl ?? "",
    twitterUrl: s.twitterUrl ?? "",
    instagramUrl: s.instagramUrl ?? "",
    paymentAlias: s.paymentAlias ?? "",
    paymentHolder: s.paymentHolder ?? "",
    paymentInstructions: s.paymentInstructions ?? "",
  };
}

export default function ConfiguracionClient({
  initialSettings,
}: ConfiguracionClientProps) {
  const [form, setForm] = useState<FormValues>(() =>
    settingsToForm(initialSettings),
  );
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof FormValues>(field: K, value: FormValues[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateSiteSettings({
        description: form.description || null,
        contactEmail: form.contactEmail || null,
        contactPhone: form.contactPhone || null,
        address: form.address || null,
        facebookUrl: form.facebookUrl || null,
        twitterUrl: form.twitterUrl || null,
        instagramUrl: form.instagramUrl || null,
        paymentAlias: form.paymentAlias || null,
        paymentHolder: form.paymentHolder || null,
        paymentInstructions: form.paymentInstructions || null,
      });
      if (res.success) {
        toast.success("Configuración guardada — ya se refleja en el sitio");
      } else {
        toast.error(res.error || "No se pudo guardar la configuración");
      }
    } catch {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-3xl mx-auto">
      {/* Header - componente compartido (patrón §3 variante B) */}
      <PageHeader
        variant="simple"
        icon={Settings}
        title="Configuración del Sitio"
        description="Contacto y redes que se muestran en el pie de página"
      />

      <Card>
        <CardHeader>
          <CardTitle>Información general</CardTitle>
          <CardDescription>
            Se muestra en el footer de todas las páginas públicas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descripción / tagline</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="La plataforma líder para la gestión profesional de torneos deportivos..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="rounded-xl focus-visible:ring-brand/30"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacto</CardTitle>
          <CardDescription>
            Dejá un campo vacío para ocultarlo del footer
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactEmail" className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-brand" />
              Email
            </Label>
            <Input
              id="contactEmail"
              type="email"
              placeholder="contacto@golazo.com"
              value={form.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone" className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-brand" />
              Teléfono
            </Label>
            <Input
              id="contactPhone"
              placeholder="+54 9 11 1234-5678"
              value={form.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-brand" />
              Dirección
            </Label>
            <Input
              id="address"
              placeholder="Calle 123, Ciudad - Provincia - País"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className="rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Redes sociales</CardTitle>
          <CardDescription>
            Solo se muestra el ícono de las redes con URL cargada
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="facebookUrl" className="flex items-center gap-2">
              <Facebook className="w-3.5 h-3.5 text-brand" />
              Facebook
            </Label>
            <Input
              id="facebookUrl"
              placeholder="https://facebook.com/tuliga"
              value={form.facebookUrl}
              onChange={(e) => update("facebookUrl", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitterUrl" className="flex items-center gap-2">
              <Twitter className="w-3.5 h-3.5 text-brand" />
              Twitter / X
            </Label>
            <Input
              id="twitterUrl"
              placeholder="https://x.com/tuliga"
              value={form.twitterUrl}
              onChange={(e) => update("twitterUrl", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagramUrl" className="flex items-center gap-2">
              <Instagram className="w-3.5 h-3.5 text-brand" />
              Instagram
            </Label>
            <Input
              id="instagramUrl"
              placeholder="https://instagram.com/tuliga"
              value={form.instagramUrl}
              onChange={(e) => update("instagramUrl", e.target.value)}
              className="rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-brand" />
            Datos de cobro
          </CardTitle>
          <CardDescription>
            Adónde transfieren las ligas para contratar un plan. Se muestran en
            /admin/plan al informar un pago. Dejalos vacíos y esa pantalla avisa
            que todavía no configuraste cómo cobrar.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="paymentAlias" className="flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-brand" />
              Alias / CBU / CVU
            </Label>
            <Input
              id="paymentAlias"
              placeholder="GOLAZO.PAGOS"
              value={form.paymentAlias}
              onChange={(e) => update("paymentAlias", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentHolder" className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-brand" />
              Titular de la cuenta
            </Label>
            <Input
              id="paymentHolder"
              placeholder="Ej: Matías González"
              value={form.paymentHolder}
              onChange={(e) => update("paymentHolder", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="paymentInstructions">Instrucciones (opcional)</Label>
            <Textarea
              id="paymentInstructions"
              rows={2}
              placeholder="Ej: poné el nombre de tu liga en el concepto de la transferencia."
              value={form.paymentInstructions}
              onChange={(e) => update("paymentInstructions", e.target.value)}
              className="rounded-xl focus-visible:ring-brand/30"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-gradient-to-r from-brand to-brand-mid hover:from-brand-hover hover:to-brand-mid-hover text-white shadow-lg shadow-brand/25 rounded-xl px-6"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}
