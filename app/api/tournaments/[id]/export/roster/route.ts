import { NextResponse } from "next/server";
import {
  getTournamentExportData,
  buildRosterCsv,
  exportFileSlug,
} from "@/lib/export/tournament-export";

/**
 * CSV de planteles del torneo (S8). GET público: expone lo mismo que ya se ve
 * en la web (equipo, dorsal, jugador, posición, capitán) — sin DNI. El torneo
 * eliminado (deletedAt) devuelve 404 vía el helper.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await getTournamentExportData(id);
  if (!data) {
    return new NextResponse("Torneo no encontrado", { status: 404 });
  }

  const csv = buildRosterCsv(data);
  const filename = `planteles-${exportFileSlug(data.name)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
