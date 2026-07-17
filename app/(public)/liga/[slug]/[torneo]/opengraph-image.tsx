import { ImageResponse } from "next/og";

import { getTournamentOgData } from "@modules/torneos/actions/getTorneoBySlug";
import { TOURNAMENT_STATUS_LABELS } from "@/lib/constants";

/**
 * Imagen de previsualización del torneo (S4) — lo que se ve al pegar el link en
 * WhatsApp, Instagram o Twitter. Es el gancho para que alguien entre.
 *
 * Se genera **en el server, en cada scrapeo**, con los datos de ese momento: si
 * el torneo ya arrancó muestra el top de la tabla; si todavía no, invita a
 * seguirlo. Un JPG estático quedaría viejo apenas se cargue un resultado.
 *
 * Restricciones de `ImageResponse` (Satori): solo flexbox, nada de `grid`, y
 * todo contenedor con más de un hijo necesita `display: flex` explícito.
 */
export const alt = "Previsualización del torneo en GOLAZO";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = { slug: string; torneo: string };

// Paleta del hero del torneo (HeaderTorneo), para que la preview y la página
// se sientan la misma cosa.
const BG = "#1a0a2e";
const ACCENT = "#c77dff";
const ACCENT_2 = "#a3b3ff";

export default async function Image({
  params,
}: {
  params: Promise<Params> | Params;
}) {
  const { slug, torneo } = await params;
  const data = await getTournamentOgData(slug, torneo);

  // El torneo puede no existir (link viejo) o el scraper pedir algo borrado:
  // una tarjeta de marca es mejor que un 500 que deja la preview en blanco.
  if (!data) {
    return new ImageResponse(<BrandFallback />, size);
  }

  const hasTable = data.standings.some((r) => r.matchesPlayed > 0);
  const statusLabel =
    TOURNAMENT_STATUS_LABELS[data.status] ?? String(data.status);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: `linear-gradient(135deg, ${BG} 0%, #2d1b4e 55%, ${BG} 100%)`,
          fontFamily: "sans-serif",
          color: "white",
        }}
      >
        {/* Encabezado: marca + estado */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                width: 56,
                height: 56,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})`,
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
              }}
            >
              🏆
            </div>
            <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1 }}>
              GOLAZO
            </span>
          </div>

          <div
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            {statusLabel}
          </div>
        </div>

        {/* Cuerpo: título + (tabla | invitación) */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <span style={{ fontSize: 26, color: ACCENT_2, marginBottom: 12 }}>
              {data.organizationName}
            </span>
            <span
              style={{
                fontSize: 68,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: -2,
              }}
            >
              {truncate(data.name, 42)}
            </span>
          </div>

          {hasTable ? (
            <MiniTable rows={data.standings} />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                minWidth: 300,
                padding: 28,
                borderRadius: 20,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <span style={{ fontSize: 30, fontWeight: 700 }}>
                {data.teamCount} equipos
              </span>
              <span style={{ fontSize: 24, color: "rgba(255,255,255,0.65)" }}>
                Seguí la tabla, el fixture y los goleadores en vivo.
              </span>
            </div>
          )}
        </div>

        {/* Pie: barra de acento */}
        <div
          style={{
            display: "flex",
            height: 8,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_2})`,
          }}
        />
      </div>
    ),
    size,
  );
}

/** Mini tabla de posiciones para la previsualización (top 5). */
function MiniTable({
  rows,
}: {
  rows: { name: string; points: number; matchesPlayed: number }[];
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minWidth: 380,
        padding: 24,
        borderRadius: 20,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 18,
          color: "rgba(255,255,255,0.55)",
          marginBottom: 8,
          paddingBottom: 8,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <span>#  Equipo</span>
        <span>PJ · Pts</span>
      </div>
      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            padding: "8px 0",
            fontWeight: i === 0 ? 700 : 400,
            color: i === 0 ? "#ffffff" : "rgba(255,255,255,0.85)",
          }}
        >
          <span style={{ display: "flex", gap: 12 }}>
            <span style={{ color: ACCENT }}>{i + 1}</span>
            <span>{truncate(row.name, 16)}</span>
          </span>
          <span>
            {row.matchesPlayed} · {row.points}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Tarjeta de marca para cuando no hay datos (link viejo o torneo borrado). */
function BrandFallback() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        background: `linear-gradient(135deg, ${BG}, #2d1b4e)`,
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <span style={{ fontSize: 64 }}>🏆</span>
      <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1 }}>
        GOLAZO
      </span>
      <span style={{ fontSize: 28, color: ACCENT_2 }}>
        Tu liga, en vivo y compartible.
      </span>
    </div>
  );
}

/** Satori no recorta texto solo; los nombres largos romperían el layout. */
function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
