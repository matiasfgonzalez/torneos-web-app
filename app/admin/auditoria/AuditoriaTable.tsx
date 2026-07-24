"use client";

import { SmartImage } from "@/components/shared/SmartImage";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type DataTableColumn,
  type DataTableServer,
} from "@/components/shared/DataTable";
import { formatDate } from "@/lib/formatDate";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
  AuditAction,
  AuditEntity,
} from "@/lib/audit-constants";
import { ScrollText, Shield, User as UserIcon } from "lucide-react";
import type { AuditLogRow } from "@modules/auditoria/actions/getAuditLogs";

/** Color del badge de acción según su severidad. */
const ACTION_BADGE: Record<string, string> = {
  DELETE:
    "border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300",
  ROLE_CHANGE:
    "border-purple-200 bg-purple-100 text-purple-800 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  STATUS_CHANGE:
    "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  RESTORE:
    "border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300",
  MATCH_RESULT:
    "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  UPDATE:
    "border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function AuditoriaTable({
  rows,
  server,
}: Readonly<{ rows: AuditLogRow[]; server: DataTableServer }>) {
  const columns: DataTableColumn<AuditLogRow>[] = [
    {
      id: "createdAt",
      header: "Fecha",
      sortValue: (r) => new Date(r.createdAt).getTime(),
      cardLabel: "Fecha",
      cell: (r) => (
        <span className="whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
          {formatDate(r.createdAt, "dd/MM/yyyy HH:mm")}
        </span>
      ),
    },
    {
      id: "user",
      header: "Autor",
      cell: (r) =>
        r.user ? (
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
              {r.user.imageUrl ? (
                <SmartImage
                  src={r.user.imageUrl}
                  alt=""
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  <UserIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {r.user.name ?? "Sin nombre"}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {r.user.email}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">
            Sistema
          </span>
        ),
    },
    {
      id: "action",
      header: "Acción",
      cell: (r) => (
        <Badge variant="outline" className={ACTION_BADGE[r.action] ?? ACTION_BADGE.UPDATE}>
          {AUDIT_ACTION_LABELS[r.action] ?? r.action}
        </Badge>
      ),
    },
    {
      id: "entity",
      header: "Entidad",
      hideBelow: "lg",
      cell: (r) => (
        <div className="text-sm">
          <span className="font-medium text-gray-900 dark:text-white">
            {AUDIT_ENTITY_LABELS[r.entity] ?? r.entity}
          </span>
          <span className="ml-1 font-mono text-xs text-gray-400 dark:text-gray-500">
            {r.entityId.slice(0, 8)}…
          </span>
        </div>
      ),
    },
    {
      id: "payload",
      header: "Detalle",
      hideBelow: "xl",
      cardLabel: "Detalle",
      cell: (r) =>
        r.payload ? (
          <details className="group max-w-xs">
            <summary className="cursor-pointer text-xs font-medium text-brand hover:text-brand-mid">
              Ver cambios
            </summary>
            <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-gray-50 p-2 text-[11px] leading-relaxed text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {JSON.stringify(r.payload, null, 2)}
            </pre>
          </details>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">—</span>
        ),
    },
  ];

  const entityOptions = [
    { value: "all", label: "Todas" },
    ...Object.values(AuditEntity).map((e) => ({
      value: e,
      label: AUDIT_ENTITY_LABELS[e] ?? e,
    })),
  ];
  const actionOptions = [
    { value: "all", label: "Todas" },
    ...Object.values(AuditAction).map((a) => ({
      value: a,
      label: AUDIT_ACTION_LABELS[a] ?? a,
    })),
  ];

  return (
    <DataTable
      rows={rows}
      server={server}
      columns={columns}
      getRowKey={(r) => r.id}
      icon={ScrollText}
      title="Registro de actividad"
      description="Acciones sensibles del panel: bajas, cambios de rol, resultados y estados"
      searchable={{ placeholder: "Buscar por autor o ID de entidad…" }}
      filters={[
        {
          id: "entity",
          label: "Entidad",
          icon: Shield,
          options: entityOptions,
        },
        {
          id: "action",
          label: "Acción",
          icon: ScrollText,
          options: actionOptions,
        },
      ]}
      empty={{
        icon: ScrollText,
        title: "Sin actividad registrada",
        description:
          "Todavía no hay acciones auditadas. Aparecerán acá a medida que se gestione la plataforma.",
        filteredTitle: "Sin resultados",
        filteredDescription: "Ninguna acción coincide con los filtros aplicados.",
      }}
    />
  );
}
