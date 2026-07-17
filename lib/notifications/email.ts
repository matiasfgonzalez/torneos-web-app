import type { RenderedNotification } from "@/lib/notifications/catalog";
import { getBaseUrl } from "@/lib/urls";

/**
 * Envío de email de las notificaciones (S5), vía Resend.
 *
 * **Sin dependencia nueva.** Resend es una API HTTP de un endpoint; el SDK solo
 * envuelve un `fetch`. Un paquete más en el bundle del server, con su cadena de
 * versiones, no compra nada acá.
 *
 * **Sin RESEND_API_KEY, esto no explota: no hace nada.** La campana in-app
 * funciona igual, y el proyecto arranca en local sin cuenta de Resend. Un
 * email que no sale nunca debe voltear la acción que lo disparó (aprobar una
 * inscripción tiene que aprobar la inscripción).
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** Remitente. Debe ser un dominio verificado en Resend. */
const FROM = process.env.RESEND_FROM ?? "GOLAZO <onboarding@resend.dev>";

/**
 * Base para los links del email. En el email no sirve una URL relativa: se
 * abre fuera de la app. Acepta `null` (una notificación sin destino) y lo
 * propaga; la lógica de la URL base vive en `lib/urls.ts`, compartida con S4.
 */
export function appUrl(path: string | null): string | null {
  if (!path) return null;
  return `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** ¿Está configurado el envío? Falso en local sin cuenta: se saltea y ya. */
export function isEmailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

interface SendArgs {
  to: string;
  subject: string;
  html: string;
}

/**
 * Manda un email. Devuelve si salió — **nunca lanza**: quien llama está en
 * medio de una acción de negocio y un fallo del proveedor no es asunto suyo.
 */
export async function sendEmail({ to, subject, html }: SendArgs): Promise<boolean> {
  if (!isEmailEnabled()) return false;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });

    if (!res.ok) {
      // El cuerpo trae el motivo real (dominio sin verificar, rate limit…) y
      // sin él el log no sirve para nada.
      const detail = await res.text().catch(() => "");
      console.error(`[notificaciones] Resend ${res.status}: ${detail}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[notificaciones] Error al enviar email:", error);
    return false;
  }
}

/**
 * Plantilla del email de una notificación.
 *
 * HTML de tabla y estilos inline a propósito: Gmail borra el `<style>` del
 * `<head>` y Outlook ignora flexbox. Es feo y es lo que se ve bien.
 */
export function notificationEmailHtml(n: RenderedNotification): string {
  const link = appUrl(n.url);

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
      <tr>
        <td style="background:linear-gradient(90deg,#16a34a,#65a30d);padding:20px 24px;">
          <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">GOLAZO</span>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 24px;">
          <h1 style="margin:0 0 12px;font-size:19px;line-height:1.35;color:#18181b;">${escapeHtml(n.title)}</h1>
          ${
            n.body
              ? `<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#52525b;">${escapeHtml(n.body)}</p>`
              : ""
          }
          ${
            link
              ? `<a href="${escapeHtml(link)}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:15px;font-weight:600;">Verlo en GOLAZO</a>`
              : ""
          }
        </td>
      </tr>
      <tr>
        <td style="padding:16px 24px;background:#fafafa;border-top:1px solid #e4e4e7;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#71717a;">
            Recibís este mail porque tenés activadas las notificaciones de GOLAZO.
            <a href="${escapeHtml(appUrl("/notificaciones") ?? "#")}" style="color:#16a34a;">Cambiar preferencias</a>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Los nombres los escribe el usuario: un equipo "Los <b>Pibes" no rompe el mail. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
