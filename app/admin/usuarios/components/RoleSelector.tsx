import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  ShieldCheck,
  PenTool,
  User as UserIcon,
  Calendar,
} from "lucide-react";
import {
  UserRole,
  ROLE_LABELS,
  ROLE_COLORS,
  ROLE_DESCRIPTIONS,
} from "../types";

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
  currentUserRole?: UserRole;
  showDescription?: boolean;
  variant?: "default" | "compact";
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  currentUserRole,
  showDescription = false,
  variant = "default",
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

  // Determinar qué roles puede asignar el usuario actual
  const getAvailableRoles = (): UserRole[] => {
    if (!currentUserRole) return Object.values(UserRole);

    switch (currentUserRole) {
      case UserRole.ADMINISTRADOR:
        return Object.values(UserRole); // Los admins pueden asignar cualquier rol
      case UserRole.MODERADOR:
        return [UserRole.USUARIO, UserRole.EDITOR, UserRole.ORGANIZADOR]; // Los moderadores pueden USER, EDITOR y ORGANIZER
      default:
        return [UserRole.USUARIO]; // Otros roles solo pueden asignar USER
    }
  };

  const availableRoles = getAvailableRoles();

  if (variant === "compact") {
    return (
      <Badge className={`${ROLE_COLORS[value]} cursor-pointer`}>
        {getRoleIcon(value)}
        <span className="ml-1">{ROLE_LABELS[value]}</span>
      </Badge>
    );
  }

  return (
    <div className="space-y-2">
      <Select
        value={value}
        onValueChange={(newValue) => onChange(newValue as UserRole)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            <div className="flex items-center space-x-2">
              {getRoleIcon(value)}
              <span>{ROLE_LABELS[value]}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableRoles.map((role) => (
            <SelectItem key={role} value={role}>
              <div className="flex items-center space-x-3 py-2">
                <div className="flex items-center space-x-2">
                  {getRoleIcon(role)}
                  <span className="font-medium">{ROLE_LABELS[role]}</span>
                </div>
                {showDescription && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {ROLE_DESCRIPTIONS[role]}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showDescription && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {ROLE_DESCRIPTIONS[value]}
        </p>
      )}
    </div>
  );
};

// Componente adicional para mostrar roles en formato badge con tooltip
interface RoleBadgeProps {
  role: UserRole;
  showTooltip?: boolean;
  size?: "sm" | "md" | "lg";
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  showTooltip = false,
  size = "md",
}) => {
  const getRoleIcon = (role: UserRole) => {
    const iconSize =
      size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";

    switch (role) {
      case UserRole.ADMINISTRADOR:
        return <Crown className={iconSize} />;
      case UserRole.MODERADOR:
        return <ShieldCheck className={iconSize} />;
      case UserRole.EDITOR:
        return <PenTool className={iconSize} />;
      default:
        return <UserIcon className={iconSize} />;
    }
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <div
      className="inline-block"
      title={showTooltip ? ROLE_DESCRIPTIONS[role] : undefined}
    >
      <Badge
        className={`${ROLE_COLORS[role]} ${sizeClasses[size]} font-medium`}
      >
        {getRoleIcon(role)}
        <span className="ml-1">{ROLE_LABELS[role]}</span>
      </Badge>
    </div>
  );
};

export default RoleSelector;

