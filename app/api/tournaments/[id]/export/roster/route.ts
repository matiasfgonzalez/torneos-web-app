import { NextResponse } from "next/server";
import {
  getTournamentExportData,
  buildRosterCsv,
  exportFileSlug,
} from "@/lib/export/tournament-export";
import { hasFeature } from "@/lib/planLimits";
import { apiError } from "@/lib/apiResponse";

/**
 * CSV de planteles del torneo (S8). GET público: expone lo mismo que ya se ve
 * en la web (equipo, dorsal, jugador, posición, capitán) — sin DNI. El torneo
 * eliminado (deletedAt) devuelve 404 vía el helper.
 *
 * Gateado por la feature de plan `exportPdf` (la misma que el PDF): si el plan
 * de la liga no la incluye → 403. La UI ya no ofrece el menú en ese caso; esto
 * es la defensa en el server para la URL directa.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await getTournamentExportData(id);
  if (!data) {
    // A7: error como JSON `{ error }`, no texto plano. Este `new NextResponse`
    // se salvó del barrido de 2026-07-05 que eliminó los otros cinco.
    return apiError(404, "Torneo no encontrado");
  }

  if (!(await hasFeature(data.organizationId, "exportPdf"))) {
    return apiError(403, "Exportar no está disponible en el plan de esta liga.");
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
