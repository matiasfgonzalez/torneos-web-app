"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { toast } from "sonner";
import {
  CheckCircle2,
  Layers,
  Loader2,
  Pencil,
  Plus,
  XCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PlanRow {
  id: string;
  code: string;
  name: string;
  priceMonthly: string;
  currency: string;
  maxActiveTournaments: number;
  maxTeamsPerTournament: number;
  maxMembers: number;
  features: { exportPdf?: boolean; customBranding?: boolean; liveMatch?: boolean };
  isActive: boolean;
  order: number;
  _count?: { subscriptions: number };
}

interface PlanFormValues {
  code: string;
  name: string;
  priceMonthly: string;
  maxActiveTournaments: string;
  maxTeamsPerTournament: string;
  maxMembers: string;
  exportPdf: boolean;
  customBranding: boolean;
  liveMatch: boolean;
  isActive: boolean;
  order: string;
}

const emptyForm: PlanFormValues = {
  code: "",
  name: "",
  priceMonthly: "0",
  maxActiveTournaments: "1",
  maxTeamsPerTournament: "16",
  maxMembers: "3",
  exportPdf: false,
  customBranding: false,
  liveMatch: false,
  isActive: true,
  order: "0",
};

function planToForm(plan: PlanRow): PlanFormValues {
  return {
    code: plan.code,
    name: plan.name,
    priceMonthly: String(plan.priceMonthly),
    maxActiveTournaments: String(plan.maxActiveTournaments),
    maxTeamsPerTournament: String(plan.maxTeamsPerTournament),
    maxMembers: String(plan.maxMembers),
    exportPdf: !!plan.features?.exportPdf,
    customBranding: !!plan.features?.customBranding,
    liveMatch: !!plan.features?.liveMatch,
    isActive: plan.isActive,
    order: String(plan.order),
  };
}

export default function PlanesClient() {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanFormValues>(emptyForm);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/plans");
      if (res.ok) setPlans(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (plan: PlanRow) => {
    setEditingId(plan.id);
    setForm(planToForm(plan));
    setDialogOpen(true);
  };

  const update = <K extends keyof PlanFormValues>(
    field: K,
    value: PlanFormValues[K],
  ) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.warning("El nombre es obligatorio");
      return;
    }
    if (!editingId && !form.code.trim()) {
      toast.warning("El código es obligatorio");
      return;
    }

    const payload = {
      ...(editingId ? {} : { code: form.code.trim() }),
      name: form.name.trim(),
      priceMonthly: Number(form.priceMonthly),
      maxActiveTournaments: Number(form.maxActiveTournaments),
      maxTeamsPerTournament: Number(form.maxTeamsPerTournament),
      maxMembers: Number(form.maxMembers),
      features: {
        exportPdf: form.exportPdf,
        customBranding: form.customBranding,
        liveMatch: form.liveMatch,
      },
      isActive: form.isActive,
      order: Number(form.order),
    };

    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/admin/plans/${editingId}` : "/api/admin/plans",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (res.ok) {
        toast.success(editingId ? "Plan actualizado" : "Plan creado");
        setDialogOpen(false);
        load();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "No se pudo guardar el plan");
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (plan: PlanRow) => {
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      if (res.ok) {
        toast.success(plan.isActive ? "Plan desactivado" : "Plan activado");
        load();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "No se pudo actualizar el plan");
      }
    } catch {
      toast.error("Ocurrió un error inesperado");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  const planDialogContent = (
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar plan" : "Nuevo plan"}</DialogTitle>
            <DialogDescription>
              Los límites rigen al instante para todas las organizaciones con
              este plan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!editingId && (
              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  placeholder="Ej: PRO"
                  value={form.code}
                  onChange={(e) => update("code", e.target.value.toUpperCase())}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Ej: Plan Pro"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceMonthly">Precio mensual (ARS)</Label>
              <Input
                id="priceMonthly"
                type="number"
                min="0"
                value={form.priceMonthly}
                onChange={(e) => update("priceMonthly", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="maxActiveTournaments">Torneos activos</Label>
                <Input
                  id="maxActiveTournaments"
                  type="number"
                  min="0"
                  value={form.maxActiveTournaments}
                  onChange={(e) =>
                    update("maxActiveTournaments", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTeamsPerTournament">Equipos/torneo</Label>
                <Input
                  id="maxTeamsPerTournament"
                  type="number"
                  min="0"
                  value={form.maxTeamsPerTournament}
                  onChange={(e) =>
                    update("maxTeamsPerTournament", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxMembers">Miembros</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min="0"
                  value={form.maxMembers}
                  onChange={(e) => update("maxMembers", e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
              Usá 999 para representar &quot;ilimitado&quot;.
            </p>

            <div className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
              {/* Estas tres features se anuncian en la landing (pricing-section)
                  pero TODAVÍA NO ESTÁN IMPLEMENTADAS (S6/S8) y nada las
                  restringe: `hasFeature()` existe pero no lo llama nadie.
                  Tildarlas hoy = venderlas sin poder cumplirlas. */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-900/20">
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  <b>Estas funciones todavía no están construidas.</b> Si las
                  activás acá, la página de precios las anuncia y no vas a poder
                  cumplirlas. Dejalas apagadas hasta que existan.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="exportPdf" className="cursor-pointer">
                  Exportar PDF
                </Label>
                <Switch
                  id="exportPdf"
                  checked={form.exportPdf}
                  onCheckedChange={(c) => update("exportPdf", c)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="customBranding" className="cursor-pointer">
                  Marca personalizada
                </Label>
                <Switch
                  id="customBranding"
                  checked={form.customBranding}
                  onCheckedChange={(c) => update("customBranding", c)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="liveMatch" className="cursor-pointer">
                  Partido en vivo
                </Label>
                <Switch
                  id="liveMatch"
                  checked={form.liveMatch}
                  onCheckedChange={(c) => update("liveMatch", c)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
              <Label htmlFor="isActive" className="cursor-pointer">
                Plan activo (visible para contratar)
              </Label>
              <Switch
                id="isActive"
                checked={form.isActive}
                disabled={editingId !== null && form.code === "FREE"}
                onCheckedChange={(c) => update("isActive", c)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-brand to-brand-2 text-white"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
  );

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header - componente compartido (patrón §3 variante B) */}
      <PageHeader
        variant="simple"
        icon={Layers}
        title="Planes"
        description="Precio, límites y features de cada plan"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="brand" onClick={openCreate} className="gap-2">
                <Plus className="w-4 h-4" />
                Nuevo plan
              </Button>
            </DialogTrigger>
            {planDialogContent}
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`border-0 glass-card relative overflow-hidden ${!plan.isActive ? "opacity-60" : ""}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {plan.name}
                  <Badge variant="outline" className="text-xs font-mono">
                    {plan.code}
                  </Badge>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEdit(plan)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-2xl font-bold text-brand">
                ${Number(plan.priceMonthly).toLocaleString("es-AR")}
                <span className="text-sm font-normal text-gray-400">/mes</span>
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>
                  {plan.maxActiveTournaments >= 999
                    ? "Torneos ilimitados"
                    : `${plan.maxActiveTournaments} torneo(s) activo(s)`}
                </li>
                <li>
                  {plan.maxTeamsPerTournament >= 999
                    ? "Equipos ilimitados"
                    : `${plan.maxTeamsPerTournament} equipos por torneo`}
                </li>
                <li>
                  {plan.maxMembers >= 999
                    ? "Miembros ilimitados"
                    : `${plan.maxMembers} miembro(s)`}
                </li>
              </ul>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {plan._count?.subscriptions ?? 0} organización(es)
                </span>
                <button
                  type="button"
                  onClick={() => toggleActive(plan)}
                  disabled={plan.code === "FREE" && plan.isActive}
                  title={
                    plan.code === "FREE" && plan.isActive
                      ? "El plan FREE no se puede desactivar"
                      : undefined
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {plan.isActive ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-green-600">Activo</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-500">Inactivo</span>
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
