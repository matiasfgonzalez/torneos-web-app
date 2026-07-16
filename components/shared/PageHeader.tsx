import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumbs, type Breadcrumb } from "@/components/shared/Breadcrumbs";
import { cn } from "@/lib/utils";

export type { Breadcrumb };

/**
 * Header de página admin (F0) — las dos variantes documentadas en
 * docs/UI_PATTERNS.md §3:
 *
 * - `variant="showcase"` (default): header "Sistema activo" con Card
 *   decorativa — listados de gestión de volumen (torneos, equipos, ...).
 * - `variant="simple"`: ícono + título + descripción sin Card — pantallas
 *   de cuenta/configuración (plan, pagos, miembros, ...).
 */

export interface QuickStat {
  icon: LucideIcon;
  text: string;
  /** Par de clases bg/text semánticas con dark:. Default: marca. */
  colorClass?: string;
}

export interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  variant?: "showcase" | "simple";
  /** Texto junto al punto verde pulsante ("Sistema activo - N registros") */
  statusText?: string;
  quickStats?: QuickStat[];
  /** Acción principal (botón/diálogo de creación) a la derecha */
  actions?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
}

/**
 * Título de sección dentro de una página admin (F3): barra de acento de
 * marca + h2. Se repetía a mano en casi todas las pantallas del panel.
 */
export function SectionTitle({
  children,
  actions,
}: Readonly<{ children: React.ReactNode; actions?: React.ReactNode }>) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-brand to-brand-2 rounded-full" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {children}
        </h2>
      </div>
      {actions}
    </div>
  );
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  variant = "showcase",
  statusText,
  quickStats,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  if (variant === "simple") {
    return (
      <div>
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-brand to-brand-2 rounded-2xl flex items-center justify-center shadow-lg">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-brand to-brand-2 bg-clip-text text-transparent">
                {title}
              </h1>
              {description && (
                <p className="text-gray-600 dark:text-gray-300">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand/5 to-brand-2/5 dark:from-brand/10 dark:to-brand-2/10 rounded-3xl -z-10" />

      <Card className="border-2 border-brand/20 dark:border-brand/30 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-brand to-brand-2 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-brand to-brand-2 bg-clip-text text-transparent">
                    {title}
                  </h1>
                  {statusText && (
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full motion-safe:animate-pulse" />
                      <p className="text-gray-600 dark:text-gray-300 font-medium">
                        {statusText}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {description && (
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                  {description}
                </p>
              )}

              {quickStats && quickStats.length > 0 && (
                <div className="flex flex-wrap gap-4 pt-2">
                  {quickStats.map((stat) => {
                    const StatIcon = stat.icon;
                    return (
                      <div
                        key={stat.text}
                        className={cn(
                          "flex items-center space-x-2 px-3 py-1 rounded-full",
                          stat.colorClass ??
                            "bg-brand/10 dark:bg-brand/20 text-brand",
                        )}
                      >
                        <StatIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{stat.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {actions && <div className="w-full lg:w-auto">{actions}</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
