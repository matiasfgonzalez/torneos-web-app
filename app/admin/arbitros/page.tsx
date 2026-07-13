"use client";

import { useEffect, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Trash2,
  Search,
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
} from "lucide-react";
import DialogReferee from "./DialogReferee";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RefereesPage() {
  const [referees, setReferees] = useState<IReferee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDisabled, setShowDisabled] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReferees = async () => {
    setIsLoading(true);
    const res = await getReferees(showDisabled, false);
    if (res.success) {
      setReferees(res.data as IReferee[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReferees();
  }, [showDisabled]);

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

  // Filtrar árbitros
  const filteredReferees = referees.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone?.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Estadísticas
  const totalMatches = referees.reduce(
    (sum, r) => sum + (r._count?.matches || 0),
    0,
  );
  const activeReferees = referees.filter(
    (r) => r.enabled && r.status === "ACTIVO",
  ).length;
  const inactiveReferees = referees.filter(
    (r) => !r.enabled || r.status !== "ACTIVO",
  ).length;

  return (
    <div className="space-y-8 p-6 sm:p-8">
      {/* Header - componente compartido (patrón §3 variante A) */}
      <PageHeader
        icon={Award}
        title="Panel de Árbitros"
        statusText={`Sistema activo · ${referees.length} árbitros registrados`}
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

      {/* Lista de árbitros */}
      <Card className="border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-brand to-brand-mid" />

        <CardHeader className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand/10 dark:bg-brand/20 rounded-lg">
              <Users className="w-5 h-5 text-brand" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Lista de Árbitros
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                {filteredReferees.length} de {referees.length} árbitros
              </CardDescription>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-white dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 hover:border-brand/50 focus:border-brand rounded-xl transition-colors"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 h-11 bg-white dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 hover:border-brand/50 rounded-xl">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(REFEREE_STATUS_LABELS).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowDisabled(!showDisabled)}
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
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-brand mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Cargando árbitros...
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-brand" />
                        Árbitro
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                      Contacto
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                      Nivel
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-center">
                      Estado
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-center">
                      Partidos
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-right">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReferees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                            <Award className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
                              No se encontraron árbitros
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                              {searchTerm
                                ? "Intenta con otros términos de búsqueda"
                                : "Comienza registrando tu primer árbitro"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReferees.map((referee) => (
                      <TableRow
                        key={referee.id}
                        className={`border-gray-100 dark:border-gray-700 transition-colors ${
                          referee.enabled
                            ? "hover:bg-gray-50/80 dark:hover:bg-gray-800/50"
                            : "bg-gray-50/50 dark:bg-gray-900/30 opacity-60"
                        }`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-600">
                              {referee.imageUrl ? (
                                <img
                                  src={referee.imageUrl}
                                  alt={referee.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Shield className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {referee.name}
                              </p>
                              {referee.nationality && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {referee.nationality}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            {referee.email && (
                              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="truncate max-w-[180px]">
                                  {referee.email}
                                </span>
                              </div>
                            )}
                            {referee.phone && (
                              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <Phone className="w-3 h-3 text-gray-400" />
                                {referee.phone}
                              </div>
                            )}
                            {!referee.email && !referee.phone && (
                              <span className="text-gray-400 dark:text-gray-600">
                                -
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {referee.certificationLevel ? (
                            <Badge className="bg-gradient-to-r from-brand to-brand-mid text-white border-0">
                              {referee.certificationLevel}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={`${REFEREE_STATUS_COLORS[referee.status]} border`}
                          >
                            {REFEREE_STATUS_LABELS[referee.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="secondary"
                            className="font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                          >
                            {referee._count?.matches || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* Botón Editar */}
                            <DialogReferee
                              mode="edit"
                              referee={referee}
                              onSuccess={fetchReferees}
                            />

                            {/* Botón Habilitar/Deshabilitar */}
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
                              title={
                                referee.enabled ? "Deshabilitar" : "Habilitar"
                              }
                            >
                              {actionLoading === referee.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : referee.enabled ? (
                                <PowerOff className="w-4 h-4" />
                              ) : (
                                <Power className="w-4 h-4" />
                              )}
                            </Button>

                            {/* Botón Eliminar */}
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
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-500/10 dark:bg-red-500/20 rounded-xl border border-red-200 dark:border-red-500/30">
                                      <AlertTriangle className="w-6 h-6 text-red-500" />
                                    </div>
                                    <AlertDialogTitle>
                                      ¿Eliminar árbitro?
                                    </AlertDialogTitle>
                                  </div>
                                  <AlertDialogDescription className="pt-2">
                                    Esta acción eliminará a{" "}
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                      {referee.name}
                                    </span>{" "}
                                    del sistema.
                                    {(referee._count?.matches || 0) > 0 && (
                                      <span className="text-amber-600 dark:text-amber-400 block mt-2">
                                        ⚠️ Este árbitro tiene{" "}
                                        {referee._count?.matches} partido(s)
                                        asignado(s). Se realizará una
                                        eliminación lógica.
                                      </span>
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-3 mt-2">
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDelete(referee.id, referee.name)
                                    }
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
