import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Crown,
  ShieldCheck,
  PenTool,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/formatDate";
import {
  IUser,
  UserRole,
  ROLE_LABELS,
  STATUS_LABELS,
  ROLE_COLORS,
  STATUS_COLORS,
} from "../types";

interface UserCardProps {
  user: IUser;
  onDelete?: (userId: string) => void;
  onStatusToggle?: (userId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onDelete,
  // onStatusToggle - Reserved for future use
  showActions = true,
  compact = false,
}) => {
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

  if (compact) {
    return (
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 hover:shadow-lg transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.imageUrl || ""} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] text-white font-semibold">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={`${ROLE_COLORS[user.role]} text-xs`}>
                  {getRoleIcon(user.role)}
                  <span className="ml-1">{ROLE_LABELS[user.role]}</span>
                </Badge>
              </div>
            </div>
            {showActions && (
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/usuarios/${user.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.imageUrl || ""} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] text-white font-bold text-lg">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                {user.name}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={ROLE_COLORS[user.role]}>
                  {getRoleIcon(user.role)}
                  <span className="ml-1">{ROLE_LABELS[user.role]}</span>
                </Badge>
                <Badge className={STATUS_COLORS[user.status]}>
                  {STATUS_LABELS[user.status]}
                </Badge>
              </div>
            </div>
          </div>
          {showActions && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/usuarios/${user.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/usuarios/${user.id}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(user.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="h-4 w-4" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4" />
              <span>{user.phone}</span>
            </div>
          )}
          {user.location && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>{user.location}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>Registro: {formatDate(user.createdAt)}</span>
          </div>
        </div>

        {user.bio && (
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {user.bio}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{user._count?.news || 0} noticias</span>
            <span>{user._count?.tournaments || 0} torneos</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Última conexión:{" "}
            {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Nunca"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
