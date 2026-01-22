import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Calendar,
  Crown,
  ShieldCheck,
  PenTool,
  User as UserIcon,
} from "lucide-react";
import {
  IUser,
  UserRole,
  UserStatus,
  ROLE_LABELS,
  STATUS_LABELS,
  ROLE_COLORS,
  STATUS_COLORS,
} from "../types";

interface UserFiltersProps {
  users: IUser[];
  onFilteredUsersChange: (filteredUsers: IUser[]) => void;
  showAdvancedFilters?: boolean;
}

interface FilterState {
  search: string;
  role: UserRole | "all";
  status: UserStatus | "all";
  sortBy: "name" | "email" | "createdAt" | "lastLoginAt";
  sortOrder: "asc" | "desc";
  dateRange: "all" | "today" | "week" | "month" | "year";
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  users,
  onFilteredUsersChange,
  showAdvancedFilters = true,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    role: "all",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
    dateRange: "all",
  });

  const [showFilters, setShowFilters] = useState(false);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Crown className="h-4 w-4" />;
      case UserRole.MODERATOR:
        return <ShieldCheck className="h-4 w-4" />;
      case UserRole.EDITOR:
        return <PenTool className="h-4 w-4" />;
      case UserRole.ORGANIZER:
        return <Calendar className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const applyFilters = (newFilters: FilterState) => {
    let filteredUsers = [...users];

    // Filtro por búsqueda
    if (newFilters.search) {
      const searchLower = newFilters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.phone?.toLowerCase().includes(searchLower) ||
          user.location?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por rol
    if (newFilters.role !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.role === newFilters.role
      );
    }

    // Filtro por estado
    if (newFilters.status !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.status === newFilters.status
      );
    }

    // Filtro por rango de fechas
    if (newFilters.dateRange !== "all") {
      const now = new Date();
      let startDate = new Date();

      switch (newFilters.dateRange) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filteredUsers = filteredUsers.filter(
        (user) => new Date(user.createdAt) >= startDate
      );
    }

    // Ordenamiento
    filteredUsers.sort((a, b) => {
      let comparison = 0;

      switch (newFilters.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "email":
          comparison = a.email.localeCompare(b.email);
          break;
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "lastLoginAt": {
          const aLogin = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
          const bLogin = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
          comparison = aLogin - bLogin;
          break;
        }
      }

      return newFilters.sortOrder === "asc" ? comparison : -comparison;
    });

    onFilteredUsersChange(filteredUsers);
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      search: "",
      role: "all",
      status: "all",
      sortBy: "createdAt",
      sortOrder: "desc",
      dateRange: "all",
    };
    setFilters(defaultFilters);
    applyFilters(defaultFilters);
  };

  const hasActiveFilters =
    filters.search ||
    filters.role !== "all" ||
    filters.status !== "all" ||
    filters.dateRange !== "all";

  return (
    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
            Filtros y Búsqueda
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
            {showAdvancedFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={
                  showFilters ? "bg-[#ad45ff]/10 border-[#ad45ff]/20" : ""
                }
              >
                <Filter className="h-4 w-4 mr-1" />
                Filtros
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Búsqueda principal */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, email, teléfono o ubicación..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros rápidos */}
        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.role}
            onValueChange={(value) => handleFilterChange("role", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              {Object.values(UserRole).map((role) => (
                <SelectItem key={role} value={role}>
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(role)}
                    <span>{ROLE_LABELS[role]}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.values(UserStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  <Badge className={`${STATUS_COLORS[status]} text-xs`}>
                    {STATUS_LABELS[status]}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtros avanzados */}
        {showFilters && showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Ordenar por
              </span>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange("sortBy", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="createdAt">Fecha de registro</SelectItem>
                  <SelectItem value="lastLoginAt">Último acceso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Orden
              </span>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) =>
                  handleFilterChange("sortOrder", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">
                    <div className="flex items-center space-x-2">
                      <SortAsc className="h-4 w-4" />
                      <span>Ascendente</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="desc">
                    <div className="flex items-center space-x-2">
                      <SortDesc className="h-4 w-4" />
                      <span>Descendente</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Período de registro
              </span>
              <Select
                value={filters.dateRange}
                onValueChange={(value) =>
                  handleFilterChange("dateRange", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo el tiempo</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                  <SelectItem value="year">Último año</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Resumen de filtros activos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Filtros activos:
            </span>
            {filters.search && (
              <Badge variant="secondary" className="text-xs">
                Búsqueda: "{filters.search}"
              </Badge>
            )}
            {filters.role !== "all" && (
              <Badge
                className={`${ROLE_COLORS[filters.role as UserRole]} text-xs`}
              >
                {ROLE_LABELS[filters.role as UserRole]}
              </Badge>
            )}
            {filters.status !== "all" && (
              <Badge
                className={`${
                  STATUS_COLORS[filters.status as UserStatus]
                } text-xs`}
              >
                {STATUS_LABELS[filters.status as UserStatus]}
              </Badge>
            )}
            {filters.dateRange !== "all" && (
              <Badge variant="secondary" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {filters.dateRange === "today" && "Hoy"}
                {filters.dateRange === "week" && "Última semana"}
                {filters.dateRange === "month" && "Último mes"}
                {filters.dateRange === "year" && "Último año"}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserFilters;

