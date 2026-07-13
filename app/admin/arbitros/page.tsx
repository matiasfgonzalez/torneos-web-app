"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  getReferees,
  deleteReferee,
  toggleRefereeEnabled,
} from "@modules/arbitros/actions/actions";
import {
  IReferee,
  REFEREE_STATUS_LABELS,
  REFEREE_STATUS_COLORS,
} from "@modules/arbitros/types";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Trash2,
  Award,
  Phone,
  Mail,
  Users,
  TrendingUp,
  Power,
  PowerOff,
  AlertTriangle,
  Eye,
  EyeOff,
  Shield,
  MapPin,
  Activity,
} from "lucide-react";
import DialogReferee from "./DialogReferee";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { SkeletonTable } from "@/components/shared/Skeletons";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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

export default function RefereesPage() {
  // `null` = todavía no cargó nunca (skeleton). El pendiente de la transición
  // cubre los refetch: así no hay setState síncrono adentro del effect
  // (react-hooks/set-state-in-effect).
  const [referees, setReferees] = useState<IReferee[] | null>(null);
  const [showDisabled, setShowDisabled] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isRefetching, startRefetch] = useTransition();

  const fetchReferees = useCallback(() => {
    startRefetch(async () => {
      const res = await getReferees(showDisabled, false);
      setReferees(res.success ? (res.data as IReferee[]) : []);
    });
  }, [showDisabled]);

  useEffect(() => {
    fetchReferees();
  }, [fetchReferees]);

  const isLoading = referees === null;
  const list = referees ?? [];

  const handleDelete = async (id: string, name: string) => {
    setActionLoading(id);
    const res = await deleteReferee(id, false);
    if (res.success) {
      toast.success(`${name} eliminado correctamente`);
      fetchReferees();
    } else {
      toast.error(res.error);
    }
    setActionLoading(null);
  };

  const handleToggleEnabled = async (id: string) => {
    setActionLoading(id);
    const res = await toggleRefereeEnabled(id);
    if (res.success) {
      toast.success(res.message);
      fetchReferees();
    } else {
      toast.error(res.error);
    }
    setActionLoading(null);
  };

  // Estadísticas
  const totalMatches = list.reduce((sum, r) => sum + (r._count?.matches || 0), 0);
  const activeReferees = list.filter(
    (r) => r.enabled && r.status === "ACTIVO",
  ).length;
  const inactiveReferees = list.filter(
    (r) => !r.enabled || r.status !== "ACTIVO",
  ).length;

  // Función de render, no componente: si se declarara como componente adentro
  // del render, React lo remontaría en cada render (react-hooks/static-components).
  const renderRowActions = (referee: IReferee) => (
    <>
      <DialogReferee mode="edit" referee={referee} onSuccess={fetchReferees} />

      <Button
        variant="outline"
        size="icon"
        onClick={() => handleToggleEnabled(referee.id)}
        disabled={actionLoading === referee.id}
        className={`h-9 w-9 rounded-lg transition-all ${
          referee.enabled
            ? "border-amber-300 dark:border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:border-amber-400 dark:hover:border-amber-500"
            : "border-green-300 dark:border-green-500/50 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 hover:border-green-400 dark:hover:border-green-500"
        }`}
        title={referee.enabled ? "Deshabilitar" : "Habilitar"}
      >
        {actionLoading === referee.id ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : referee.enabled ? (
          <PowerOff className="w-4 h-4" />
        ) : (
          <Power className="w-4 h-4" />
        )}
        <span className="sr-only">
          {referee.enabled ? "Deshabilitar" : "Habilitar"} {referee.name}
        </span>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={actionLoading === referee.id}
            className="h-9 w-9 rounded-lg border-red-300 dark:border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-400 dark:hover:border-red-500 transition-all"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Eliminar {referee.name}</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 dark:bg-red-500/20 rounded-xl border border-red-200 dark:border-red-500/30">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <AlertDialogTitle>¿Eliminar árbitro?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              Esta acción eliminará a{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {referee.name}
              </span>{" "}
              del sistema.
              {(referee._count?.matches || 0) > 0 && (
                <span className="text-amber-600 dark:text-amber-400 block mt-2">
                  Este árbitro tiene {referee._count?.matches} partido(s)
                  asignado(s). Se realizará una eliminación lógica.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(referee.id, referee.name)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  const columns: DataTableColumn<IReferee>[] = [
    {
      id: "referee",
      header: "Árbitro",
      sortValue: (r) => r.name,
      cell: (referee) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-600 shrink-0">
            {referee.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={referee.imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <Shield className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {referee.name}
            </p>
            {referee.nationality && (
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{referee.nationality}</span>
              </p>
            )}
            {!referee.enabled && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Deshabilitado
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contacto",
      hideBelow: "lg",
      cell: (referee) => (
        <div className="flex flex-col gap-1 text-sm">
          {referee.email && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Mail className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="truncate max-w-45">{referee.email}</span>
            </div>
          )}
          {referee.phone && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Phone className="w-3 h-3 text-gray-400 shrink-0" />
              {referee.phone}
            </div>
          )}
          {!referee.email && !referee.phone && (
            <span className="text-gray-400 dark:text-gray-600">—</span>
          )}
        </div>
      ),
    },
    {
      id: "level",
      header: "Nivel",
      hideBelow: "xl",
      sortValue: (r) => r.certificationLevel ?? "",
      cell: (referee) =>
        referee.certificationLevel ? (
          <Badge className="bg-gradient-to-r from-brand to-brand-mid text-white border-0">
            {referee.certificationLevel}
          </Badge>
        ) : (
          <span className="text-gray-400 dark:text-gray-600">—</span>
        ),
    },
    {
      id: "status",
      header: "Estado",
      align: "center",
      sortValue: (r) => r.status,
      cell: (referee) => (
        <Badge
          variant="outline"
          className={`${REFEREE_STATUS_COLORS[referee.status]} border`}
        >
          {REFEREE_STATUS_LABELS[referee.status]}
        </Badge>
      ),
    },
    {
      id: "matches",
      header: "Partidos",
      align: "center",
      sortValue: (r) => r._count?.matches ?? 0,
      cardLabel: "Partidos dirigidos",
      cell: (referee) => (
        <Badge
          variant="secondary"
          className="font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          {referee._count?.matches || 0}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      align: "right",
      hideOnCard: true,
      cell: (referee) => (
        <div className="flex justify-end gap-2">{renderRowActions(referee)}</div>
      ),
    },
  ];

  return (
    <div className="space-y-8 p-6 sm:p-8">
      {/* Header - componente compartido (patrón §3 variante A) */}
      <PageHeader
        icon={Award}
        title="Panel de Árbitros"
        statusText={`Sistema activo · ${list.length} árbitros registrados`}
        description="Gestiona el cuerpo arbitral de tus torneos. Agrega, edita, habilita/deshabilita y administra los árbitros."
        quickStats={[
          {
            icon: Power,
            text: `${activeReferees} activos`,
            colorClass:
              "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
          },
          {
            icon: PowerOff,
            text: `${inactiveReferees} inactivos`,
            colorClass:
              "bg-gray-50 dark:bg-gray-700/30 text-gray-600 dark:text-gray-300",
          },
          {
            icon: TrendingUp,
            text: `${totalMatches} partidos dirigidos`,
          },
        ]}
        actions={<DialogReferee mode="create" onSuccess={fetchReferees} />}
      />

      {isLoading ? (
        <SkeletonTable rows={5} />
      ) : (
        <DataTable
          rows={list}
          columns={columns}
          getRowKey={(r) => r.id}
          icon={Users}
          title="Lista de Árbitros"
          description="Gestiona el cuerpo arbitral registrado en la plataforma"
          searchable={{
            placeholder: "Buscar por nombre, email o teléfono...",
            getText: (r) => `${r.name} ${r.email ?? ""} ${r.phone ?? ""}`,
          }}
          filters={[
            {
              id: "status",
              label: "Estado",
              icon: Activity,
              options: [
                { value: "all", label: "Todos" },
                ...Object.entries(REFEREE_STATUS_LABELS).map(
                  ([value, label]) => ({ value, label }),
                ),
              ],
              test: (referee, value) => referee.status === value,
            },
          ]}
          // Los deshabilitados se traen (o no) del server: es un refetch, no un
          // filtro de cliente, por eso va acá y no en `filters`.
          actions={
            <Button
              variant="outline"
              onClick={() => setShowDisabled(!showDisabled)}
              disabled={isRefetching}
              className={`h-11 px-4 rounded-xl border-2 transition-all ${
                showDisabled
                  ? "border-green-500/50 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              {showDisabled ? (
                <Eye className="w-4 h-4 mr-2" />
              ) : (
                <EyeOff className="w-4 h-4 mr-2" />
              )}
              {showDisabled ? "Mostrando todos" : "Solo habilitados"}
            </Button>
          }
          empty={{
            icon: Award,
            title: "Todavía no hay árbitros",
            description: "Comenzá registrando tu primer árbitro.",
            filteredTitle: "No se encontraron árbitros",
            filteredDescription:
              "Ningún árbitro coincide con los filtros aplicados.",
          }}
          rowActions={renderRowActions}
        />
      )}
    </div>
  );
}
