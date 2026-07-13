"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  Eye,
  Loader2,
  MapPin,
  Search,
  ShieldBan,
  ShieldCheck,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { setAdminOrgView } from "@modules/organizaciones/actions/adminOrgView";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/formatDate";

interface OrganizationRow {
  id: string;
  name: string;
  slug: string;
  locality: string | null;
  status: "ACTIVA" | "SUSPENDIDA";
  createdAt: string;
  members: number;
  tournaments: number;
  effectivePlan: { code: string; name: string };
  subscription: {
    status: string;
    currentPeriodEnd: string | null;
    contractedPlan: string;
  } | null;
  lastPayment: {
    amount: string;
    currency: string;
    status: string;
    createdAt: string;
  } | null;
}

interface Metrics {
  organizations: {
    total: number;
    active: number;
    suspended: number;
    newLast30Days: number;
  };
  plans: {
    distribution: { code: string; name: string; count: number }[];
    conversionRate: number;
  };
  revenue: { thisMonth: string; currency: string };
  tournaments: { total: number; thisMonth: number };
}

const SUB_STATUS_BADGE: Record<string, string> = {
  ACTIVA: "bg-green-500/15 text-green-600 border-green-500/30",
  VENCIDA: "bg-red-500/15 text-red-600 border-red-500/30",
  CANCELADA: "bg-gray-500/15 text-gray-600 border-gray-500/30",
};

export default function OrganizacionesClient() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<OrganizationRow[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [viewingAs, setViewingAs] = useState<string | null>(null);

  // "Ver como organización" (N3/N10): scopea el panel a esa org
  const viewAs = async (org: OrganizationRow) => {
    setViewingAs(org.id);
    try {
      const res = await setAdminOrgView(org.id);
      if (res.success) {
        toast.success(`Viendo el panel como ${org.name}`);
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        toast.error(res.error ?? "No se pudo activar el modo organización");
      }
    } finally {
      setViewingAs(null);
    }
  };

  const load = useCallback(async () => {
    try {
      const [orgsRes, metricsRes] = await Promise.all([
        fetch("/api/admin/organizations"),
        fetch("/api/admin/metrics"),
      ]);
      if (orgsRes.ok) setOrgs(await orgsRes.json());
      if (metricsRes.ok) setMetrics(await metricsRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStatus = async (org: OrganizationRow) => {
    const nextStatus = org.status === "ACTIVA" ? "SUSPENDIDA" : "ACTIVA";
    setUpdating(org.id);
    try {
      const res = await fetch(`/api/admin/organizations/${org.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        toast.success(
          nextStatus === "SUSPENDIDA"
            ? `${org.name} suspendida`
            : `${org.name} reactivada`,
        );
        load();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "No se pudo actualizar la organización");
      }
    } finally {
      setUpdating(null);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orgs;
    return orgs.filter(
      (o) =>
        o.name.toLowerCase().includes(term) ||
        o.slug.toLowerCase().includes(term) ||
        o.locality?.toLowerCase().includes(term),
    );
  }, [orgs, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header - componente compartido (patrón §3 variante B) */}
      <PageHeader
        variant="simple"
        icon={Building2}
        title="Organizaciones"
        description="Salud del negocio: ligas activas, planes y facturación"
      />

      {/* Métricas SaaS */}
      {metrics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Organizaciones
              </CardTitle>
              <Building2 className="h-4 w-4 text-brand" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.organizations.active}
                <span className="text-sm font-normal text-gray-400">
                  {" "}
                  / {metrics.organizations.total}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {metrics.organizations.suspended} suspendida(s) ·{" "}
                {metrics.organizations.newLast30Days} nueva(s) en 30 días
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Conversión FREE→pago
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-brand" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.plans.conversionRate}%
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {metrics.plans.distribution
                  .filter((p) => p.count > 0)
                  .map((p) => `${p.name}: ${p.count}`)
                  .join(" · ") || "Sin suscripciones"}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Ingresos del mes
              </CardTitle>
              <Wallet className="h-4 w-4 text-brand" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {Number(metrics.revenue.thisMonth).toLocaleString("es-AR")}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Pagos aprobados este mes
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Torneos creados
              </CardTitle>
              <Trophy className="h-4 w-4 text-brand" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.tournaments.total}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {metrics.tournaments.thisMonth} este mes
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Búsqueda */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nombre, slug o localidad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Listado */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-12">
            No se encontraron organizaciones.
          </p>
        ) : (
          filtered.map((org) => (
            <Card key={org.id} className="border-0 glass-card">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">
                        {org.name}
                      </h3>
                      <Badge
                        className={
                          org.status === "ACTIVA"
                            ? "bg-green-500/15 text-green-600 border-green-500/30"
                            : "bg-red-500/15 text-red-600 border-red-500/30"
                        }
                      >
                        {org.status === "ACTIVA" ? "Activa" : "Suspendida"}
                      </Badge>
                      {org.subscription?.status === "VENCIDA" && (
                        <Badge className={SUB_STATUS_BADGE.VENCIDA}>
                          Suscripción vencida
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>/liga/{org.slug}</span>
                      {org.locality && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {org.locality}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {org.members} miembro(s)
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5" />
                        {org.tournaments} torneo(s)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={viewingAs === org.id}
                      onClick={() => viewAs(org)}
                      className="gap-1.5 border-brand/40 text-brand hover:bg-brand/10 dark:border-brand/50 dark:text-brand-mid dark:hover:bg-brand/15"
                    >
                      {viewingAs === org.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                      Ver como
                    </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant={org.status === "ACTIVA" ? "outline" : "default"}
                        size="sm"
                        disabled={updating === org.id}
                        className={
                          org.status === "ACTIVA"
                            ? "gap-1.5 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            : "gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                        }
                      >
                        {updating === org.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : org.status === "ACTIVA" ? (
                          <ShieldBan className="h-3.5 w-3.5" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        )}
                        {org.status === "ACTIVA" ? "Suspender" : "Reactivar"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {org.status === "ACTIVA"
                            ? `¿Suspender ${org.name}?`
                            : `¿Reactivar ${org.name}?`}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {org.status === "ACTIVA"
                            ? "La organización no va a poder crear ni editar torneos, equipos ni jugadores hasta que se reactive. Los datos ya cargados quedan intactos y siguen visibles."
                            : "La organización recupera la capacidad de gestionar sus torneos, equipos y jugadores."}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => toggleStatus(org)}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Plan</p>
                    <p className="font-medium">{org.effectivePlan.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Vencimiento
                    </p>
                    <p className="font-medium">
                      {org.subscription?.currentPeriodEnd
                        ? formatDate(
                            org.subscription.currentPeriodEnd,
                            "dd/MM/yyyy",
                          )
                        : "Sin vencimiento"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Último pago
                    </p>
                    <p className="font-medium">
                      {org.lastPayment ? (
                        <>
                          ${Number(org.lastPayment.amount).toLocaleString("es-AR")}{" "}
                          <span className="text-xs text-gray-400">
                            ({org.lastPayment.status.toLowerCase()},{" "}
                            {formatDate(org.lastPayment.createdAt, "dd/MM/yyyy")})
                          </span>
                        </>
                      ) : (
                        "Sin pagos"
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
