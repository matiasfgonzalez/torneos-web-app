"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/formatDate";
import { toast } from "sonner";
import { BadgeCheck, BadgeX, Loader2, Wallet } from "lucide-react";

interface AdminPayment {
  id: string;
  amount: string;
  currency: string;
  periodMonths: number;
  method: string;
  status: string;
  notes?: string | null;
  reviewNotes?: string | null;
  receiptUrl?: string | null;
  createdAt: string;
  subscription: {
    organization: { id: string; name: string; slug: string };
    plan: { code: string; name: string };
  };
}

const STATUS_BADGE: Record<string, string> = {
  PENDIENTE: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30",
  APROBADO: "bg-green-500/15 text-green-600 border-green-500/30",
  RECHAZADO: "bg-red-500/15 text-red-600 border-red-500/30",
};

export default function PagosAdminPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/payments");
      if (res.ok) setPayments(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (id: string, action: "APROBAR" | "RECHAZAR") => {
    try {
      setReviewing(id);
      const res = await fetch(`/api/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reviewNotes: rejectNotes[id] || undefined,
        }),
      });
      if (res.ok) {
        toast.success(
          action === "APROBAR"
            ? "Pago aprobado — suscripción activada"
            : "Pago rechazado",
        );
        load();
      } else {
        const data = await res.json();
        toast.error(data.error || "No se pudo revisar el pago");
      }
    } finally {
      setReviewing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#ad45ff]" />
      </div>
    );
  }

  const pending = payments.filter((p) => p.status === "PENDIENTE");
  const reviewed = payments.filter((p) => p.status !== "PENDIENTE");

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-2xl flex items-center justify-center shadow-lg">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
            Aprobación de Pagos
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {pending.length} pendiente(s)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pendientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pending.length === 0 && (
            <p className="text-sm text-gray-500">No hay pagos pendientes.</p>
          )}
          {pending.map((p) => (
            <div
              key={p.id}
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold">
                    {p.subscription.organization.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ${Number(p.amount).toLocaleString("es-AR")} ·{" "}
                    {p.periodMonths} mes(es) · {p.method} ·{" "}
                    {formatDate(p.createdAt, "dd/MM/yyyy HH:mm")}
                  </p>
                  {p.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Nota: {p.notes}
                    </p>
                  )}
                </div>
                <Badge className={STATUS_BADGE[p.status]}>{p.status}</Badge>
              </div>

              {p.receiptUrl ? (
                <a
                  href={p.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-fit"
                >
                  <Image
                    src={p.receiptUrl}
                    alt="Comprobante de pago"
                    width={280}
                    height={180}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 object-cover"
                  />
                </a>
              ) : (
                <p className="text-sm text-orange-500">Sin comprobante</p>
              )}

              <Textarea
                placeholder="Motivo (obligatorio si rechazás)"
                rows={2}
                value={rejectNotes[p.id] ?? ""}
                onChange={(e) =>
                  setRejectNotes((prev) => ({ ...prev, [p.id]: e.target.value }))
                }
              />

              <div className="flex gap-3">
                <Button
                  onClick={() => review(p.id, "APROBAR")}
                  disabled={reviewing === p.id}
                  className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                >
                  <BadgeCheck className="w-4 h-4 mr-2" />
                  Aprobar
                </Button>
                <Button
                  onClick={() => review(p.id, "RECHAZAR")}
                  disabled={reviewing === p.id || !rejectNotes[p.id]?.trim()}
                  variant="destructive"
                  className="cursor-pointer"
                >
                  <BadgeX className="w-4 h-4 mr-2" />
                  Rechazar
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
        </CardHeader>
        <CardContent>
          {reviewed.length === 0 ? (
            <p className="text-sm text-gray-500">Sin pagos revisados aún.</p>
          ) : (
            <div className="space-y-3">
              {reviewed.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {p.subscription.organization.name} — $
                      {Number(p.amount).toLocaleString("es-AR")} ·{" "}
                      {p.periodMonths} mes(es)
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {formatDate(p.createdAt, "dd/MM/yyyy HH:mm")}
                      {p.reviewNotes && ` — ${p.reviewNotes}`}
                    </p>
                  </div>
                  <Badge className={STATUS_BADGE[p.status] ?? ""}>
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
