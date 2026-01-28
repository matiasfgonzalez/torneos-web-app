import { UserRole } from "@prisma/client";
import { checkUser } from "./checkUser";
import { redirect } from "next/navigation";

/**
 * Role hierarchy for permission checking
 * Higher number = more permissions
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  USUARIO: 1,
  EDITOR: 2,
  ORGANIZADOR: 3,
  MODERADOR: 4,
  ADMINISTRADOR: 5,
};

/**
 * Defines which roles can access which admin routes
 */
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  "/admin/dashboard": ["ADMINISTRADOR", "MODERADOR", "EDITOR", "ORGANIZADOR", "USUARIO"],
  "/admin/noticias": ["ADMINISTRADOR", "EDITOR"],
  "/admin/torneos": ["ADMINISTRADOR", "EDITOR", "ORGANIZADOR"],
  "/admin/equipos": ["ADMINISTRADOR", "EDITOR", "ORGANIZADOR"],
  "/admin/jugadores": ["ADMINISTRADOR", "EDITOR", "ORGANIZADOR"],
  "/admin/arbitros": ["ADMINISTRADOR", "EDITOR", "ORGANIZADOR"],
  "/admin/usuarios": ["ADMINISTRADOR"],
  "/admin/partidos": ["ADMINISTRADOR", "ORGANIZADOR"],
  "/admin/estadisticas": ["ADMINISTRADOR"],
  "/admin/configuracion": ["ADMINISTRADOR"],
};

/**
 * Check if a user has the minimum required role
 */
export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if a user can access a specific route
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // Find the matching route pattern
  const routePattern = Object.keys(ROUTE_PERMISSIONS).find((pattern) => {
    // Exact match or starts with pattern
    return route === pattern || route.startsWith(pattern + "/");
  });

  if (!routePattern) {
    // Default: only ADMINISTRADOR can access undefined routes
    return userRole === "ADMINISTRADOR";
  }

  return ROUTE_PERMISSIONS[routePattern].includes(userRole);
}

/**
 * Check if a user can manage another user based on role hierarchy
 */
export function canManageUser(currentUserRole: UserRole, targetUserRole: UserRole): boolean {
  return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[targetUserRole];
}

/**
 * Check if a user can assign a specific role
 */
export function canAssignRole(currentUserRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Server-side role guard for admin pages
 * Use in page.tsx to validate access
 */
export async function validateAdminAccess(
  requiredRoles: UserRole[],
  redirectPath: string = "/admin/dashboard"
) {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!requiredRoles.includes(user.role)) {
    redirect(redirectPath);
  }

  return user;
}

/**
 * Get allowed roles for a route 
 */
export function getAllowedRoles(route: string): UserRole[] {
  const routePattern = Object.keys(ROUTE_PERMISSIONS).find((pattern) => {
    return route === pattern || route.startsWith(pattern + "/");
  });

  return routePattern ? ROUTE_PERMISSIONS[routePattern] : ["ADMINISTRADOR"];
}
