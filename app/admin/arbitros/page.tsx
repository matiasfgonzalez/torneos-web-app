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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="space-y-8 p-6 sm:p-8">
        {/* Header Premium Golazo */}
        <div className="relative">
          {/* Efectos de fondo */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-tr from-[#ad45ff]/10 to-[#c77dff]/5 rounded-full blur-3xl pointer-events-none" />

          <Card className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 shadow-2xl shadow-black/50 rounded-2xl overflow-hidden">
            {/* Barra de acento */}
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />

            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#ad45ff] to-[#c77dff] rounded-xl shadow-lg shadow-[#ad45ff]/30">
                      <Award className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                        Panel de Árbitros
                      </h1>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <p className="text-gray-400 font-medium">
                          Sistema activo · {referees.length} árbitros
                          registrados
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 max-w-2xl leading-relaxed">
                    Gestiona el cuerpo arbitral de tus torneos. Agrega, edita,
                    habilita/deshabilita y administra los árbitros.
                  </p>

                  {/* Stats rápidos */}
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                      <Power className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-400">
                        {activeReferees} activos
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-500/10 border border-gray-500/20 px-4 py-2 rounded-xl">
                      <PowerOff className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-400">
                        {inactiveReferees} inactivos
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-semibold text-amber-400">
                        {totalMatches} partidos dirigidos
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-auto">
                  <DialogReferee mode="create" onSuccess={fetchReferees} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de árbitros */}
        <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 shadow-xl rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#ad45ff] to-[#c77dff]" />

          <CardHeader className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#ad45ff]/20 rounded-lg">
                <Users className="w-5 h-5 text-[#ad45ff]" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">
                  Lista de Árbitros
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {filteredReferees.length} de {referees.length} árbitros
                </CardDescription>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 bg-slate-800/50 border-2 border-slate-600 hover:border-[#ad45ff]/50 focus:border-[#ad45ff] rounded-xl text-white placeholder:text-gray-500 transition-colors"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 h-11 bg-slate-800/50 border-2 border-slate-600 hover:border-[#ad45ff]/50 rounded-xl text-white">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem
                    value="all"
                    className="text-white hover:bg-[#ad45ff]/20"
                  >
                    Todos los estados
                  </SelectItem>
                  {Object.entries(REFEREE_STATUS_LABELS).map(
                    ([value, label]) => (
                      <SelectItem
                        key={value}
                        value={value}
                        className="text-white hover:bg-[#ad45ff]/20"
                      >
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
                    ? "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                    : "border-gray-600 text-gray-400 hover:bg-gray-700/50"
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
                <Loader2 className="h-10 w-10 animate-spin text-[#ad45ff] mb-4" />
                <p className="text-gray-400">Cargando árbitros...</p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-700/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/50">
                      <TableHead className="font-semibold text-gray-300">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-[#ad45ff]" />
                          Árbitro
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-300">
                        Contacto
                      </TableHead>
                      <TableHead className="font-semibold text-gray-300">
                        Nivel
                      </TableHead>
                      <TableHead className="font-semibold text-gray-300 text-center">
                        Estado
                      </TableHead>
                      <TableHead className="font-semibold text-gray-300 text-center">
                        Partidos
                      </TableHead>
                      <TableHead className="font-semibold text-gray-300 text-right">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReferees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-16">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center">
                              <Award className="w-10 h-10 text-slate-600" />
                            </div>
                            <div>
                              <p className="text-gray-400 font-medium text-lg">
                                No se encontraron árbitros
                              </p>
                              <p className="text-gray-500 text-sm mt-1">
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
                          className={`border-slate-700/50 transition-colors ${
                            referee.enabled
                              ? "hover:bg-slate-800/50"
                              : "bg-slate-900/50 opacity-60"
                          }`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-slate-700 overflow-hidden flex items-center justify-center border border-slate-600">
                                {referee.imageUrl ? (
                                  <img
                                    src={referee.imageUrl}
                                    alt={referee.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Shield className="w-6 h-6 text-slate-500" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-white">
                                  {referee.name}
                                </p>
                                {referee.nationality && (
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
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
                                <div className="flex items-center gap-2 text-gray-400">
                                  <Mail className="w-3 h-3 text-gray-500" />
                                  <span className="truncate max-w-[180px]">
                                    {referee.email}
                                  </span>
                                </div>
                              )}
                              {referee.phone && (
                                <div className="flex items-center gap-2 text-gray-400">
                                  <Phone className="w-3 h-3 text-gray-500" />
                                  {referee.phone}
                                </div>
                              )}
                              {!referee.email && !referee.phone && (
                                <span className="text-gray-600">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {referee.certificationLevel ? (
                              <Badge className="bg-gradient-to-r from-[#ad45ff] to-[#c77dff] text-white border-0">
                                {referee.certificationLevel}
                              </Badge>
                            ) : (
                              <span className="text-gray-600">-</span>
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
                              className="font-mono bg-slate-700 text-white"
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
                                    ? "border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500"
                                    : "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500"
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
                                    className="h-9 w-9 rounded-lg border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-red-500/30 shadow-2xl rounded-2xl">
                                  <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500 rounded-t-2xl absolute top-0 left-0 right-0" />
                                  <AlertDialogHeader className="pt-4">
                                    <div className="flex items-center gap-4">
                                      <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30">
                                        <AlertTriangle className="w-6 h-6 text-red-400" />
                                      </div>
                                      <AlertDialogTitle className="text-xl font-bold text-white">
                                        ¿Eliminar árbitro?
                                      </AlertDialogTitle>
                                    </div>
                                    <AlertDialogDescription className="text-gray-400 mt-4">
                                      Esta acción eliminará a{" "}
                                      <span className="font-semibold text-white">
                                        {referee.name}
                                      </span>{" "}
                                      del sistema.
                                      {(referee._count?.matches || 0) > 0 && (
                                        <span className="text-amber-400 block mt-2">
                                          ⚠️ Este árbitro tiene{" "}
                                          {referee._count?.matches} partido(s)
                                          asignado(s). Se realizará una
                                          eliminación lógica.
                                        </span>
                                      )}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="gap-3 mt-4">
                                    <AlertDialogCancel className="px-6 h-11 bg-transparent border-2 border-slate-600 text-gray-300 hover:bg-slate-700 rounded-xl font-medium">
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDelete(referee.id, referee.name)
                                      }
                                      className="px-6 h-11 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl font-semibold shadow-lg shadow-red-500/25"
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
    </div>
  );
}
