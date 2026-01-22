"use client";

import { useEffect, useState } from "react";
import { getReferees, deleteReferee } from "@modules/arbitros/actions/actions";
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

export default function RefereesPage() {
  const [referees, setReferees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReferees = async () => {
    setIsLoading(true);
    const res = await getReferees();
    if (res.success) {
      setReferees(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReferees();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    const res = await deleteReferee(id);
    if (res.success) {
      toast.success("Árbitro eliminado");
      fetchReferees();
    } else {
      toast.error(res.error);
    }
  };

  const filteredReferees = referees.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalMatches = referees.reduce(
    (sum, r) => sum + (r._count?.matches || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/50">
      <div className="space-y-8 p-6 sm:p-8">
        {/* Header mejorado */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff]/5 to-[#a3b3ff]/5 dark:from-[#ad45ff]/10 dark:to-[#a3b3ff]/10 rounded-3xl -z-10" />

          <Card className="border-2 border-[#ad45ff]/20 dark:border-[#ad45ff]/30 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-2xl flex items-center justify-center shadow-lg">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                        Panel de Árbitros
                      </h1>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <p className="text-gray-600 dark:text-gray-300 font-medium">
                          Sistema activo - {referees.length} árbitros
                          registrados
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                    Gestiona el cuerpo arbitral de tus torneos
                  </p>

                  {/* Quick stats inline */}
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center space-x-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full">
                      <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        {referees.length} árbitros
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
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
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Listado de Árbitros
            </h2>
          </div>

          <Card className="glass-card border-0 shadow-xl">
            <CardHeader className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Lista de Árbitros
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {referees.length} árbitros registrados
                  </CardDescription>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] focus:ring-0 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#ad45ff]" />
                </div>
              ) : (
                <div className="rounded-xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold text-gray-900 dark:text-white">
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4" />
                            <span>Nombre</span>
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-white">
                          Contacto
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-white">
                          Nivel
                        </TableHead>
                        <TableHead className="text-center font-semibold text-gray-900 dark:text-white">
                          Partidos
                        </TableHead>
                        <TableHead className="text-right font-semibold text-gray-900 dark:text-white">
                          Acciones
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReferees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12">
                            <div className="space-y-3">
                              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                                <Award className="w-8 h-8 text-gray-400" />
                              </div>
                              <p className="text-gray-500 font-medium">
                                No se encontraron árbitros
                              </p>
                              <p className="text-sm text-gray-400">
                                {searchTerm
                                  ? "Intenta con otros términos de búsqueda"
                                  : "Comienza registrando tu primer árbitro"}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredReferees.map((referee) => (
                          <TableRow
                            key={referee.id}
                            className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <TableCell className="font-semibold text-gray-900 dark:text-white">
                              {referee.name}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
                                {referee.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> {referee.email}
                                  </div>
                                )}
                                {referee.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />{" "}
                                    {referee.phone}
                                  </div>
                                )}
                                {!referee.email && !referee.phone && "-"}
                              </div>
                            </TableCell>
                            <TableCell>
                              {referee.certificationLevel ? (
                                <Badge className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white border-0">
                                  {referee.certificationLevel}
                                </Badge>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="secondary"
                                className="font-mono bg-gray-100 dark:bg-gray-700"
                              >
                                {referee._count?.matches || 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <DialogReferee
                                  mode="edit"
                                  referee={referee}
                                  onSuccess={fetchReferees}
                                />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:border-red-800 dark:hover:bg-red-900/20"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-white dark:bg-gray-800 border-0 shadow-2xl">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-gray-900 dark:text-white">
                                        ¿Eliminar árbitro?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                                        Esta acción eliminará permanentemente a{" "}
                                        <strong>{referee.name}</strong> del
                                        sistema. Esta acción no se puede
                                        deshacer.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="border-2 border-gray-300 dark:border-gray-600">
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white border-0"
                                        onClick={() =>
                                          handleDelete(referee.id, referee.name)
                                        }
                                      >
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
    </div>
  );
}
