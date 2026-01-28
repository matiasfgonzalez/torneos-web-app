"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Phone,
  MapPin,
  Calendar,
  Crown,
  ShieldCheck,
  PenTool,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/formatDate";
import { FullscreenLoading } from "@/components/fullscreen-loading";
import {
  IUser,
  UserRole,
  UserStatus,
  ROLE_LABELS,
  STATUS_LABELS,
  ROLE_COLORS,
  STATUS_COLORS,
} from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      return <UserIcon className="h-4 w-4" />;
  }
};

// Componente de tarjeta de usuario
const UserCard = ({
  user,
  onDelete,
}: {
  user: ApiUser;
  onDelete: (userId: string) => void;
}) => (
  <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 hover:shadow-xl transition-all duration-300 group">
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.imageUrl || ""} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] text-white font-semibold">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {user.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/usuarios/${user.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Ver detalles
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/usuarios/${user.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e: Event) => e.preventDefault()}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-gray-900 dark:text-white">¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                    Esta acción marcará al usuario como inactivo. Esta operación
                    puede deshacerse.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600">Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(user.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex items-center space-x-2">
        <Badge className={ROLE_COLORS[user.role]}>
          <Crown className="h-4 w-4 mr-1" />
          <span>{ROLE_LABELS[user.role]}</span>
        </Badge>
        <Badge className={STATUS_COLORS[user.status]}>
          {STATUS_LABELS[user.status]}
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        {user.phone && (
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Phone className="h-4 w-4 mr-2" />
            <span className="truncate">{user.phone}</span>
          </div>
        )}
        {user.location && (
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="truncate">{user.location}</span>
          </div>
        )}
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Registro: {formatDate(user.createdAt)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
        <div className="flex space-x-3 text-xs text-gray-500 dark:text-gray-400">
          <span>{user._count?.news || 0} noticias</span>
          <span>{user._count?.tournaments || 0} torneos</span>
        </div>
        <Button
          size="sm"
          asChild
          className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white"
        >
          <Link href={`/admin/usuarios/${user.id}`}>Ver detalles</Link>
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Componente de fila de usuario para vista de lista
const UserRow = ({
  user,
  onDelete,
}: {
  user: ApiUser;
  onDelete: (userId: string) => void;
}) => (
  <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 hover:shadow-lg transition-all">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.imageUrl || ""} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] text-white font-semibold text-sm">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {user.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Badge className={ROLE_COLORS[user.role]}>
              <Crown className="h-4 w-4 mr-1" />
              <span>{ROLE_LABELS[user.role]}</span>
            </Badge>
            <Badge className={STATUS_COLORS[user.status]}>
              {STATUS_LABELS[user.status]}
            </Badge>
          </div>
          <div className="hidden lg:block text-sm text-gray-500 dark:text-gray-400">
            {formatDate(user.createdAt)}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/usuarios/${user.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/usuarios/${user.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción marcará al usuario como inactivo. Esta operación
                  puede deshacerse.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(user.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Interferes para la API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface UserFilters {
  search: string;
  role: UserRole | "all";
  status: UserStatus | "all";
  sortBy: "name" | "email" | "createdAt" | "lastLoginAt";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

// Tipo extendido para la API que maneja fechas como strings
interface ApiUser extends Omit<
  IUser,
  "createdAt" | "updatedAt" | "lastLoginAt" | "birthDate" | "emailVerified"
> {
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
  birthDate?: string | null;
  emailVerified?: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    role: "all",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 12,
  });
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Función para cargar usuarios
  const fetchUsers = async (currentFilters = filters) => {
    try {
      setIsRefreshing(true);
      const params = new URLSearchParams();

      if (currentFilters.search) params.append("search", currentFilters.search);
      if (currentFilters.role !== "all")
        params.append("role", currentFilters.role);
      if (currentFilters.status !== "all")
        params.append("status", currentFilters.status);
      params.append("sortBy", currentFilters.sortBy);
      params.append("sortOrder", currentFilters.sortOrder);
      params.append("page", currentFilters.page.toString());
      params.append("limit", currentFilters.limit.toString());

      const response = await fetch(`/api/users?${params.toString()}`);
      const result: ApiResponse<ApiUser[]> = await response.json();

      if (result.success && result.data) {
        setUsers(result.data);
        if (result.meta) {
          setMeta(result.meta);
        }
      } else {
        toast.error(result.message || "Error al cargar usuarios");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error al cargar los usuarios");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, []);

  // Función para manejar cambios de filtros
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 }; // Reset page when filtering
    setFilters(newFilters);
    fetchUsers(newFilters);
  };

  // Función para cambiar de página
  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    fetchUsers(newFilters);
  };

  // Función para eliminar usuario
  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: ApiResponse<any> = await response.json();

      if (result.success) {
        toast.success("Usuario eliminado exitosamente");
        fetchUsers(); // Recargar la lista
      } else {
        toast.error(result.message || "Error al eliminar usuario");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error al eliminar usuario");
    }
  };

  if (isLoading) {
    return (
      <FullscreenLoading
        isVisible={true}
        message="Cargando usuarios"
        submessage="Obteniendo lista de usuarios..."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                Gestión de Usuarios
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Administra usuarios, roles y permisos del sistema
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => fetchUsers()}
              disabled={isRefreshing}
              className="border-2 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 rounded-xl"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>
            <Button
              variant="outline"
              className="border-2 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 rounded-xl"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] dark:from-[#8b39cc] dark:to-[#829bd9] hover:from-[#9c3ee6] hover:to-[#92a6ff] dark:hover:from-[#7a32b8] dark:hover:to-[#7189c5] text-white border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 rounded-2xl px-6 py-5 text-base font-semibold">
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {meta.total}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Usuarios
                  </p>
                </div>
                <Users className="h-8 w-8 text-[#ad45ff]" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter((u) => u.status === UserStatus.ACTIVO).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Activos
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-green-500"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {
                      users.filter((u) => u.role === UserRole.ADMINISTRADOR)
                        .length
                    }
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Administradores
                  </p>
                </div>
                <Crown className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {
                      users.filter((u) => u.status === UserStatus.PENDIENTE)
                        .length
                    }
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pendientes
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={filters.role}
                onValueChange={(value) => handleFilterChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
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
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.values(UserStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange("sortBy", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="createdAt">Fecha de registro</SelectItem>
                  <SelectItem value="lastLoginAt">Último acceso</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleFilterChange(
                      "sortOrder",
                      filters.sortOrder === "asc" ? "desc" : "asc",
                    )
                  }
                  className="flex-1"
                >
                  {filters.sortOrder === "asc" ? (
                    <SortAsc className="h-4 w-4 mr-2" />
                  ) : (
                    <SortDesc className="h-4 w-4 mr-2" />
                  )}
                  {filters.sortOrder === "asc" ? "Asc" : "Desc"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setViewMode(viewMode === "grid" ? "list" : "grid")
                  }
                >
                  {viewMode === "grid" ? (
                    <List className="h-4 w-4" />
                  ) : (
                    <Grid3X3 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid/List */}
        {users.length > 0 ? (
          <div className="space-y-6">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onDelete={handleDeleteUser}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onDelete={handleDeleteUser}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Mostrando {(meta.page - 1) * meta.limit + 1} a{" "}
                      {Math.min(meta.page * meta.limit, meta.total)} de{" "}
                      {meta.total} usuarios
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(meta.page - 1)}
                        disabled={!meta.hasPreviousPage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <span className="text-sm font-medium text-gray-900 dark:text-white px-3">
                        Página {meta.page} de {meta.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(meta.page + 1)}
                        disabled={!meta.hasNextPage}
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60">
            <CardContent className="text-center py-16">
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No se encontraron usuarios
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {filters.search ||
                filters.role !== "all" ||
                filters.status !== "all"
                  ? "No hay usuarios que coincidan con los filtros aplicados."
                  : "Aún no hay usuarios registrados en el sistema."}
              </p>
              <Button className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Usuario
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
