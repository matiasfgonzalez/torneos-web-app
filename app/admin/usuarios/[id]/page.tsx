"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ArrowLeft,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  User,
  Crown,
  ShieldCheck,
  PenTool,
  Activity,
  FileText,
  Ban,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import { toast } from "sonner";
import { FullscreenLoading } from "@/components/fullscreen-loading";
import {
  IUser,
  UserRole,
  UserStatus,
  ROLE_LABELS,
  STATUS_LABELS,
  ROLE_COLORS,
  STATUS_COLORS,
} from "../types";

// Interfaces para la API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface UserWithStats extends IUser {
  stats?: {
    recent: {
      news: number;
      tournaments: number;
      activity: number;
    };
    total: {
      news: number;
      tournaments: number;
      teams: number;
      auditLogs: number;
    };
  };
  news?: Array<{
    id: string;
    title: string;
    summary: string;
    published: boolean;
    publishedAt: Date;
  }>;
  tournaments?: Array<{
    id: string;
    name: string;
    status: string;
    startDate: Date;
    category: string;
  }>;
  teams?: Array<{
    id: string;
    name: string;
    shortName: string;
    enabled: boolean;
  }>;
  auditLogs?: Array<{
    id: string;
    action: string;
    entity: string;
    createdAt: Date;
  }>;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [user, setUser] = useState<UserWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Función para cargar los datos del usuario
  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}`);
      const result: ApiResponse<UserWithStats> = await response.json();

      if (result.success && result.data) {
        setUser(result.data);
      } else {
        toast.error(result.message || "Error al cargar el usuario");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Error al cargar los datos del usuario");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // Función para actualizar el rol del usuario
  const handleRoleUpdate = async (newRole: UserRole) => {
    if (!user) return;

    try {
      setIsUpdatingRole(true);
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      const result: ApiResponse<IUser> = await response.json();

      if (result.success && result.data) {
        setUser((prev) => (prev ? { ...prev, ...result.data } : null));
        toast.success("Rol actualizado exitosamente");
      } else {
        toast.error(result.message || "Error al actualizar el rol");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Error al actualizar el rol");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Función para actualizar el estado del usuario
  const handleStatusUpdate = async (newStatus: UserStatus) => {
    if (!user) return;

    try {
      setIsUpdatingStatus(true);
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result: ApiResponse<IUser> = await response.json();

      if (result.success && result.data) {
        setUser((prev) => (prev ? { ...prev, ...result.data } : null));
        toast.success("Estado actualizado exitosamente");
      } else {
        toast.error(result.message || "Error al actualizar el estado");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error al actualizar el estado");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Función para eliminar el usuario
  const handleDelete = async () => {
    if (!user) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: ApiResponse<any> = await response.json();

      if (result.success) {
        toast.success("Usuario eliminado exitosamente");
        router.push("/admin/usuarios");
      } else {
        toast.error(result.message || "Error al eliminar el usuario");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error al eliminar usuario");
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para obtener icono del rol
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMINISTRADOR:
        return <Crown className="h-4 w-4" />;
      case UserRole.MODERADOR:
        return <ShieldCheck className="h-4 w-4" />;
      case UserRole.EDITOR:
        return <PenTool className="h-4 w-4" />;
      case UserRole.ORGANIZADOR:
        return <Calendar className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  // Función para obtener icono del estado
  const getStatusIcon = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVO:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case UserStatus.INACTIVO:
        return <Clock className="h-4 w-4 text-gray-500" />;
      case UserStatus.SUSPENDIDO:
        return <Ban className="h-4 w-4 text-red-500" />;
      case UserStatus.PENDIENTE:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <FullscreenLoading
        isVisible={true}
        message="Cargando usuario"
        submessage="Obteniendo información del perfil..."
      />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-6">
            <div className="text-6xl">👤</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Usuario no encontrado
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              El usuario que buscas no existe o ha sido eliminado.
            </p>
            <Link href="/admin/usuarios">
              <Button className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a usuarios
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin/usuarios">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                Detalle del Usuario
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gestiona la información y permisos del usuario
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={fetchUser}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Link href={`/admin/usuarios/${userId}/edit`}>
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </Link>
          </div>
        </div>

        {/* User Profile Card */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 shadow-xl mb-8">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <Avatar className="h-24 w-24 mx-auto sm:mx-0">
                  <AvatarImage src={user.imageUrl || ""} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] text-white font-bold text-2xl">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {user.name}
                  </CardTitle>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
                    <Badge className={ROLE_COLORS[user.role]}>
                      {getRoleIcon(user.role)}
                      <span className="ml-2">{ROLE_LABELS[user.role]}</span>
                    </Badge>
                    <Badge className={STATUS_COLORS[user.status]}>
                      {getStatusIcon(user.status)}
                      <span className="ml-2">{STATUS_LABELS[user.status]}</span>
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-center sm:justify-start">
                      <Mail className="w-4 h-4 mr-1" />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center justify-center sm:justify-start">
                        <Phone className="w-4 h-4 mr-1" />
                        {user.phone}
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center justify-center sm:justify-start">
                        <MapPin className="w-4 h-4 mr-1" />
                        {user.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2 w-full sm:w-auto">
                <Select
                  value={user.role}
                  onValueChange={(value) => handleRoleUpdate(value as UserRole)}
                  disabled={isUpdatingRole}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UserRole).map((role) => (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center">
                          {getRoleIcon(role)}
                          <span className="ml-2">{ROLE_LABELS[role]}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={user.status}
                  onValueChange={(value) =>
                    handleStatusUpdate(value as UserStatus)
                  }
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UserStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center">
                          {getStatusIcon(status)}
                          <span className="ml-2">{STATUS_LABELS[status]}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isDeleting}
                      className="w-full sm:w-40 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isDeleting ? "Eliminando..." : "Eliminar"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-gray-900 dark:text-white">¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                        Esta acción marcará al usuario como inactivo. Esta
                        operación puede deshacerse cambiando el estado del
                        usuario.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600">Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Eliminar Usuario
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {user.bio && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Biografía
                </h4>
                <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-gray-500 dark:text-gray-400 font-medium">
                  Registro:
                </span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(user.createdAt)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 dark:text-gray-400 font-medium">
                  Última actualización:
                </span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(user.updatedAt)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 dark:text-gray-400 font-medium">
                  Última conexión:
                </span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Nunca"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 dark:text-gray-400 font-medium">
                  Email verificado:
                </span>
                <div className="flex items-center">
                  {user.emailVerified ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" />
                  )}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {user.emailVerified ? "Sí" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {user.stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.stats.total.news}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Noticias
                </p>
                {user.stats.recent.news > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    +{user.stats.recent.news} este mes
                  </p>
                )}
              </CardContent>
            </Card>
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.stats.total.tournaments}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Torneos
                </p>
                {user.stats.recent.tournaments > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    +{user.stats.recent.tournaments} este mes
                  </p>
                )}
              </CardContent>
            </Card>
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <User className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.stats.total.teams}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Equipos
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.stats.total.auditLogs}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Actividades
                </p>
                {user.stats.recent.activity > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    +{user.stats.recent.activity} este mes
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs for detailed information */}
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <TabsTrigger value="content">Contenido</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
            <TabsTrigger value="tournaments">Torneos</TabsTrigger>
            <TabsTrigger value="teams">Equipos</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-500" />
                  Noticias Recientes
                </CardTitle>
                <CardDescription>
                  Últimas noticias creadas por este usuario
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user.news && user.news.length > 0 ? (
                  <div className="space-y-3">
                    {user.news.map((article) => (
                      <div
                        key={article.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {article.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {article.summary}
                          </p>
                          {article.publishedAt && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {formatDate(article.publishedAt)}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={article.published ? "default" : "secondary"}
                          className="ml-4"
                        >
                          {article.published ? "Publicado" : "Borrador"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay noticias creadas por este usuario
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-orange-500" />
                  Registro de Actividad
                </CardTitle>
                <CardDescription>
                  Últimas acciones realizadas por el usuario
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user.auditLogs && user.auditLogs.length > 0 ? (
                  <div className="space-y-3">
                    {user.auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <Activity className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {log.action}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {log.entity} - {formatDate(log.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay actividad registrada
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tournaments" className="space-y-4">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-500" />
                  Torneos
                </CardTitle>
                <CardDescription>
                  Torneos creados por este usuario
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user.tournaments && user.tournaments.length > 0 ? (
                  <div className="space-y-3">
                    {user.tournaments.map((tournament) => (
                      <div
                        key={tournament.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {tournament.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {tournament.category} -{" "}
                            {formatDate(tournament.startDate)}
                          </p>
                        </div>
                        <Badge className="ml-4">{tournament.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay torneos creados por este usuario
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-500" />
                  Equipos
                </CardTitle>
                <CardDescription>
                  Equipos creados por este usuario
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user.teams && user.teams.length > 0 ? (
                  <div className="space-y-3">
                    {user.teams.map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {team.name}
                          </h4>
                          {team.shortName && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {team.shortName}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={team.enabled ? "default" : "secondary"}
                          className="ml-4"
                        >
                          {team.enabled ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay equipos creados por este usuario
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
