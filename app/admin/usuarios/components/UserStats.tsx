import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  Calendar,
  Activity,
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
  ROLE_COLORS,
  STATUS_LABELS,
} from "../types";

interface UserStatsProps {
  users: IUser[];
  showTrends?: boolean;
  compact?: boolean;
}

export const UserStats: React.FC<UserStatsProps> = ({
  users,
  // showTrends - Reserved for future use
  compact = false,
}) => {
  // Calcular estadísticas
  const totalUsers = users.length;
  const activeUsers = users.filter(
    (u) => u.status === UserStatus.ACTIVO,
  ).length;
  const pendingUsers = users.filter(
    (u) => u.status === UserStatus.PENDIENTE,
  ).length;
  const suspendedUsers = users.filter(
    (u) => u.status === UserStatus.SUSPENDIDO,
  ).length;

  const adminCount = users.filter(
    (u) => u.role === UserRole.ADMINISTRADOR,
  ).length;
  const moderatorCount = users.filter(
    (u) => u.role === UserRole.MODERADOR,
  ).length;
  const editorCount = users.filter((u) => u.role === UserRole.EDITOR).length;
  const organizerCount = users.filter(
    (u) => u.role === UserRole.ORGANIZADOR,
  ).length;
  const userCount = users.filter((u) => u.role === UserRole.USUARIO).length;

  // Usuarios registrados en los últimos 30 días
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentUsers = users.filter(
    (u) => new Date(u.createdAt) > thirtyDaysAgo,
  ).length;

  const stats = [
    {
      title: "Total de Usuarios",
      value: totalUsers,
      icon: Users,
      description: "Usuarios registrados",
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Usuarios Activos",
      value: activeUsers,
      icon: Activity,
      description: `${((activeUsers / totalUsers) * 100).toFixed(
        1,
      )}% del total`,
      color: "bg-green-500",
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Nuevos Usuarios",
      value: recentUsers,
      icon: TrendingUp,
      description: "Últimos 30 días",
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Pendientes",
      value: pendingUsers,
      icon: Calendar,
      description: "Pendientes de activar",
      color: "bg-yellow-500",
      gradient: "from-yellow-500 to-yellow-600",
    },
  ];

  const roleStats = [
    { role: UserRole.ADMINISTRADOR, count: adminCount, icon: Crown },
    { role: UserRole.MODERADOR, count: moderatorCount, icon: ShieldCheck },
    { role: UserRole.EDITOR, count: editorCount, icon: PenTool },
    { role: UserRole.ORGANIZADOR, count: organizerCount, icon: Calendar },
    { role: UserRole.USUARIO, count: userCount, icon: UserIcon },
  ];

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-r ${stat.gradient}`}
                >
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stat.description}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-full bg-gradient-to-r ${stat.gradient} shadow-lg`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Distribución por roles */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
            Distribución por Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roleStats.map((roleStat) => (
              <div
                key={roleStat.role}
                className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex items-center space-x-2">
                  <roleStat.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <Badge className={`${ROLE_COLORS[roleStat.role]} text-xs`}>
                      {ROLE_LABELS[roleStat.role]}
                    </Badge>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                      {roleStat.count}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estado de usuarios */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
            Estado de Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {STATUS_LABELS[UserStatus.ACTIVO]}
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {activeUsers}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {STATUS_LABELS[UserStatus.INACTIVO]}
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {users.filter((u) => u.status === UserStatus.INACTIVO).length}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {STATUS_LABELS[UserStatus.PENDIENTE]}
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {pendingUsers}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {STATUS_LABELS[UserStatus.SUSPENDIDO]}
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {suspendedUsers}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStats;
