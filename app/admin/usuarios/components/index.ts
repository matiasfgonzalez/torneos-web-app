// Exportar todos los componentes desde un índice central
export { default as UserCard } from "./UserCard";
export { default as RoleSelector, RoleBadge } from "./RoleSelector";
export {
  default as StatusBadge,
  StatusIndicator,
  useStatusChange,
} from "./StatusBadge";
export { default as UserStats } from "./UserStats";
export { default as UserFilters } from "./UserFilters";

// Re-exportar tipos para conveniencia
export type {
  IUser,
  UserRole,
  UserStatus,
  IUserSession,
  IUserActivity,
  IPermission,
  IUserFilters,
} from "../types";

