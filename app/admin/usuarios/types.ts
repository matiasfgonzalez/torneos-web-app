import { UserRole, UserStatus } from "@/lib/generated/prisma/enums";

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

/**
 * `UserRole` y `UserStatus` son **los de Prisma**. Acá había copias locales, y
 * la de `UserRole` traía cinco valores —ADMINISTRADOR, MODERADOR, EDITOR,
 * ORGANIZADOR, USUARIO— contra los dos que existen en la base. No era un
 * duplicado inocente: los filtros de `/admin/usuarios` se arman con
 * `Object.values(UserRole)`, así que el panel ofrecía tres roles que ningún
 * usuario puede tener (filtrar por ellos daba siempre cero) y que el validador
 * Zod del PATCH rechaza con 400.
 *
 * El rol de trabajo por liga —el que esos valores intentaban nombrar— vive en
 * `OrganizationMember.role` (OWNER / ORGANIZADOR / COLABORADOR) y se gestiona
 * en `/admin/miembros`. Decisión D5.
 */
export { UserRole, UserStatus };

// Se borraron `IPermission`, `IRolePermissions`, `IUserActivity`,
// `IUserSession`, `IUserStats`, `IUserFilters`, `ICreateUserData` y
// `ROLE_DESCRIPTIONS`: describían pantallas que no existen (permisos por
// módulo, sesiones, alta manual de usuarios — las cuentas las crea Clerk) y
// solo los usaban los componentes muertos de `usuarios/components/`.

export interface IUpdateUserData {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
  location?: string;
  bio?: string;
  imageUrl?: string;
}

// La jerarquía de roles vive en `lib/userRoles.ts` (módulo puro que comparten
// el server y el panel). Acá había una paralela con los cinco roles fantasma y
// un `canManageUser` propio que nadie usaba.
export { canAssignRole, canManageUser } from "@/lib/userRoles";

// Etiquetas y colores: se reexportan los del design system con el nombre que ya
// usan estas pantallas (22 referencias cada uno). Antes estaban escritos otra
// vez acá — el badge de estado de usuario y esta tabla podían decir cosas
// distintas del mismo dato.
export {
  USER_ROLE_LABELS as ROLE_LABELS,
  USER_STATUS_LABELS as STATUS_LABELS,
} from "@/lib/constants";
export { USER_STATUS_COLORS as STATUS_COLORS } from "@/lib/status-colors";

/** Color del badge de rol. Propio del panel: no hay uno en el design system. */
export const ROLE_COLORS: Record<UserRole, string> = {
  ADMINISTRADOR: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  USUARIO: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

export const getRoleIcon = (role: UserRole): string =>
  role === "ADMINISTRADOR" ? "👑" : "👤";

export const getStatusIcon = (status: UserStatus): string => {
  switch (status) {
    case UserStatus.ACTIVO:
      return "✅";
    case UserStatus.INACTIVO:
      return "⚪";
    case UserStatus.SUSPENDIDO:
      return "🚫";
    case UserStatus.PENDIENTE:
      return "⏳";
    default:
      return "❓";
  }
};
