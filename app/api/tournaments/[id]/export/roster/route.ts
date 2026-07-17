import { NextResponse } from "next/server";
import {
  getTournamentExportData,
  buildRosterCsv,
  exportFileSlug,
} from "@/lib/export/tournament-export";
import { hasFeature } from "@/lib/planLimits";

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
    return new NextResponse("Torneo no encontrado", { status: 404 });
  }

  if (!(await hasFeature(data.organizationId, "exportPdf"))) {
    return NextResponse.json(
      { error: "Exportar no está disponible en el plan de esta liga." },
      { status: 403 },
    );
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
