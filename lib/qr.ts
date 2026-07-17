import QRCode from "qrcode";

/**
 * Genera un QR como **SVG** (S4).
 *
 * SVG y no PNG porque el caso de uso es imprimirlo y pegarlo en la cancha: un
 * vectorial se ve nítido a cualquier tamaño de papel, un PNG se pixela al
 * agrandarlo.
 *
 * Corrección de errores nivel **M** (~15%): el punto medio entre densidad y
 * tolerancia. Un QR impreso se moja, se dobla y se lee con la cámara a
 * contraluz; M aguanta ese maltrato sin volverse un ladrillo ilegible.
 *
 * Se genera en el server (no expone nada, no pesa en el cliente) y no lanza:
 * ante un fallo devuelve null y la página muestra el link igual.
 */
export async function tournamentQrSvg(url: string): Promise<string | null> {
  try {
    return await QRCode.toString(url, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 1,
      // Sin dimensión fija: el SVG hereda el tamaño del contenedor. El color se
      // deja en negro sobre blanco, que es lo que un lector espera y lo que
      // mejor imprime.
      color: { dark: "#000000", light: "#ffffff" },
    });
  } catch (error) {
    console.error("[qr] No se pudo generar el QR:", error);
    return null;
  }
}
