import {
  BarChart3,
  Building2,
  Calendar,
  CreditCard,
  Home,
  Layers,
  Newspaper,
  Settings,
  Shield,
  Trophy,
  UserCheck,
  UserCheck2,
  Users,
  Users2,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * Navegación del panel — fuente única (F3, 2026-07-14).
 *
 * La consumen el sidebar (`components/admin/sidebar.tsx`) y el command palette
 * (`components/admin/CommandPalette.tsx`). Vivía dentro del sidebar; al sumar el
 * palette, copiarla habría creado dos menús que divergen en silencio — el error
 * que ya cometimos con los dos footers y los dos `STATUS_BADGE`.
 *
 * Al agregar una ruta admin: sumá un objeto acá y aparece en los dos lugares.
 *
 * Roles de PLATAFORMA (N1): ADMINISTRADOR | USUARIO. El acceso fino por
 * organización lo validan los layouts/APIs; acá USUARIO = miembro de
 * organización con acceso al panel.
 */
export interface AdminNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** `false` = ítem visible pero deshabilitado ("próximamente"). */
  enabled: boolean;
  roles: string[];
  /** Sinónimos para que el palette encuentre la sección por lo que se escribe. */
  keywords?: string[];
}

export const adminNavItems: AdminNavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: Home,
    enabled: true,
    roles: ["ADMINISTRADOR", "USUARIO"],
    keywords: ["inicio", "panel", "resumen", "kpi"],
  },
  {
    title: "Noticias",
    href: "/admin/noticias",
    icon: Newspaper,
    enabled: true,
    roles: ["ADMINISTRADOR"],
    keywords: ["articulos", "notas", "prensa"],
  },
  {
    title: "Torneos",
    href: "/admin/torneos",
    icon: Trophy,
    enabled: true,
    roles: ["ADMINISTRADOR", "USUARIO"],
    keywords: ["ligas", "copas", "campeonatos", "fixture"],
  },
  {
    title: "Equipos",
    href: "/admin/equipos",
    icon: Users,
    enabled: true,
    roles: ["ADMINISTRADOR", "USUARIO"],
    keywords: ["clubes", "planteles"],
  },
  {
    title: "Jugadores",
    href: "/admin/jugadores",
    icon: UserCheck,
    enabled: true,
    roles: ["ADMINISTRADOR", "USUARIO"],
    keywords: ["futbolistas", "plantel", "fichas"],
  },
  {
    title: "Árbitros",
    href: "/admin/arbitros",
    icon: Shield,
    enabled: true,
    roles: ["ADMINISTRADOR", "USUARIO"],
    keywords: ["arbitros", "jueces", "terna", "referees"],
  },
  {
    title: "Partidos",
    href: "/admin/partidos",
    icon: Calendar,
    enabled: true,
    roles: ["ADMINISTRADOR", "USUARIO"],
    keywords: ["encuentros", "fixture", "resultados", "fechas"],
  },
  {
    title: "Solicitudes",
    href: "/admin/delegados",
    icon: UserCheck2,
    enabled: true,
    roles: ["ADMINISTRADOR", "USUARIO"],
    keywords: [
      "delegados",
      "inscripciones",
      "representantes",
      "fichas",
      "reclamos",
      "aprobar",
    ],
  },
  {
    title: "Miembros",
    href: "/admin/miembros",
    icon: UsersRound,
    enabled: true,
    roles: ["ADMINISTRADOR", "USUARIO"],
    keywords: ["equipo de trabajo", "invitaciones", "organizacion"],
  },
  {
    title: "Plan y Pagos",
    href: "/admin/plan",
    icon: CreditCard,
    enabled: true,
    roles: ["ADMINISTRADOR", "USUARIO"],
    keywords: ["suscripcion", "facturacion", "limites", "upgrade"],
  },
  {
    title: "Usuarios",
    href: "/admin/usuarios",
    icon: Users2,
    enabled: true,
    roles: ["ADMINISTRADOR"],
    keywords: ["cuentas", "roles", "permisos"],
  },
  {
    title: "Organizaciones",
    href: "/admin/organizaciones",
    icon: Building2,
    enabled: true,
    roles: ["ADMINISTRADOR"],
    keywords: ["ligas", "tenants", "clientes"],
  },
  {
    title: "Planes",
    href: "/admin/planes",
    icon: Layers,
    enabled: true,
    roles: ["ADMINISTRADOR"],
    keywords: ["precios", "features", "limites"],
  },
  {
    title: "Aprobar Pagos",
    href: "/admin/pagos",
    icon: Wallet,
    enabled: true,
    roles: ["ADMINISTRADOR"],
    keywords: ["cobros", "transferencias", "comprobantes"],
  },
  {
    title: "Estadísticas",
    href: "/admin/estadisticas",
    icon: BarChart3,
    enabled: false,
    roles: ["ADMINISTRADOR"],
    keywords: ["metricas", "reportes"],
  },
  {
    title: "Configuración",
    href: "/admin/configuracion",
    icon: Settings,
    enabled: true,
    roles: ["ADMINISTRADOR"],
    keywords: ["ajustes", "contacto", "redes", "sitio"],
  },
];

/** Ítems que el rol puede ver. */
export const navItemsForRole = (role: string | null): AdminNavItem[] =>
  adminNavItems.filter((item) => item.roles.includes(role ?? "viewer"));

/**
 * Título de la sección que contiene una ruta (por prefijo, igual que el
 * resaltado del sidebar). Lo usa el breadcrumb de las subpáginas.
 */
export const sectionForPath = (pathname: string): AdminNavItem | undefined =>
  adminNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
