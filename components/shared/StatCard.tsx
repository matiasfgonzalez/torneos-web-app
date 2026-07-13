import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Tarjeta de KPI unificada del panel admin (F0) — reemplaza las 3
 * implementaciones idénticas de StatsCards (torneos/equipos/jugadores).
 *
 * `gradient`/`bgGradient` son clases `from-* to-*` (deben ser literales para
 * que Tailwind las compile). Default: gradiente de marca.
 */
export interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  /** Clases from/to del ícono y la barra. Default: marca. */
  gradient?: string;
  /** Clases from/to del fondo sutil. Default: marca al 10%. */
  bgGradient?: string;
  /** 0-100 → barra de progreso decorativa. Omitir para ocultarla. */
  progress?: number;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  gradient = "from-brand to-brand-2",
  bgGradient = "from-brand/10 to-brand-2/10",
  progress,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-2 border-gray-100 dark:border-gray-700 hover:border-brand/30 dark:hover:border-brand/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-gray-800",
        className,
      )}
    >
      {/* Background gradient sutil */}
      <div
        className={cn("absolute inset-0 bg-gradient-to-br opacity-50", bgGradient)}
      />

      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </CardTitle>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </div>
        </div>

        <div
          className={cn(
            "p-3 rounded-xl bg-gradient-to-r shadow-lg group-hover:scale-110 transition-transform duration-300",
            gradient,
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </CardHeader>

      {(description || progress !== undefined) && (
        <CardContent className="relative pt-0">
          {description && (
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {description}
              </p>
            </div>
          )}

          {progress !== undefined && (
            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div
                className={cn(
                  "h-1 bg-gradient-to-r rounded-full transition-all duration-500",
                  gradient,
                )}
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

/** Grid estándar de 4 StatCards del panel admin. */
export function StatCardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  );
}
