import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Ban } from "lucide-react";
import { UserStatus, STATUS_LABELS, STATUS_COLORS } from "../types";

interface StatusBadgeProps {
  status: UserStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showLabel?: boolean;
  animated?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  showIcon = true,
  showLabel = true,
  animated = false,
}) => {
  const getStatusIcon = (status: UserStatus) => {
    const iconSize =
      size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
    const animationClass = animated ? "animate-pulse" : "";

    switch (status) {
      case UserStatus.ACTIVE:
        return <CheckCircle className={`${iconSize} ${animationClass}`} />;
      case UserStatus.INACTIVE:
        return <XCircle className={`${iconSize} ${animationClass}`} />;
      case UserStatus.PENDING:
        return <Clock className={`${iconSize} ${animationClass}`} />;
      case UserStatus.SUSPENDED:
        return <Ban className={`${iconSize} ${animationClass}`} />;
      default:
        return <Clock className={`${iconSize} ${animationClass}`} />;
    }
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <Badge
      className={`${STATUS_COLORS[status]} ${sizeClasses[size]} font-medium inline-flex items-center space-x-1`}
    >
      {showIcon && getStatusIcon(status)}
      {showLabel && <span>{STATUS_LABELS[status]}</span>}
    </Badge>
  );
};

// Componente para mostrar indicadores de estado con descripción
interface StatusIndicatorProps {
  status: UserStatus;
  showDescription?: boolean;
  compact?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  showDescription = false,
  compact = false,
}) => {
  const getStatusDescription = (status: UserStatus): string => {
    switch (status) {
      case UserStatus.ACTIVE:
        return "El usuario está activo y puede acceder al sistema";
      case UserStatus.INACTIVE:
        return "El usuario está inactivo temporalmente";
      case UserStatus.PENDING:
        return "El usuario está pendiente de activación";
      case UserStatus.SUSPENDED:
        return "El usuario ha sido suspendido temporalmente";
      default:
        return "";
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div
          className={`w-2 h-2 rounded-full ${
            status === UserStatus.ACTIVE
              ? "bg-green-500"
              : status === UserStatus.INACTIVE
              ? "bg-gray-500"
              : status === UserStatus.PENDING
              ? "bg-yellow-500"
              : status === UserStatus.SUSPENDED
              ? "bg-orange-500"
              : "bg-red-500"
          }`}
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {STATUS_LABELS[status]}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <StatusBadge status={status} animated={status === UserStatus.PENDING} />
      {showDescription && (
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {getStatusDescription(status)}
        </p>
      )}
    </div>
  );
};

// Hook para manejar cambios de estado
export const useStatusChange = () => {
  const canChangeStatus = (
    currentStatus: UserStatus,
    newStatus: UserStatus
  ): boolean => {
    // Reglas de negocio para cambios de estado
    switch (currentStatus) {
      case UserStatus.PENDING:
        return [UserStatus.ACTIVE, UserStatus.SUSPENDED].includes(newStatus);
      case UserStatus.ACTIVE:
        return [UserStatus.INACTIVE, UserStatus.SUSPENDED].includes(newStatus);
      case UserStatus.INACTIVE:
        return [UserStatus.ACTIVE, UserStatus.SUSPENDED].includes(newStatus);
      case UserStatus.SUSPENDED:
        return [UserStatus.ACTIVE].includes(newStatus);
      default:
        return false;
    }
  };

  const getAvailableStatuses = (currentStatus: UserStatus): UserStatus[] => {
    return Object.values(UserStatus).filter(
      (status) =>
        status !== currentStatus && canChangeStatus(currentStatus, status)
    );
  };

  return {
    canChangeStatus,
    getAvailableStatuses,
  };
};

export default StatusBadge;

