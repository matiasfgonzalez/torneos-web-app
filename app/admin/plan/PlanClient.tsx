"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CloudinaryUpload } from "@/components/ui/cloudinary-upload";
import { formatDate } from "@/lib/formatDate";
import { toast } from "sonner";
import {
  CreditCard,
  Crown,
  Loader2,
  Receipt,
  Clock,
  Landmark,
  AlertTriangle,
} from "lucide-react";

interface PlanInfo {
  id: string;
  code: string;
  name: string;
  priceMonthly: string;
  currency: string;
  maxActiveTournaments: number;
  maxTeamsPerTournament: number;
  maxMembers: number;
}

interface SubscriptionInfo {
  organization: { id: string; name: string };
  subscription: {
    status: string;
    currentPeriodEnd: string | null;
    contractedPlan: { code: string; name: string };
  };
  effectivePlan: {
    code: string;
    name: string;
    maxActiveTournaments: number;
    maxTeamsPerTournament: number;
    maxMembers: number;
  };
  usage: { activeTournaments: number; members: number };
}

interface PaymentRow {
  id: string;
  amount: string;
  currency: string;
  periodMonths: number;
  method: string;
  status: string;
  createdAt: string;
  reviewNotes?: string | null;
}

interface PaymentInfo {
  alias: string | null;
  holder: string | null;
  instructions: string | null;
}

export default function PlanClient({
  initialPlan = "",
  paymentInfo,
}: Readonly<{
  /** Plan preseleccionado desde el pricing/wizard (`?plan=PRO`, N14d). */
  initialPlan?: string;
  /** Datos de cobro configurables (N5) — a dónde transfiere la liga. */
  paymentInfo?: PaymentInfo;
}>) {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario de pago
  const [selectedPlan, setSelectedPlan] = useState<string>(initialPlan);
  const [months, setMonths] = useState("1");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptPublicId, setReceiptPublicId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [subRes, plansRes, paysRes] = await Promise.all([
        fetch("/api/org/subscription"),
        fetch("/api/plans"),
        fetch("/api/payments"),
      ]);
      if (subRes.ok) setInfo(await subRes.json());
      if (plansRes.ok) setPlans(await plansRes.json());
      if (paysRes.ok) setPayments(await paysRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submitPayment = async () => {
    if (!selectedPlan) {
      toast.warning("Elegí un plan");
      return;
    }
    if (!receiptUrl) {
      toast.warning("Adjuntá el comprobante de la transferencia");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: selectedPlan,
          periodMonths: Number(months),
          method: "TRANSFERENCIA",
          receiptUrl,
          receiptPublicId,
          notes: notes || undefined,
        }),
      });
      if (res.ok) {
        toast.success(
          "Pago informado. Te avisamos cuando sea aprobado por el administrador.",
        );
        setReceiptUrl(null);
        setReceiptPublicId(null);
        setNotes("");
        load();
      } else {
        const data = await res.json();
        toast.error(data.error || "No se pudo informar el pago");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  const paidPlans = plans.filter((p) => Number(p.priceMonthly) > 0);
  // Derivado al renderizar (no useEffect): si `initialPlan` vino con un código
  // inexistente por la URL, simplemente no hay selección — sin estado roto.
  const selected = paidPlans.find((p) => p.code === selectedPlan);
  // Un solo pago pendiente a la vez (el server también lo exige): mientras hay
  // uno en revisión, no se informa otro.
  const hasPending = payments.some((p) => p.status === "PENDIENTE");
  const hasPaymentData = !!paymentInfo?.alias;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header - componente compartido (patrón §3 variante B) */}
      <PageHeader
        variant="simple"
        icon={Crown}
        title="Plan y Facturación"
        description={info?.organization.name}
      />

      {/* Plan actual */}
      {info && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand" />
              Plan actual: {info.effectivePlan.name}
              {info.subscription.status === "VENCIDA" && (
                <Badge className="bg-red-500/15 text-red-600 border-red-500/30">
                  Suscripción vencida — límites de plan Gratis
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">Torneos activos</p>
              <p className="text-2xl font-bold">
                {info.usage.activeTournaments}
                <span className="text-sm font-normal text-gray-400">
                  {" "}
                  / {info.effectivePlan.maxActiveTournaments}
                </span>
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">Miembros</p>
              <p className="text-2xl font-bold">
                {info.usage.members}
                <span className="text-sm font-normal text-gray-400">
                  {" "}
                  / {info.effectivePlan.maxMembers}
                </span>
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">Vencimiento</p>
              <p className="text-lg font-bold">
                {info.subscription.currentPeriodEnd
                  ? formatDate(info.subscription.currentPeriodEnd, "dd/MM/yyyy")
                  : "Sin vencimiento"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contratar / renovar */}
      <Card>
        <CardHeader>
          <CardTitle>Contratar o renovar un plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasPending && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
              <Clock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">Tenés un pago en revisión</p>
                <p>
                  Cuando el administrador lo apruebe, tu plan se activa
                  automáticamente. Mientras tanto no podés informar otro pago.
                </p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paidPlans.map((plan) => (
              <button
                key={plan.code}
                type="button"
                onClick={() => setSelectedPlan(plan.code)}
                className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedPlan === plan.code
                    ? "border-brand bg-brand/5 shadow-lg shadow-brand/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-brand/50"
                }`}
              >
                <p className="font-bold text-lg">{plan.name}</p>
                <p className="text-2xl font-bold text-brand">
                  ${Number(plan.priceMonthly).toLocaleString("es-AR")}
                  <span className="text-sm font-normal text-gray-400">
                    /mes
                  </span>
                </p>
                <ul className="mt-3 text-sm text-gray-600 dark:text-gray-300 space-y-1">
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
                      : `${plan.maxMembers} miembros`}
                  </li>
                </ul>
              </button>
            ))}
          </div>

          {selected && (
            <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Meses a pagar</p>
                  <Select value={months} onValueChange={setMonths}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["1", "3", "6", "12"].map((m) => (
                        <SelectItem key={m} value={m}>
                          {m} {m === "1" ? "mes" : "meses"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Total a transferir</p>
                  <p className="text-2xl font-bold text-brand">
                    $
                    {(Number(selected.priceMonthly) * Number(months)).toLocaleString(
                      "es-AR",
                    )}
                  </p>
                </div>
              </div>

              {/* Datos de cobro configurables (N5): a dónde transferir. */}
              {hasPaymentData ? (
                <div className="space-y-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-900/20 dark:text-blue-100">
                  <p className="font-semibold">
                    Transferí ${" "}
                    {(
                      Number(selected.priceMonthly) * Number(months)
                    ).toLocaleString("es-AR")}{" "}
                    a:
                  </p>
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="font-mono text-base font-bold tracking-wide">
                      {paymentInfo!.alias}
                    </span>
                  </div>
                  {paymentInfo!.holder && (
                    <p>
                      Titular:{" "}
                      <span className="font-medium">{paymentInfo!.holder}</span>
                    </p>
                  )}
                  {paymentInfo!.instructions && (
                    <p className="text-blue-800 dark:text-blue-200">
                      {paymentInfo!.instructions}
                    </p>
                  )}
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Subí el comprobante acá abajo. El administrador lo aprueba y
                    el plan se activa.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
                  <AlertTriangle
                    className="mt-0.5 h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />
                  <p>
                    La plataforma todavía no publicó los datos para transferir.
                    Escribinos por los canales de contacto para coordinar el pago.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Comprobante <span className="text-red-500">*</span>
                </p>
                <CloudinaryUpload
                  folder="pagos/comprobantes"
                  value={receiptUrl}
                  publicId={receiptPublicId}
                  onChange={(url, publicId) => {
                    setReceiptUrl(url);
                    setReceiptPublicId(publicId);
                  }}
                  placeholder="Arrastrá el comprobante de transferencia"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Obligatorio: es lo que el administrador verifica para aprobar
                  el pago.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Nota (opcional)</p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: transferido desde la cuenta de Juan Pérez"
                  rows={2}
                />
              </div>

              <Button
                onClick={submitPayment}
                disabled={
                  submitting || hasPending || !hasPaymentData || !receiptUrl
                }
                className="bg-gradient-to-r from-brand to-brand-2 text-white cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Receipt className="w-4 h-4 mr-2" />
                )}
                Informar pago
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de pagos</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-gray-500">Todavía no informaste pagos.</p>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm"
                >
                  <div>
                    <p className="font-medium">
                      ${Number(p.amount).toLocaleString("es-AR")} ·{" "}
                      {p.periodMonths} mes(es) · {p.method}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {formatDate(p.createdAt, "dd/MM/yyyy HH:mm")}
                      {p.reviewNotes && ` — ${p.reviewNotes}`}
                    </p>
                  </div>
                  <StatusBadge entity="payment" status={p.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
