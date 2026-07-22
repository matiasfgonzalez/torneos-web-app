import { ImageResponse } from "next/og";

import { getMatchOgData } from "@modules/partidos/actions/getMatchOgData";
import { MATCH_STATUS_LABELS } from "@/lib/constants";

/**
 * Imagen de previsualización de un partido (M3) — lo que se ve al pegar el link
 * en WhatsApp. Es el caso de compartir más frecuente de todos: nadie manda "mirá
 * la tabla", manda **el resultado**.
 *
 * Se genera en el server en cada scrapeo, así que el marcador que se ve es el
 * del momento: un partido que se compartió antes de empezar y se vuelve a
 * compartir al final muestra cosas distintas, que es lo correcto.
 *
 * Restricciones de `ImageResponse` (Satori): solo flexbox, nada de `grid`, y
 * todo contenedor con más de un hijo necesita `display: flex` explícito.
 */
export const alt = "Resultado del partido en GOLAZO";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = { id: string };

// Misma paleta que la OG del torneo, para que las dos previews se sientan
// parte de lo mismo.
const BG = "#1a0a2e";
const ACCENT = "#c77dff";
const ACCENT_2 = "#a3b3ff";

const EN_VIVO = ["EN_JUEGO", "ENTRETIEMPO"];
const CON_RESULTADO = ["FINALIZADO", "WALKOVER", "EN_JUEGO", "ENTRETIEMPO"];

export default async function Image({
  params,
}: {
  params: Promise<Params> | Params;
}) {
  const { id } = await params;
  const data = await getMatchOgData(id);

  if (!data) {
    return new ImageResponse(<BrandFallback />, size);
  }

  const enVivo = EN_VIVO.includes(data.status);
  const muestraMarcador =
    CON_RESULTADO.includes(data.status) &&
    data.homeScore != null &&
    data.awayScore != null;

  const statusLabel = enVivo
    ? "EN VIVO"
    : (MATCH_STATUS_LABELS[data.status as keyof typeof MATCH_STATUS_LABELS] ??
      data.status);

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
              alignItems: "center",
              gap: 12,
              padding: "10px 22px",
              borderRadius: 999,
              // El "en vivo" se distingue del resto: es el que hace que alguien
              // entre ahora y no después.
              background: enVivo ? "#dc2626" : "rgba(255,255,255,0.12)",
              border: enVivo
                ? "1px solid #ef4444"
                : "1px solid rgba(255,255,255,0.2)",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {statusLabel}
          </div>
        </div>

        {/* Marcador: el héroe de la imagen */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32,
          }}
        >
          <TeamSide name={data.homeName} align="flex-start" />

          {muestraMarcador ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 130,
                  fontWeight: 800,
                  letterSpacing: -6,
                  lineHeight: 1,
                }}
              >
                {data.homeScore} - {data.awayScore}
              </span>
              {data.decidedBy === "PENALES" &&
                data.penaltyHome != null &&
                data.penaltyAway != null && (
                  <span style={{ fontSize: 26, color: ACCENT_2, marginTop: 10 }}>
                    {data.penaltyHome} - {data.penaltyAway} en penales
                  </span>
                )}
              {data.decidedBy === "WALKOVER" && (
                <span style={{ fontSize: 26, color: ACCENT_2, marginTop: 10 }}>
                  Ganó por presentación
                </span>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 78, fontWeight: 800, letterSpacing: -3 }}>
                VS
              </span>
              <span style={{ fontSize: 28, color: ACCENT_2, marginTop: 8 }}>
                {formatKickoff(data.dateTime)}
              </span>
            </div>
          )}

          <TeamSide name={data.awayName} align="flex-end" />
        </div>

        {/* Pie: torneo + cancha */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 26,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            <span>
              {truncate(data.tournamentName, 40)}
              {data.organizationName
                ? ` · ${truncate(data.organizationName, 28)}`
                : ""}
            </span>
            {data.stadium && <span>{truncate(data.stadium, 26)}</span>}
          </div>
          <div
            style={{
              display: "flex",
              height: 8,
              borderRadius: 999,
              background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_2})`,
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}

/** Un lado del marcador. Los nombres largos se parten en dos líneas. */
function TeamSide({ name, align }: { name: string; align: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align,
        flex: 1,
        maxWidth: 380,
      }}
    >
      <span
        style={{
          fontSize: 46,
          fontWeight: 700,
          lineHeight: 1.1,
          textAlign: align === "flex-end" ? "right" : "left",
        }}
      >
        {truncate(name, 34)}
      </span>
    </div>
  );
}

/** Tarjeta de marca para links viejos o partidos borrados. */
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

/**
 * Día y hora del partido. Se formatea a mano y no con `Intl`: el runtime de
 * `ImageResponse` no garantiza los locales completos, y una fecha en inglés en
 * medio de una preview en español se nota.
 */
const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function formatKickoff(date: Date): string {
  const d = new Date(date);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MESES[d.getMonth()]} · ${hh}:${mm}`;
}

/** Satori no recorta texto solo; los nombres largos romperían el layout. */
function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
