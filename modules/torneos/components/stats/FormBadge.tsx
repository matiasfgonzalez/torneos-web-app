import type { Outcome } from "@/lib/stats";
import { cn } from "@/lib/utils";

const STYLES: Record<Outcome, { label: string; className: string }> = {
  W: { label: "G", className: "bg-green-500 text-white" },
  D: { label: "E", className: "bg-gray-400 text-white dark:bg-gray-600" },
  L: { label: "P", className: "bg-red-500 text-white" },
};

const FULL: Record<Outcome, string> = {
  W: "Ganó",
  D: "Empató",
  L: "Perdió",
};

/**
 * Pastilla de un resultado (S7): G/E/P con color. La letra es local (Ganó/
 * Empató/Perdió), no W/D/L: es para el hincha, no para una API.
 */
export function FormBadge({
  outcome,
  size = "md",
}: Readonly<{ outcome: Outcome; size?: "sm" | "md" }>) {
  const { label, className } = STYLES[outcome];
  return (
    <span
      title={FULL[outcome]}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-bold",
        size === "sm" ? "h-5 w-5 text-[11px]" : "h-7 w-7 text-sm",
        className,
      )}
    >
      {label}
      <span className="sr-only">{FULL[outcome]}</span>
    </span>
  );
}
