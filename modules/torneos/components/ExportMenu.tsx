"use client";

import { Download, FileText, Table2, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

/**
 * Exportar torneo (S8): tabla y fixture como PDF imprimible con branding, y los
 * planteles en CSV. Los PDF abren la vista imprimible en otra pestaña (desde
 * ahí "Guardar como PDF"); el CSV se descarga directo.
 *
 * Va en la cabecera pública del torneo (junto a Compartir) y en el panel admin.
 * `variant` adapta el disparador a la superficie:
 * - `hero`: sobre el hero oscuro público (pastilla blanca translúcida).
 * - `surface`: sobre un card claro/oscuro (botón outline de marca) — panel admin.
 */
export function ExportMenu({
  tournamentId,
  variant = "hero",
}: Readonly<{
  tournamentId: string;
  variant?: "hero" | "surface";
}>) {
  const printHref = (doc: "tabla" | "fixture" | "todo") =>
    `/print/torneo/${tournamentId}?doc=${doc}`;
  const csvHref = `/api/tournaments/${tournamentId}/export/roster`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "surface" ? (
          <Button
            variant="outline"
            className="w-full gap-2 border-brand/40 text-brand hover:border-brand hover:bg-brand/10 sm:w-auto dark:text-brand-2"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Exportar
          </Button>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Exportar
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Descargar / imprimir</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <a href={printHref("tabla")} target="_blank" rel="noopener noreferrer">
            <Table2 className="mr-2 h-4 w-4 text-[#ad45ff]" aria-hidden="true" />
            Tabla de posiciones (PDF)
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={printHref("fixture")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText
              className="mr-2 h-4 w-4 text-[#ad45ff]"
              aria-hidden="true"
            />
            Fixture y resultados (PDF)
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          {/* `download` fuerza la descarga; el server ya manda Content-Disposition */}
          <a href={csvHref} download>
            <Users className="mr-2 h-4 w-4 text-green-600" aria-hidden="true" />
            Planteles (CSV)
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
