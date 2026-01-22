export interface IUser {
  id: string;
  name: string;
  email: string;
  emailVerified?: Date | null;
  imageUrl?: string | null; // Cambiar de 'image' a 'imageUrl' para coincidir con Prisma
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;

  // Información adicional
  phone?: string | null;
  birthDate?: Date | null;
  location?: string | null;
  bio?: string | null;

  // Estadísticas
  _count?: {
    news?: number; // Cambiar 'noticias' por 'news'
    tournaments?: number; // Agregar tournaments
    teams?: number; // Agregar teams
    auditLogs?: number; // Agregar auditLogs
  };
}

export enum UserRole {
  ADMINISTRADOR = "ADMINISTRADOR",
  MODERADOR = "MODERADOR",
  EDITOR = "EDITOR",
  ORGANIZADOR = "ORGANIZADOR",
  USUARIO = "USUARIO",
}

export enum UserStatus {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
  SUSPENDIDO = "SUSPENDIDO",
  PENDIENTE = "PENDIENTE",
}

export interface IPermission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
}

export interface IRolePermissions {
  role: UserRole;
  permissions: IPermission[];
}

export interface IUserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface IUserSession {
  id: string;
  userId: string;
  sessionToken: string;
  expires: Date;
  createdAt: Date;
  lastAccessedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

export interface IUserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: {
    [key in UserRole]: number;
  };
  usersByStatus: {
    [key in UserStatus]: number;
  };
}

export interface IUserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: "name" | "email" | "createdAt" | "lastLoginAt";
  sortOrder?: "asc" | "desc";
}

export interface ICreateUserData {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  birthDate?: Date;
  location?: string;
  bio?: string;
  sendWelcomeEmail?: boolean;
}

export interface IUpdateUserData {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
  location?: string;
  bio?: string;
  imageUrl?: string;
}

// Utilidades para roles y permisos
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.USER]: 1,
  [UserRole.EDITOR]: 2,
  [UserRole.ORGANIZER]: 3,
  [UserRole.MODERATOR]: 4,
  [UserRole.ADMIN]: 5,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.MODERATOR]: "Moderador",
  [UserRole.EDITOR]: "Editor",
  [UserRole.ORGANIZER]: "Organizador",
  [UserRole.USER]: "Usuario",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.USER]: "Acceso básico para visualizar contenido",
  [UserRole.EDITOR]: "Puede crear y editar contenido",
  [UserRole.ORGANIZER]: "Puede crear y gestionar torneos y equipos",
  [UserRole.MODERATOR]: "Puede moderar contenido y gestionar usuarios básicos",
  [UserRole.ADMIN]: "Acceso completo a todas las funcionalidades",
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: "Activo",
  [UserStatus.INACTIVE]: "Inactivo",
  [UserStatus.SUSPENDED]: "Suspendido",
  [UserStatus.PENDING]: "Pendiente",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  [UserRole.MODERATOR]:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  [UserRole.EDITOR]:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  [UserRole.ORGANIZER]:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  [UserRole.USER]:
    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

export const STATUS_COLORS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  [UserStatus.INACTIVE]:
    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  [UserStatus.SUSPENDED]:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  [UserStatus.PENDING]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
};

// Funciones de utilidad
export const canManageUser = (
  currentUserRole: UserRole,
  targetUserRole: UserRole,
): boolean => {
  return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[targetUserRole];
};

export const canAssignRole = (
  currentUserRole: UserRole,
  targetRole: UserRole,
): boolean => {
  return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[targetRole];
};

export const getRoleIcon = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return "👑";
    case UserRole.MODERATOR:
      return "🛡️";
    case UserRole.EDITOR:
      return "✏️";
    case UserRole.USER:
      return "👤";
    default:
      return "👤";
  }
};

export const getStatusIcon = (status: UserStatus): string => {
  switch (status) {
    case UserStatus.ACTIVE:
      return "✅";
    case UserStatus.INACTIVE:
      return "⚪";
    case UserStatus.SUSPENDED:
      return "🚫";
    case UserStatus.PENDING:
      return "⏳";
    default:
      return "❓";
  }
};
