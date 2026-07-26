"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Crown,
  Edit,
  Eye,
  Filter,
  Shield,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { SkeletonTable } from "@/components/shared/Skeletons";
import { StatCard, StatCardGrid } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/formatDate";
import { parseTableParams } from "@/lib/tableParams";
import {
  IUser,
  ROLE_COLORS,
  ROLE_LABELS,
  STATUS_LABELS,
  UserRole,
  UserStatus,
} from "./types";

/**
 * Gestión de usuarios de la plataforma (patrón §4 variante A de UI_PATTERNS:
 * header showcase + KPIs + `<DataTable>` server-side).
 *
 * Era la última tabla del panel sin migrar a M7: 823 líneas donde el mismo
 * archivo hacía de página, tarjeta, fila, barra de filtros y paginador. Todo
 * eso ya lo resuelve `<DataTable>` en modo `server` —incluido el colapso a
 * cards en mobile y el orden por columna—, así que la pantalla se queda solo
 * con lo suyo: qué columnas mostrar y qué hacer en cada fila.
 *
 * Los datos siguen viniendo de `GET /api/users`, que ya paginaba y filtraba
 * server-side y conserva el envelope `{ success, data, meta }` (A7). No se
 * escribió una server action nueva: la ruta es admin-only y su forma es la
 * correcta, cambiarla habría sido mover el problema de lugar.
 */

/** Envelope histórico de las rutas de `users` (A7). */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

/** Fila tal como llega del API: las fechas viajan como string. */
interface ApiUser
  extends Omit<
    IUser,
    "createdAt" | "updatedAt" | "lastLoginAt" | "birthDate" | "emailVerified"
  > {
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
  birthDate?: string | null;
  emailVerified?: string | null;
}

/** Lo que la pantalla usa de `GET /api/users/stats` (agregados de TODA la base). */
interface UserStats {
  overview: { total: number; active: number; pending: number };
  roleDistribution: { admin: number };
}

const EMPTY_STATS: UserStats = {
  overview: { total: 0, active: 0, pending: 0 },
  roleDistribution: { admin: 0 },
};

/** Iniciales para el avatar cuando no hay imagen. */
const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/**
 * Columnas ordenables → el `sortBy` que entiende `GET /api/users`.
 *
 * Solo estas tres llevan `sortValue` en la definición de columnas: el API
 * ordena por `name`, `email`, `createdAt` y `lastLoginAt`, así que hacer
 * clickeable el encabezado de "Rol" o "Estado" prometería un orden que el
 * server no sabe hacer (y en modo server la tabla no ordena en memoria).
 */
const API_SORT: Record<string, string> = {
  user: "name",
  createdAt: "createdAt",
  lastLoginAt: "lastLoginAt",
};

export default function UsersPage() {
  // Estado de la tabla en la URL (M7): compartible por link y leído por el
  // mismo parser que el resto del panel.
  const searchParams = useSearchParams();
  const params = useMemo(
    () =>
      parseTableParams(Object.fromEntries(searchParams.entries()), {
        filterKeys: ["role", "status"],
        pageSize: 12,
        defaultSort: "createdAt",
      }),
    [searchParams],
  );

  // `null` = todavía no llegó la primera respuesta: evita el frame con la tabla
  // vacía y el setState en el cuerpo del effect (react-hooks).
  const [data, setData] = useState<{ rows: ApiUser[]; total: number } | null>(
    null,
  );
  const [stats, setStats] = useState<UserStats>(EMPTY_STATS);
  const [, startFetch] = useTransition();

  const fetchUsers = useCallback(() => {
    startFetch(async () => {
      const qs = new URLSearchParams();
      if (params.q) qs.set("search", params.q);
      if (params.filters.role) qs.set("role", params.filters.role);
      if (params.filters.status) qs.set("status", params.filters.status);
      qs.set("sortBy", API_SORT[params.sort ?? "createdAt"] ?? "createdAt");
      qs.set("sortOrder", params.dir);
      qs.set("page", String(params.page));
      qs.set("limit", String(params.pageSize));

      const [listRes, statsRes] = await Promise.all([
        api.get<ApiResponse<ApiUser[]>>(`/api/users?${qs.toString()}`),
        api.get<ApiResponse<UserStats>>("/api/users/stats"),
      ]);

      if (listRes.ok && listRes.data.success && listRes.data.data) {
        setData({
          rows: listRes.data.data,
          total: listRes.data.meta?.total ?? listRes.data.data.length,
        });
      } else {
        setData({ rows: [], total: 0 });
        toast.error(
          (listRes.ok ? listRes.data.message : listRes.error) ||
            "No se pudieron cargar los usuarios",
        );
      }

      // Los KPIs salen de los agregados de la base, no de la página visible:
      // antes se calculaban con `users.filter(...)` sobre las 12 filas
      // cargadas, así que "Activos" y "Administradores" mentían apenas había
      // más de una página.
      if (statsRes.ok && statsRes.data.success && statsRes.data.data) {
        setStats(statsRes.data.data);
      }
    });
  }, [params]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const isLoading = data === null;
  const rows = data?.rows ?? [];

  const handleDelete = async (userId: string) => {
    const res = await api.del<ApiResponse<unknown>>(`/api/users/${userId}`);
    if (res.ok && res.data?.success) {
      toast.success("Usuario eliminado");
      fetchUsers();
    } else {
      toast.error(
        (res.ok ? res.data?.message : res.error) ||
          "No se pudo eliminar el usuario",
      );
    }
  };

  // Función de render, no componente: declararlo como componente acá adentro
  // lo remontaría en cada render (react-hooks/static-components).
  const renderRowActions = (user: ApiUser) => (
    <>
      <Button
        variant="outline"
        size="icon"
        asChild
        title="Ver usuario"
        className="h-9 w-9 rounded-lg border-blue-300 text-blue-600 transition-all hover:border-blue-400 hover:bg-blue-50 dark:border-blue-500/50 dark:text-blue-400 dark:hover:border-blue-500 dark:hover:bg-blue-500/10"
      >
        <Link href={`/admin/usuarios/${user.id}`}>
          <Eye className="h-4 w-4" />
          <span className="sr-only">Ver {user.name}</span>
        </Link>
      </Button>

      <Button
        variant="outline"
        size="icon"
        asChild
        title="Editar usuario"
        className="h-9 w-9 rounded-lg border-green-300 text-green-600 transition-all hover:border-green-400 hover:bg-green-50 dark:border-green-500/50 dark:text-green-400 dark:hover:border-green-500 dark:hover:bg-green-500/10"
      >
        <Link href={`/admin/usuarios/${user.id}/edit`}>
          <Edit className="h-4 w-4" />
          <span className="sr-only">Editar {user.name}</span>
        </Link>
      </Button>

      <ConfirmDialog
        title="¿Eliminar este usuario?"
        description={
          <>
            <strong>{user.name}</strong> queda marcado como inactivo y deja de
            aparecer en el panel. La cuenta no se borra de Clerk: la operación
            se puede deshacer.
          </>
        }
        confirmLabel="Eliminar"
        tone="danger"
        icon={Trash2}
        onConfirm={() => handleDelete(user.id)}
        trigger={
          <Button
            variant="outline"
            size="icon"
            title="Eliminar usuario"
            className="h-9 w-9 rounded-lg border-red-300 text-red-600 transition-all hover:border-red-400 hover:bg-red-50 dark:border-red-500/50 dark:text-red-400 dark:hover:border-red-500 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar {user.name}</span>
          </Button>
        }
      />
    </>
  );

  const columns: DataTableColumn<ApiUser>[] = [
    {
      id: "user",
      header: "Usuario",
      // `sortValue` habilita el click en el encabezado; en modo server el orden
      // lo resuelve la query, este valor no se usa para ordenar en memoria.
      sortValue: (u) => u.name,
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={user.imageUrl || ""} alt="" />
            <AvatarFallback className="bg-gradient-to-br from-brand to-brand-2 text-sm font-semibold text-white">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate font-medium text-gray-900 dark:text-white">
              {user.name}
            </div>
            <div className="truncate text-sm text-gray-600 dark:text-gray-400">
              {user.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: "Rol",
      cell: (user) => (
        <Badge className={ROLE_COLORS[user.role]}>
          {user.role === UserRole.ADMINISTRADOR && (
            <Crown className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          )}
          {ROLE_LABELS[user.role]}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Estado",
      // El badge de estado sale del design system (F0): mismo color y etiqueta
      // que en cualquier otra pantalla.
      cell: (user) => <StatusBadge entity="user" status={user.status} />,
    },
    {
      id: "createdAt",
      header: "Registro",
      hideBelow: "lg",
      sortValue: (u) => new Date(u.createdAt).getTime(),
      cell: (user) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {formatDate(user.createdAt)}
        </span>
      ),
    },
    {
      id: "lastLoginAt",
      header: "Último acceso",
      hideBelow: "xl",
      sortValue: (u) => (u.lastLoginAt ? new Date(u.lastLoginAt).getTime() : 0),
      cell: (user) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Nunca"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      align: "right",
      hideOnCard: true,
      cell: (user) => (
        <div className="flex justify-end gap-2">{renderRowActions(user)}</div>
      ),
    },
  ];

  return (
    <div className="space-y-8 p-6 sm:p-8">
      <PageHeader
        icon={Users}
        title="Gestión de Usuarios"
        statusText={`Sistema activo · ${stats.overview.total} ${
          stats.overview.total === 1 ? "usuario" : "usuarios"
        }`}
        description="Administra las cuentas de la plataforma. Las cuentas las crea el registro (Clerk), no un alta manual: para sumar gente a una liga usá las invitaciones de Miembros."
        quickStats={[
          {
            icon: UserCheck,
            text: `${stats.overview.active} activos`,
            colorClass:
              "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300",
          },
          {
            icon: Crown,
            text: `${stats.roleDistribution.admin} ${
              stats.roleDistribution.admin === 1
                ? "administrador"
                : "administradores"
            }`,
            colorClass:
              "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
          },
        ]}
        actions={
          <Button variant="outline" asChild className="rounded-xl">
            <Link href="/admin/miembros">
              <Shield className="mr-2 h-4 w-4" />
              Miembros de la liga
            </Link>
          </Button>
        }
      />

      <StatCardGrid>
        <StatCard
          title="Total usuarios"
          value={stats.overview.total}
          description="Cuentas registradas"
          icon={Users}
        />
        <StatCard
          title="Activos"
          value={stats.overview.active}
          description="Pueden usar la plataforma"
          icon={UserCheck}
          gradient="from-green-500 to-emerald-500"
          bgGradient="from-green-500/10 to-emerald-500/10"
        />
        <StatCard
          title="Administradores"
          value={stats.roleDistribution.admin}
          description="Acceso completo al producto"
          icon={Crown}
          gradient="from-amber-400 to-amber-500"
          bgGradient="from-amber-400/10 to-amber-500/10"
        />
        <StatCard
          title="Pendientes"
          value={stats.overview.pending}
          description="Sin activar todavía"
          icon={Filter}
          gradient="from-orange-500 to-amber-500"
          bgGradient="from-orange-500/10 to-amber-500/10"
        />
      </StatCardGrid>

      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : (
        <DataTable
          rows={rows}
          server={{
            total: data?.total ?? 0,
            page: params.page,
            pageSize: params.pageSize,
            q: params.q,
            sort: params.sort,
            dir: params.dir,
            filterValues: {
              role: params.filters.role ?? "all",
              status: params.filters.status ?? "all",
            },
          }}
          columns={columns}
          getRowKey={(u) => u.id}
          icon={Users}
          title="Lista de usuarios"
          description="Buscá por nombre, email, teléfono o localidad"
          searchable={{ placeholder: "Buscar usuarios..." }}
          filters={[
            {
              id: "role",
              label: "Rol",
              icon: Crown,
              options: [
                { value: "all", label: "Todos los roles" },
                ...Object.values(UserRole).map((role) => ({
                  value: role,
                  label: ROLE_LABELS[role],
                })),
              ],
            },
            {
              id: "status",
              label: "Estado",
              icon: Filter,
              options: [
                { value: "all", label: "Todos los estados" },
                ...Object.values(UserStatus).map((status) => ({
                  value: status,
                  label: STATUS_LABELS[status],
                })),
              ],
            },
          ]}
          empty={{
            icon: Users,
            title: "Todavía no hay usuarios",
            description: "Las cuentas aparecen acá cuando alguien se registra.",
            filteredTitle: "No se encontraron usuarios",
            filteredDescription:
              "Ningún usuario coincide con los filtros aplicados.",
          }}
          rowActions={renderRowActions}
        />
      )}
    </div>
  );
}
