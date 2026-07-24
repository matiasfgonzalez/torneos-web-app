import type { Metadata } from "next";
import { validatePanelAccess } from "@/lib/roleValidation";
import { PageHeader } from "@/components/shared/PageHeader";
import { ScrollText, Activity, Clock } from "lucide-react";
import {
  getAuditLogsPaged,
  getAuditLogsStats,
} from "@modules/auditoria/actions/getAuditLogs";
import { parseTableParams, type RawSearchParams } from "@/lib/tableParams";
import { AuditoriaTable } from "./AuditoriaTable";

export const metadata: Metadata = {
  title: "Auditoría | GOLAZO Admin",
};

// Registro de plataforma — solo dinámico, nunca prerender.
export const dynamic = "force-dynamic";

/**
 * Vista de auditoría (M8): registro de las mutaciones sensibles (bajas, cambios
 * de rol, resultados, suspensiones). Solo ADMINISTRADOR de plataforma. Tabla
 * server-side (M7): estado en la URL (`?q`/`?entity`/`?action`/`?page`).
 */
export default async function AuditoriaPage({
  searchParams,
}: Readonly<{ searchParams: Promise<RawSearchParams> }>) {
  await validatePanelAccess({ adminOnly: true });

  const sp = await searchParams;
  const params = parseTableParams(sp, {
    filterKeys: ["entity", "action"],
    defaultSort: "createdAt",
    defaultDir: "desc",
  });

  const [{ rows, total }, stats] = await Promise.all([
    getAuditLogsPaged(params),
    getAuditLogsStats(),
  ]);

  return (
    <div className="space-y-8 p-6 sm:p-8">
      <PageHeader
        variant="simple"
        icon={ScrollText}
        title="Auditoría"
        description="Historial de acciones sensibles realizadas en el panel de la plataforma"
        quickStats={[
          {
            icon: Activity,
            text: `${stats.total} ${stats.total === 1 ? "acción" : "acciones"}`,
            colorClass:
              "bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand",
          },
          {
            icon: Clock,
            text: `${stats.last24h} en 24 h`,
            colorClass:
              "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
          },
        ]}
      />

      <AuditoriaTable
        rows={rows}
        server={{
          total,
          page: params.page,
          pageSize: params.pageSize,
          q: params.q,
          sort: params.sort,
          dir: params.dir,
          filterValues: {
            entity: params.filters.entity ?? "all",
            action: params.filters.action ?? "all",
          },
        }}
      />
    </div>
  );
}
